// Copyright (c) 2020 Oliver Lenehan. All rights reserved. MIT license.

import { User } from "./user.ts";
import { DispatchEvent_All, UserObject, Snowflake, ActivityType, PresenceStatus, Presence, Activity } from "./data_object/mod.ts";
import { ClientContext, DiscordHTTPClient, DiscordWSClient } from "./net.ts";
import { Message } from "./message.ts";
import { Guild } from "./guild.ts";
import { initLogging, LoggingLevel } from './debug.ts';

interface ClientOptions extends Record<string, any> {
	status?: PresenceStatus;
	activity?: {
		type: keyof typeof ActivityType;
		text: string;
		url?: string;
	};
	logLevel?: LoggingLevel;
}

// will be or'd with other options, like channel update etc
// need a published list

type ClientEvent<O, T extends DispatchEvent_All> = O & { event: T };

function CreateClientEvent<O, T extends DispatchEvent_All>(o: O, t: T){
	(o as any)['event'] = t;
	return o as ClientEvent<O, T>;
}

class Client extends User {
	// will have a guilds property
	private guilds: Map<Snowflake, 'Guild'> = new Map();
	constructor( userInit: UserObject, private ctx: ClientContext ){
		super(userInit);
	}
	async*[Symbol.asyncIterator](){
		for await( const p of this.ctx.ws.eventQueue ){
			// m.op always DISPATCH = 0
			// switch event name.
			switch(p.t){
				case 'GUILD_CREATE':
					break;
				case 'MESSAGE_CREATE':
					if (p.d.author?.id !== this.id) yield CreateClientEvent(new Message(this.ctx, p.d), "MESSAGE_CREATE");
					break;
				default:
					console.log('Unhandled DISPATCH::', p.t);
					break;
			}
		}
	}
	//createObject<T extends 'message'>(type: T, init: any){}
}

// this should handle creation of client context, not another function
export async function createClient( token: string, options?: ClientOptions ) {
	// parse options
	// create default options.
	const defaultOptions: ClientOptions = {
		'activity': undefined,
		'status': 'online',
		'logLevel': 'debug'
	};
	// add new properties to options.
	for( let k of Object.keys(options||{}) ){
		defaultOptions[k] = options![k];
	}

	// create game/activity for discord
	let game: Activity | null = null;
	if( defaultOptions.activity !== undefined ){
		game = {
			type: ActivityType[defaultOptions.activity.type],
			name: defaultOptions.activity.text,
			url: defaultOptions.activity.url
		}
	}
	let activity: Presence = {
		'afk': false,
		'game': game,
		'since': null,
		'status': defaultOptions.status!
	};

	// setup logging for debugging/error messages (! to assert not null)
	await initLogging(defaultOptions.logLevel!);

	// init http
	const httpClient = new DiscordHTTPClient(token);

	// init websocket :: consider putting init presence in class, so when auto-reconnect happens it handles it better
	const gateway = (await httpClient.requestJson<any>('GET','/gateway'))['url'];
	const wsClient = new DiscordWSClient(token, gateway);
	await wsClient.init();

	// create context, this can be passed to things such as message constructors to allow for replies.
	const ctx = new ClientContext(httpClient, wsClient);

	// handlers for things such as guilds etc.
	const readyData = await wsClient.identify(activity);
	const userInit = readyData.d['user'];

	/*
	const guilds: GuildMap = new Map();
	const userGuildsIn = await ctx.http.requestJson<GuildObject[]>('GET', '/users/@me/guilds');
	for (let i = 0; i < userGuildsIn.length; i++) {
		guilds.set(userGuildsIn[i].id, new Guild(userGuildsIn[i]));
	}
	*/

	const client = new Client(userInit, ctx);
	return client;
}


