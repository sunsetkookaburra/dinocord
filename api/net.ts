// Copyright (c) 2020 Oliver Lenehan. All rights reserved. MIT license.

import { WebSocket, isWebSocketCloseEvent, connectWebSocket, WebSocketEvent, LibraryMeta, yamlStringify, deferred } from '../deps.ts';
import { Snowflake, GatewayOpcode, GatewayPayload, Presence } from './data_objects.ts';
import { AsyncServiceQueue, AsyncEventQueue } from './queue.ts';
import { dinoLog } from './debug.ts';

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

/*
export async function createClientContext( token: string, initialPresence?: Presence ){
	let http = new DiscordHTTPClient(token);
	let gateway: string = (await http.requestJson<any>('GET','/gateway'))['url'];
	let ws = new DiscordWSClient(gateway, token);
	await ws.init(initialPresence)
	let ctx = new ClientContext(http, ws);
	return ctx;
}*/

export class ClientContext {
	// any time a data object is created, cache it
	cache: Map<Snowflake, unknown>;
	http: DiscordHTTPClient;
	ws: DiscordWSClient;
	constructor( http: DiscordHTTPClient, ws: DiscordWSClient ){
		this.cache = new Map();
		this.http = http;
		this.ws = ws;
	}
}

// done as far as a working solution, just a bit of polish
export class DiscordHTTPClient
{
	static Endpoint = 'https://discordapp.com/api/v6';
	static UserAgent = `DiscordBot (${LibraryMeta.url}, ${LibraryMeta.version}) Deno/${Deno.version.deno}`;
	private headers: Headers;
	private queue = new AsyncServiceQueue();
	private buckets = new Map<Snowflake, Bucket>();
	constructor( token: string ){
		this.headers = new Headers([
			['Authorization', `Bot ${token}`],
			['User-Agent', DiscordHTTPClient.UserAgent],
			['X-RateLimit-Precision', 'second'],
		]);
	}
	static route(path: string, substitutions?: {[key: string]: string} ): Route {
		return {
			resources: [path],
			url: (()=>{
				let url = path;
				// return unmodified url if there are no substitutions to be made
				if( substitutions === undefined ) return url;
				for( let k of Object.keys(substitutions) ){
					url = url.replace(':'+k, Deno.inspect(substitutions[k]));
				}
				return url;
			})()
		}
	}
	async request( method: HTTPMethod, path: string, options?: RequestOptions ){
		// format path for api
		let route = DiscordHTTPClient.route(path, options?options.substitutions:undefined);
		// check bucket
		for( let [key, bucket] of this.buckets ){
			// if bucket low, wait until refill
			if( path === bucket.path && bucket.remaining < 1 ){
				await waitableDate(new Date(bucket.reset));
			}
			else if(path === bucket.path) {
				bucket.remaining--;
			}
		}
		// serve the request
		// route.resources is passed as require resources, the callback is called when they first become available
		let result = await this.queue.serve<Response>(route.resources, async()=>{
			let body: string | null = null; // consider making Uint8Array
			if( options === undefined){}
			else if( options.type === 'json' ){
				this.headers.set('Content-Type', 'application/json');
				body = JSON.stringify(body);
			}
			/* IMPLEMENT FOR FILES
			else if( options.type === 'form' ){
				let boundary = '----DiscordFormBoundary'+Array.from(crypto.getRandomValues(new Uint32Array(2))).map(v=>v.toString(36)).join('');
				this.headers.set('Content-Type', 'multipart/form-data; boundary='+boundary);
				for( let key of Object.keys(options.body) ){
					body += boundary+'\r\n';
					body += 'Content-Disposition: form-data; name="'+key+'"'+'\r\n\r\n'
					body += DATA
					body += '\r\n'
				}
				body += boundary+'--'
			}*/
			let result = await fetch(DiscordHTTPClient.Endpoint+route.url, {
				'method': method,
				'headers': this.headers,
				'body': body
			});
			this.headers.delete('Content-Type');
			return result;
		});
		// check for rate-limit headers
		if( result.headers.has('X-RateLimit-Bucket') ){
			let bucketId = result.headers.get('X-RateLimit-Bucket') as Snowflake;
			if( this.buckets.has(bucketId) ){
				if( path !== this.buckets.get(bucketId)!.path) console.log('AAAAAAAA RATE LIMIT BUCKET PATHS CHANGE !!!!');
				this.buckets.get(bucketId)!.limit = Number(result.headers.get('X-RateLimit-Limit'));
				this.buckets.get(bucketId)!.remaining = Number(result.headers.get('X-RateLimit-Remaining'));
				this.buckets.get(bucketId)!.reset = Number(result.headers.get('X-RateLimit-Reset'));
				this.buckets.get(bucketId)!.path = path;
			}
			else {
				this.buckets.set(bucketId, {
					limit: Number(result.headers.get('X-RateLimit-Limit')),
					remaining: Number(result.headers.get('X-RateLimit-Remaining')),
					reset: Number(result.headers.get('X-RateLimit-Reset')),
					path: path
				});
			}
		}
		return result;
	}
	// Returns result as an object.
	async requestJson<T>( method: HTTPMethod, path: string, options?: RequestOptions ){
		const r = await this.request(method, path, options);
		return r.json() as Promise<T>;
	}
}

