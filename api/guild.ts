// Copyright (c) 2020 Oliver Lenehan. All rights reserved. MIT license.

import { Snowflake } from "./snowflake.ts";

export type GuildMap = Map<Snowflake, Guild>;

export interface GuildObject {
	id:Snowflake;
	name:string;
	icon:string | null;
	splash:string | null;
	owner:boolean | undefined;
	ownerId:Snowflake;
	permissions:number | undefined
	region:string;
	afkChannelId:Snowflake | null;
	afkTimeout:number;
	embedEnabled:boolean | undefined;
	embedChannelId:Snowflake | undefined;
	verificationLevel:number;
	defaultMessageNotifications:number;
	explicitContentFilter:number;
	roles//: Role[];
	emojis//: Emoji[];
	features//: GuildFeature[];
	mfaLevel:number;
}

export class Guild
{
	id:		Snowflake;
	name:	string;
	constructor( guildInit: GuildObject ){
		this.id = guildInit.id;
		this.name = guildInit.name;
	}
}