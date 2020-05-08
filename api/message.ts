// Copyright (c) 2020 Oliver Lenehan. All rights reserved. MIT license.

import { Deferred } from "../deps.ts";
import { Snowflake, ISO8601 } from "./data_object/mod.ts";
import { ClientContext } from "./net.ts";
import { User } from "./user.ts";

export interface MessageObject {
	id: Snowflake;
	channel_id: Snowflake;
	guild_id?: Snowflake;
	author: any;
	content: string;
	timestamp: ISO8601;
}

export class Message {
	get id() {
		return this.data.id;
	}
	get text() {
		return this.data.content;
	}
	get author() {
		return this.ctx.cache.get(this.data.author.id) as User;
	}
	constructor(
		private ctx: ClientContext,
		private data: MessageObject,
		onInit: Deferred<void>,
	) {
		ctx.cache.set(data.id, this);
		if (!ctx.cache.has(data.author.id)) {
			ctx.cache.set(data.author.id, new User(data.author));
		}
		//initialiseObjects(ctx, [
		//    [data.channel_id, 'channel'],
		//    data.guild_id?[data.guild_id, 'guild']:null
		//]).then(onInit.resolve);
	}
	async reply(text: string) {
		await this.ctx.http.request("POST", "/channels/{channel.id}/messages", {
			substitutions: { "{channel.id}": this.data.channel_id },
			type: "json",
			body: {
				"content": text,
				"tts": false,
			},
		});
	}
}
