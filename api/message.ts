// Copyright (c) 2020 Oliver Lenehan. All rights reserved. MIT license.

import { Snowflake, ISO8601, GatewayOpcode } from './data_object/mod.ts';
import { ClientContext } from './net.ts';

export interface MessageObject {
    id: Snowflake,
    channel_id: Snowflake,
    guild_id?: Snowflake,
    author: any,
    content: string,
    timestamp: ISO8601
}

export class Message
{
    get id(){return this.data.id};
    get text(){return this.data.content;}
    constructor(private ctx: ClientContext, private data: MessageObject){}
    async reply(text: string){
        await this.ctx.http.request("POST", "/channels/{channel_id}/messages", {
            substitutions: {'{channel_id}': this.data.channel_id},
            type: 'json',
            body: {
                "content": text,
                "tts": false
            }
        });
    }
}
