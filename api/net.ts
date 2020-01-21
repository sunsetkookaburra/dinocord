// Copyright (c) 2020 Oliver Lenehan. All rights reserved. MIT license.

import { LibraryMeta } from "../deps.ts";
import { Snowflake } from "./snowflake.ts";
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

// CONSIDER USING SETS HERE FOR EASY CHECKING
/** Small array extension to check whether resources are taken, and also unlock resources. */
class ResourcePool {
	/** A list of the resources currently locked. */
	private resources: string[] = [];
	/** Checks whether the resources are already in use. */
	inUse( resources: string[] ): boolean {
		for (let i = 0; i < resources.length; i++) {
			if (this.resources.includes(resources[i])) return true;
		}
		return false;
	}
	/** Lock the specified resources, allowed even if already taken. */
	lock( resources: string[] ) {
		for (let i = 0; i < resources.length; i++) {
			if (!this.resources.includes(resources[i])){
				this.resources.push(resources[i]);
			}
		}
	}
	/** Unlock the specified resources. */
	unlock( resources: string[] ) {
		this.resources = this.resources.filter(res=>{
			return !resources.includes(res);
		});
	}
}

/** Substitutions for route. */
interface RouteOptions {
	channelId?:	Snowflake;
	guildId?:	Snowflake;
	userId?:	Snowflake;
	webhookId?:	Snowflake;
}

/** Wrapper around REST API URLs. Ensure resources are shared 
 * 	and not used at the same time to allow Bucket / Rate
 * 	management. */
export class Route
{
	/** Formatted API Endpoint */
	url: string;

	/** Resources required to use this path. */
	readonly resources: string[];

	constructor( public method: HTTPMethod, path: string, substitutions?: RouteOptions ) {
		// Extract "Major Parameters" as resources.
		this.resources = /:channelId|:messageId|:webhookId/g.exec(path) || [];

		// Add current path as a resource.
		this.resources.push(path);
		this.resources.push(method);

		// Substitue values e.g. :channelId => {SNOWFLAKE}
		if (substitutions) {
			if (substitutions.channelId) path.replace(':channelId', substitutions.channelId);
			if (substitutions.guildId) path.replace(':channelId', substitutions.guildId);
			if (substitutions.userId) path.replace(':channelId', substitutions.userId);
			if (substitutions.webhookId) path.replace(':channelId', substitutions.webhookId);
		}
		
		// Set url to api endpoint + path.
		this.url = Endpoint.api + path;
	}
}

class DiscordHTTPClient
{
	private _headers: Headers;

	constructor( token: string ) {
		this._headers = new Headers([
			["Authorization", "Bot "+token],
			["User-Agent", UserAgent],
			["Content-Type", "application/json"],
			["X-RateLimit-Precision", "millisecond"],
		]);
	}

	/** Request from route endpoint. <T> is the type of object returned. */
	async request( method: HTTPMethod, path: string, substitutions?: RouteOptions ): Promise<Response> {
		const route = new Route(method, path, substitutions);
		const r = await fetch(route.url,{
			"method": route.method,
			"headers": this._headers
		});
		if (r.status === HTTPCode.UNAUTHORISED)
			throw new Error("Unauthorised.");
		else if (r.status === HTTPCode.TOO_MANY_REQUESTS)
			throw new Error("Damn! Rate limited.");
		return r;
	}

	async requestJson<T>( method: HTTPMethod, path: string, substitutions?: RouteOptions ): Promise<T> {
		return await(await this.request(method, path, substitutions)).json() as T;
	}
}

/** Websocket client */
class DiscordWSClient {

}

export class NetworkHandler
{
	readonly http:		DiscordHTTPClient;
	readonly ws:		DiscordWSClient;
	readonly res:		ResourcePool;
	readonly bucket:	BucketPool;

	constructor( token: string )
	{
		this.http = new DiscordHTTPClient(token);
		this.ws = new DiscordWSClient();
		this.res = new ResourcePool();
		this.bucket = new BucketPool();
	}
}