class Heart {
	private timerID: number | null = null;
	private wasAck: boolean = false;
	constructor(private onBeat: () => void, private onStop?: () => void){}
	start(interval: number){
		if (this.timerID !== null) clearInterval(this.timerID);
		this.onBeat();
		this.timerID = setInterval(()=>{
			if (!this.wasAck) this.stop();
			else this.onBeat();
			this.wasAck = false; //reset flag
		}, interval);
	}
	acknowledge(){
		this.wasAck = true;
	}
	stop(){
		if (this.timerID !== null) clearInterval(this.timerID);
		this.wasAck = false;
	}
}

export class DiscordWSClient {
	// "subscribeable" queue of events (limit chance of mucking up async generator code)
	public eventQueue: AsyncEventQueue<GatewayPayload>;
	private gateway: string;
	private token: string;
	private discordEndpointQueue: AsyncEventQueue<GatewayPayload>;
	private socket: WebSocket | null = null;
	private listener: AsyncIterableIterator<WebSocketEvent> | null = null;
	private heart: Heart;
	private sequenceID: number | null = null;
	private readyEventReceived = deferred<GatewayPayload>()

	constructor( token: string, gateway: string ){
		this.gateway = gateway + '?v=6&encoding=json';
		this.token = token;
		this.discordEndpointQueue = new AsyncEventQueue<GatewayPayload>(550, async(payload)=>{
			dinoLog('debug', 'endpoint sending:'+JSON.stringify(payload));
			if( !this.socket?.isClosed ) this.socket!.send(JSON.stringify(payload));
			else this.discordEndpointQueue.exit();
		});
		this.discordEndpointQueue.run();
		this.eventQueue = new AsyncEventQueue();
		this.heart = new Heart(()=>{
			// send heartbeat to discord
			dinoLog('debug', 'Sent heartbeat.');
			this.sendPayload({
				op: GatewayOpcode.HEARTBEAT,
				d: this.sequenceID
			});
		}, this.disconnect.bind(this)); // bind to allow using class vars. this will break the websocket on a disconnection
	}
	sendPayload(p: GatewayPayload){
		this.discordEndpointQueue.post(p);
	}
	// init socket, begin heartbeat, then return
	async init(){
		this.socket = await connectWebSocket(this.gateway);
		this.listener = this.socket.receive();
		let firstMsg = JSON.parse((await this.listener.next()).value) as GatewayPayload;
		if (firstMsg.op !== GatewayOpcode.HELLO) dinoLog('critical', 'Expected HELLO as first gateway message, received the following instead: '+JSON.stringify(firstMsg.op));
		this.heart.start(firstMsg.d['heartbeat_interval']);
		dinoLog('info', 'WebSocket opened and heartbeating.');
		// run message loop
		this.messageLoop();
	}
	// send identify payload, then await and return READY
	async identify(presenceInit: Presence){
		this.sendPayload({
			op: GatewayOpcode.IDENTIFY,
			d: {
				'token': this.token,
				'properties': {
					'$os': Deno.build.os,
					'$browser': 'dinocord',
					'$device': 'dinocord'
				},
				'presence': presenceInit
			}
		});
		return this.readyEventReceived;
	}
	async disconnect(){
		this.socket!.close(500);
	}
	private async messageLoop(){
		let payload: GatewayPayload;
		for await (const msg of this.listener!){
			if( typeof msg === "string" ){
				payload = JSON.parse(msg);
				if( payload.op === GatewayOpcode.HEARTBEAT_ACK ){
					dinoLog('debug', 'Received heartbeat ACK.');
					this.heart.acknowledge();
				}
				else if( payload.t === 'READY' ){
					this.readyEventReceived.resolve(payload);
				}
				else if( payload.op === GatewayOpcode.DISPATCH ){
					this.eventQueue.post(payload);
				}
				else {
					dinoLog('debug', '================================');
					dinoLog('debug', yamlStringify(payload));
				}
			}
			else if( isWebSocketCloseEvent(msg) ){
				// log closure of socket
				dinoLog('info', 'WebSocket connection closed.');
				break;
			}
		}
	}
}

