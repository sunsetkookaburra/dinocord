// Copyright (c) 2020 Oliver Lenehan. All rights reserved. MIT license.
//import {  } from "../deps.ts";
import { NetworkHandler } from "./net.ts";
import { User, UserObject } from "./user.ts";
import { Message } from "./message.ts";
import { Snowflake } from "./snowflake.ts";
import { Guild, GuildObject, GuildMap } from "./guild.ts";

//@public_api
type ClientEvent = 
	(Message & { type: "message" }) |
	({ type: "" });

//@public_api
class Client extends User
{
	/** List of guilds to which the user belongs. */
	readonly guilds: GuildMap;
	
	private net: NetworkHandler;

	constructor(userInit: UserObject, networkHandler: NetworkHandler, guilds: GuildMap ){
		super(userInit);
		this.guilds = guilds;
		this.net  = networkHandler;

		this[Symbol.asyncIterator]; // reference so typescript outputs the property.
	}

	/** Event Listener */
	private async*[Symbol.asyncIterator](): AsyncGenerator<ClientEvent, void, unknown> {
		return; // remove and reuse later as client.exit();
	};

	static async getUserData( net: NetworkHandler ){
		return net.http.requestJson<UserObject>('GET', '/users/@me')
	}
	
	static async getUserGuild( net: NetworkHandler ){
		const guilds: GuildMap = new Map();
		const userGuildsIn = await net.http.requestJson<GuildObject[]>('GET', '/users/@me/guilds');
		for (let i = 0; i < userGuildsIn.length; i++) {
			guilds.set(userGuildsIn[i].id, new Guild(userGuildsIn[i]));
		}
		return guilds;
	}
}

//@public_api
export async function createClient( token: string )
{
	const net = new NetworkHandler( token );

	// Run a "Log-In" to get details and verify token.
	// Check user token. Will throw if invalid.
	let userObj = await Client.getUserData(net);

	// Retrieve list of guilds to init from.
	const guilds = await Client.getUserGuild(net);

	return new Client(userObj, net, guilds);
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
