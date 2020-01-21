// Copyright (c) 2020 Oliver Lenehan. All rights reserved. MIT license.
//import {  } from "../deps.ts";
import { DiscordHTTPClient, Route, ResourcePool, HTTPCode } from "./net.ts";
import { User, UserObject } from "./user.ts";
import { BucketPool } from "./bucket.ts";
import { Message } from "./message.ts";

type ClientEvent = 
	(Message & { type: "message" }) |
	({ type: "" });

class Client
{
	readonly user: User;
	private _bucketPool: BucketPool;
	private _httpClient: DiscordHTTPClient;
	private _resPool: ResourcePool;

	constructor( httpClient: DiscordHTTPClient, userData: UserObject ){
		this.user = new User(userData);
		this._bucketPool = new BucketPool();
		this._httpClient = httpClient;
		this._resPool = new ResourcePool();
	}

	/** Event Listener */
	async*[Symbol.asyncIterator](): AsyncGenerator<ClientEvent, void, unknown> {
		
	};
}

export async function createClient( token: string )
{
	// Run a "Log-In" to get details and verify token.
	const httpClient = new DiscordHTTPClient(token);
	const route = new Route("GET", "/users/@me");
	const result = await httpClient.request(route);

	// If the bot is unauthorised, e.g. token is invalid
	if (result.status === HTTPCode.UNAUTHORISED)
		throw new Error("Unauthorised.");
	else if (result.status === HTTPCode.TOO_MANY_REQUESTS)
		throw new Error("Damn! Rate limited.");

	return new Client(httpClient, await result.json());
}

/*
async function createSockClient( token: string )
{
	const sock = await connectWebSocket(Endpoint.gateway);
	let heartbeatInterval = 0;
	let heartId = 0;
	let awaitingRepsone = false;
	for await (const msg of sock.receive())
	{
		if (typeof msg === "string")
		{
			const parsed = JSON.parse(msg) as GatewayPayload;
			if (parsed.opcode === GatewayOpcode.HELLO)
			{
				heartbeatInterval = Number(parsed.data["heartbeat_interval"]);
				heartId = setInterval(async()=>{
					// socket died on discord's end
					if (awaitingRepsone)
					{
						sock.close(2000);
						clearInterval(heartId);
						return;
					}
					awaitingRepsone = true;
					await sock.send(JSON.stringify({
						"opcode": GatewayOpcode.HEARTBEAT,
						"data": {}
					} as GatewayPayload));
				}, heartbeatInterval);

				// Now identify
				await sock.send(JSON.stringify({
					"opcode": GatewayOpcode.IDENTIFY,
					"data": {
						"token": token,
						
					}
				} as GatewayPayload));
			}
			else if (parsed.opcode === GatewayOpcode.HEARTBEAT_ACK)
			{
				awaitingRepsone = false;
			}
			GatewayOpcode.DISPATCH
		}
	}
}
*/