class OldDiscordWSClient
{
	private socket: WebSocket = null as unknown as WebSocket;
	private sessionID: string | null = null;
	private heart = {id: null as unknown as number, interval: 0, wasAck: true};
	private sequenceID: number | null = null;
	private listener: AsyncIterableIterator<WebSocketEvent> | null = null;
	private discordSendQueue = new AsyncEventQueue<GatewayPayload>(550);
	constructor( private gateway: string, private token: string ){
		this.gateway = gateway + '?v=6&encoding=json';
	}
	async init( initialPresence?: Presence ){
		this.socket = await connectWebSocket(this.gateway);
		this.listener = this.socket.receive();
		// NEEDS TO BE TIED TO SOCK LISTENER TO CHECK IT ACTUALLY IS HELLO PAYLOAD
		// receive hello payload
		let hello = JSON.parse((await this.listener!.next()).value);
		this.heart.interval = hello!['d']['heartbeat_interval'];
		// begin heartbeat
		this.heartbeat();
		this.heart.id = setInterval(this.heartbeat.bind(this), this.heart.interval);
		// begin sendqueue, because this is a closure, it will keep running in the background even once init returns
		// consider use of a handler on AsyncEventQueue
		(async()=>{
			for await( const p of this.discordSendQueue ){
				await this.socket.send(JSON.stringify(p));
			}
		})();
		// identify the client.
		this.sendPayload({
			op: GatewayOpcode.IDENTIFY,
			d: {
				'token': this.token,
				'properties': {
					'$os': Deno.build.os,
					'$browser': 'dinocord',
					'$device': 'dinocord'
				},
				'presence': initialPresence
			}
		});
	}
	// needs to handle resume
	async *listen(){
		// mainloop / listener
		let payload: GatewayPayload | null = null;
		for await( const msg of this.listener! ){
			if( typeof msg === "string" ){
				payload = this.decodePayload(msg);
				if( payload.op === GatewayOpcode.HEARTBEAT_ACK ){
					this.heart.wasAck = true;
				}
				else if( payload.op === GatewayOpcode.DISPATCH ){
					yield payload;
				}
				else {
					console.log('================================');
					console.log(yamlStringify(payload));
				}
			}
			else if( isWebSocketCloseEvent(msg) ){
				// log closure of socket
				break;
			}
		}
	}
	private async heartbeat(){
		// check if discord replied in time
		if( !this.heart.wasAck ){
			this.discordSendQueue.exit();
			clearInterval(this.heart.id);
			await this.socket.close(500);
		}
		else {
			// add ack to sendQueue
			this.heart.wasAck = false;
			this.sendPayload({
				op: GatewayOpcode.HEARTBEAT,
				d: this.sequenceID
			});
		}
	}
	private decodePayload(msg: string){
		return (JSON.parse(msg) as GatewayPayload)
	}
	// recognise hard limit of 4096 bytes for a payload
	sendPayload( payload: GatewayPayload ) {
		this.discordSendQueue.post(payload);
	}
	
}

// Types and Interfaces

type HTTPMethod = 'GET' | 'POST' | 'PUT' | 'DELETE' | 'PATCH'

interface Bucket {
	limit:		number;
	remaining:	number;
	reset:		number;
	path:		string;
}

// convert to an interface
type RequestOptions = (
		{type: 'none'} |
		{type: 'json', body: any} |
		{type: 'form', body: any, fileMimeType: string}
	) & 
		{substitutions?: {[key: string]: string}}

interface Route {
	url: string;
	resources: string[];
}

interface Bucket {
	limit:		number;
	remaining:	number;
	reset:		number;
	path:		string;
}
