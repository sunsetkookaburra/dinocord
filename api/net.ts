// Copyright (c) 2020 Oliver Lenehan. All rights reserved. MIT license.

import { LibraryMeta } from "../deps.ts";
import { BucketPool } from "./bucket.ts";

/** HTTP Methods */
type HTTPMethod = "GET" | "POST" | "PUT" | "DELETE" | "PATCH";

export enum HTTPCode {
	OK					= 200,
	CREATED				= 201,
	NO_CONTENT			= 204,
	NOT_MODIFIED		= 304,
	BAD_REQUEST			= 400,
	UNAUTHORISED		= 401,
	FORBIDDEN			= 403,
	NOT_FOUND			= 404,
	METHOD_NOT_ALLOWED	= 405,
	TOO_MANY_REQUESTS	= 429,
	SERVER_ERROR		= 500,
	GATEWAY_UNAVAILABLE	= 502
};

/** Discord Base Urls */
const Endpoint = {
	api: "https://discordapp.com/api/v6",
	cdn: "https://cdn.discordapp.com",
	gateway: "wss://gateway.discord.gg/?v=6&encoding=json"
};

/** Describes the type of API. Required by Discord API. */
const UserAgent = "DiscordBot ("+LibraryMeta.url+", "+LibraryMeta.version+") Deno/"+Deno.version.deno;

/** CDN Endpoint Templates */
const CDNTemplates = {
	emoji:				"/emojis/:emojiId.png",
	guildIcon:			"/icons/:guildId/:guildIcon.png",
	guildSplash:		"/splashes/:guildId/:guildSplash.png",
	guildBanner:		"/splashes/:guildId/:guildBanner.png",
	defaultUserAvatar:	"/embed/avatars/:userDiscriminator.png",
	userAvatar:			"/avatars/:userId/:userAvatar.png",
	teamIcon:			"/team-icons/:teamId/:teamIcon.png"
};

async function sleep( ms: number ): Promise<void> {
	return new Promise(resolve=>{setTimeout(resolve, ms)});
}

async function waitableDate( date: Date ): Promise<void> {
	let timerId: number;
	return new Promise(resolve=>{
		timerId = setInterval(()=>{
			if( Date.now() > date.valueOf() ){
				clearInterval(timerId);
				resolve();
			}
		}, 100); // wait 100ms until retry
	});
}

class ServiceQueue // to become async
{
	private _busyServices: Set<any> = new Set();
	private _customers: {customerServices: any[], onServed: ()=>Promise<void>}[] = [];

	isBusy( customerServices: any[] ){
		for (let s of customerServices) if (this._busyServices.has(s)) return true;
		return false;
	}

	/** Serve customer on arrival, or add to queue. */
	serve( customerServices: any[], onServed: ()=>Promise<void> ){
		if( this.isBusy(customerServices) ) this._customers.push({customerServices, onServed});
		else {
			for( let s of customerServices ) this._busyServices.add(s);
			onServed().then(()=>{
				this._free(customerServices);
			});
		}
	}

	/** Free up services. */
	private _free( customerServices: any[] ){
		for( let s of customerServices ) this._busyServices.delete(s);
		// serve customers not requiring currently busy services
		for( let i = 0; i < this._customers.length; i++ ){
			if( !this.isBusy(this._customers[i].customerServices) ){
				for( let s of customerServices ) this._busyServices.add(s);
				this._customers[i].onServed().then(()=>{
					this._free(this._customers.splice(i,1)[0].customerServices);
				});
			}
		}
	}
}

// DEPRECATED
// IMPLEMENT QUEUE CLASS for callers
/** Small array extension to check whether resources are taken, and also unlock resources. */
class ResourcePool extends Set<string> {
	private _availableCallers: [string[], () => void][] = []; // contains resources in [0] and resolve in [1]
	/** Checks whether the resources are already in use. */
	inUse( resources: string[] ): boolean {
		for (let r of resources) {
			if (this.has(r)) return true;
		}
		return false;
	}
	/** Lock the specified resources, allowed even if already taken. */
	lock( resources: string[] ) {
		for (let r of resources) {
			this.add(r);
		}
	}
	/** Unlock the specified resources. */
	unlock( resources: string[] ) {
		for (let r of resources) {
			this.delete(r);
		}
		this.serveWaitingCallers();
	}
	/** Serve new caller */
	serveNewCaller(){

	}
	/** Serve awaitingCallers. NEED TO ENSURE ASYNC LOCK SO CALLERS DONT OVERLAP RESOURCES. */ 
	serveWaitingCallers(){
		for (let waitingCaller of this._availableCallers) {
			if (!this.inUse(waitingCaller[0])) {
				this.lock(waitingCaller[0]);
				waitingCaller[1]();
				this._availableCallers.filter(v=>v!==waitingCaller);
				//this.unlock(waitingCaller[0]);
			}
		}
	}
	/** When awaited, will wait until resource is available. Resolves when _onAvailable is called. */
	async untilAvailable( resources: string[] ): Promise<void> {
		return new Promise(r=>{
			this._availableCallers.push([resources, r]);
			this.serveWaitingCallers();
		});
	}
}

/** Substitutions for route. */
interface RouteOptions {
	[key: string]: any;
}

