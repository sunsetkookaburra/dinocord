// Copyright (c) 2020 Oliver Lenehan. All rights reserved. MIT license.
import { Snowflake } from "./data_object/mod.ts";
import { Guild } from "./guild.ts";
/*
class Channel {
	public type: ChannelTypes = "generic";
	public get id(): Snowflake { return this.init.id! };
	public guild: Guild = ;
	public name: string;
	public topic: string;
	constructor(private init: ChannelInit) {
		this.id = this.init.
	}
	async getMessages(count: number) {}
}

export class TextChannel extends Channel {
	public type: ChannelTypes = "text";
}*/

type ChannelTypes = "generic" | "text" | "";

interface ChannelInit {
	id?: Snowflake | null;
	guild: Guild | null;
	name: string;
}
