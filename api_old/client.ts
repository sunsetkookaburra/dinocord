// Copyright (c) 2020 Oliver Lenehan. All rights reserved. MIT license.

import { ClientContext } from './net.ts';
import { User, UserObject } from './user.ts';
import { Message } from './message.ts';
import { Snowflake } from './snowflake.ts';
import { Guild, GuildObject, GuildMap } from './guild.ts';
import { createObject, PublicObjectTypes } from './create_object.ts';

//@public_api
type ClientEvent = 
	(Message & { readonly type: 'message' }) |
	({ readonly type: '' });

//@public_api
class Client extends User
{
	/** List of guilds to which the user belongs. */
	readonly guilds: GuildMap;
	
	private _ctx: ClientContext;

	constructor(userInit: UserObject, clientContext: ClientContext, guilds: GuildMap ){
		super(userInit);
		this.guilds = guilds;
		this._ctx = clientContext;
		this[Symbol.asyncIterator]; // reference so typescript outputs the property.
	}

	//@public_api
	createObject<T extends keyof PublicObjectTypes, I extends PublicObjectTypes[T][0]>( type: T, init: I ){
		return createObject(this._ctx, type, init);
	}

	//@public_api
	async getGuild( guildId: Snowflake ){
		return new Guild(await this._ctx.requestJson<GuildObject>('GET', '/guilds/:guildId', { guildId } ));
	}

	//@public_api
	async leaveGuild( guild: Snowflake | Guild ){
		if( guild instanceof Guild ){
			await this._ctx.request('DELETE', '/users/@me/guilds/:guild_id', { guild_id: guild.id });
			this.guilds.delete(guild.id);
		}
		else {
			await this._ctx.request('DELETE', '/users/@me/guilds/:guild_id', { guild_id: guild });
			this.guilds.delete(guild);
		}
	}

	/** Event Listener */
	private async*[Symbol.asyncIterator](): AsyncGenerator<ClientEvent, void, unknown> {
		return; // remove and reuse later as client.exit();
	}

	static async getUserData( ctx: ClientContext ){
		return ctx.requestJson<UserObject>('GET', '/users/@me')
	}
	
	static async getUserGuild( ctx: ClientContext ){
		const guilds: GuildMap = new Map();
		const userGuildsIn = await ctx.requestJson<GuildObject[]>('GET', '/users/@me/guilds');
		for (let i = 0; i < userGuildsIn.length; i++) {
			guilds.set(userGuildsIn[i].id, new Guild(userGuildsIn[i]));
		}
		return guilds;
	}
}

//@public_api
export async function createClient( token: string )
{
	// setup http
	// init websocket
	const ctx = new ClientContext( token );

	// Run a "Log-In" to get details and verify token.
	// Check user token. Will throw if invalid.
	let userObj = await Client.getUserData(ctx);

	// Retrieve list of guilds to init from.
	const guilds = await Client.getUserGuild(ctx);

	return new Client(userObj, ctx, guilds);
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
		if (typeof msg === 'string')
		{
			const parsed = JSON.parse(msg) as GatewayPayload;
			if (parsed.opcode === GatewayOpcode.HELLO)
			{
				heartbeatInterval = Number(parsed.data['heartbeat_interval']);
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
						'opcode': GatewayOpcode.HEARTBEAT,
						'data': {}
					} as GatewayPayload));
				}, heartbeatInterval);

				// Now identify
				await sock.send(JSON.stringify({
					'opcode': GatewayOpcode.IDENTIFY,
					'data': {
						'token': token,
						
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
