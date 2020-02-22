// Copyright (c) 2020 Oliver Lenehan. All rights reserved. MIT license.

import { User } from "./user.ts";
import { UserObject, Snowflake, ActivityType, PresenceStatus, Activity } from "./data_objects.ts";
import { createClientContext, ClientContext } from "./net.ts";
import { Message } from "./message.ts";

interface ClientOptions {
	status?: PresenceStatus;
	activity?: {
		type: keyof typeof ActivityType;
		text: string;
		url?: string;
	}
}

// will be or'd with other options, like channel update etc
// need a published list
type ClientEvent = 
	(Message & { readonly type: 'message' })/* |
	(Message & { readonly type: 'channel' }) |
	(Message & { readonly type: 'message' }) ;*/

class Client extends User {
	// will have a guilds property
	private guilds: Map<Snowflake, 'Guild'> = new Map();
	constructor( userInit: UserObject, private ctx: ClientContext ){
		super(userInit);
	}
	async*[Symbol.asyncIterator](){
		for await( const p of this.ctx.ws.listen() ){
			// m.op always DISPATCH = 0
			// switch event name.
			switch(p.t){
				case 'READY':
					console.log('LIB: READY');
					break;
				case 'MESSAGE_CREATE':
					yield {
						'type': 'message',
						'id': '212' as Snowflake,
						'text': p.d['content'],
						async reply(){}
					} as ClientEvent
					break;
				default:
					console.log('Unhandled DISPATCH::', p.t);
					break;
			}
		}
	}
}

export async function createClient( token: string, options?: ClientOptions ) {
	let game: Activity | null = null;
	if( options && options.activity ){
		game = {
			type: ActivityType[options.activity.type],
			name: options.activity.text,
			url: options.activity.url
		}
	}
	let ctx = await createClientContext(token, {
		afk: options?((options.status === 'idle')?true:false):false,
		status: options?(options.status || 'online'):'online',
		since: options?((options.status === 'idle')?new Date().valueOf():null):null,
		game: game
	});
	const userInit = await ctx.http.requestJson<UserObject>('GET', '/users/@me');
	/*
	// TO BE IMPLEMENTED VIA GATEWAY
	const guilds: GuildMap = new Map();
	const userGuildsIn = await ctx.http.requestJson<GuildObject[]>('GET', '/users/@me/guilds');
	for (let i = 0; i < userGuildsIn.length; i++) {
		guilds.set(userGuildsIn[i].id, new Guild(userGuildsIn[i]));
	}
	*/
	const client = new Client(userInit, ctx);
	return client;
}