/** Wrapper around REST API URLs. Ensure resources are shared 
 * 	and not used at the same time to allow Bucket / Rate
 * 	management. */
export class Route
{
	/** Formatted API Endpoint */
	url: string;

	/** Raw path, unformatted. */
	path: string;

	/** Resources required to use this path. */
	readonly resources: string[];

	constructor( public method: HTTPMethod, path: string, substitutions?: RouteOptions ) {
		// Extract "Major Parameters" as resources.
		this.resources = /:channelId|:messageId|:webhookId/g.exec(path) || [];

		// Add current path as a resource.
		this.resources.push(path);
		this.resources.push(method);

		// Substitue values e.g. :channelId => {SNOWFLAKE}
		if (substitutions !== undefined) {
			for( let k of Object.keys(substitutions) ){
				path = path.replace(':'+k, Deno.inspect(substitutions[k]));
			}
		}
		
		// Set url to api endpoint + path.
		this.url = Endpoint.api + path;
		this.path = path;
	}
}

class DiscordHTTPClient
{
	private _headers: Headers;
	private _jsonHeaders: Headers;

	constructor( token: string ) {
		this._headers = new Headers([
			["Authorization", "Bot "+token],
			["User-Agent", UserAgent],
			["X-RateLimit-Precision", "second"],
		]);
		this._jsonHeaders = new Headers([
			["Authorization", "Bot "+token],
			["User-Agent", UserAgent],
			["Content-Type", "application/json"],
			["X-RateLimit-Precision", "second"],
		]);
	}

	/** Request from route endpoint. <T> is the type of object returned. */
	async request( route: Route, data?: any ): Promise<Response> {
		//console.log('================');
		//console.log('METHOD:', route.method);
		//console.log('HEADERS...');
		//for( let [key, value] of this._headers ){
		//	console.log(key,':',value)
		//}
		let r: Response;
		if( data !== undefined ){
			r = await fetch(route.url, {
				"method": route.method,
				"headers": this._jsonHeaders,
				"body": JSON.stringify(data)
			});
		}
		else {
			r = await fetch(route.url, {
				"method": route.method,
				"headers": this._headers
			});
		}
		//console.log('RESULT_HEADERS...');
		//for( let [key, value] of r.headers ){
		//	console.log(key,':',value)
		//}
		//console.log('RESULT_BODY...');
		//console.log(await r.text());
		//console.log('================');
		if (r.status === HTTPCode.UNAUTHORISED)
			throw new Error("Unauthorised to: "+route.url);
		else if (r.status === HTTPCode.TOO_MANY_REQUESTS)
			throw new Error("Damn! Rate limited.");
		return r;
	}
}

/** Websocket client */
class DiscordWSClient {

}

export class NetworkHandler
{
	private _http:	DiscordHTTPClient;
	private _ws:	DiscordWSClient;
	private _queue:	ServiceQueue; // prevents burning out buckets by ensuring tasks happen when the resources are available.
	private _bucket:BucketPool; // prevents overfilling rate limit buckets

	constructor( token: string )
	{
		this._http = new DiscordHTTPClient(token);
		this._ws = new DiscordWSClient();
		this._queue = new ServiceQueue();
		this._bucket = new BucketPool();
	}
	
	// data = json to be sent with request
	async request( method: HTTPMethod, path: string, substitutions?: RouteOptions, data?: any ): Promise<Response> {
		const route = new Route(method, path, substitutions);
		// need to double check if rate limits are per path, or an intersection of path and method and major_parameter
		// assumption is per path/url/endpoint
		// check bucket, if empty wait for refill
		for( let [key, value] of this._bucket ){
			if( value.path === route.path && value.remaining < 2 ){
				await waitableDate(new Date(value.reset));
			}
		}
		const result = await new Promise<Response>(async resolve=>{
			this._queue.serve([route.path], async()=>{
				resolve(await this._http.request(route, data));
			});
		});
		//console.log("SUCCEEDED REQUEST");
		// Rate limiting
		if( result.headers.has('X-RateLimit-Bucket') ){
			let bucketId = result.headers.get('X-RateLimit-Bucket');
			if( this._bucket.has(bucketId) ){
				if( route.path !== this._bucket.get(bucketId).path) console.log("AAAAAAAA ROUTE LIMIT PATHS CHANGE !!!!");
				this._bucket.get(bucketId).limit = Number(result.headers.get('X-RateLimit-Limit'));
				this._bucket.get(bucketId).remaining = Number(result.headers.get('X-RateLimit-Remaining'));
				this._bucket.get(bucketId).reset = Number(result.headers.get('X-RateLimit-Reset'));
				this._bucket.get(bucketId).path = route.path;
			}
			else {
				this._bucket.set(bucketId, {
					limit: Number(result.headers.get('X-RateLimit-Limit')),
					remaining: Number(result.headers.get('X-RateLimit-Remaining')),
					reset: Number(result.headers.get('X-RateLimit-Reset')),
					path: route.path
				});
			}
		}
		return result;
	}

	async requestJson<T>( method: HTTPMethod, path: string, substitutions?: RouteOptions, data?: any ): Promise<T> {
		return (await this.request(method, path, substitutions, data)).json();
	}

}
