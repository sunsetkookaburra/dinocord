// Copyright (c) 2020 Oliver Lenehan. All rights reserved. MIT license.

import { Deferred } from "../deps.ts";
import { Snowflake } from "./data_object/mod.ts";
import { ClientContext } from "./net.ts";

export class Guild {
	get id() {
		return this.data.id;
	}
	get name() {
		return this.data.name;
	}
	//public channels: Channel[]
	constructor(
		private ctx: ClientContext,
		private data: GuildObject,
		onInit: Deferred<void>,
	) {
		ctx.cache.set(data.id, this);
		//initialiseObjects(ctx, [
		//	[data.ownerId, 'user']
		//]).then(onInit.resolve);
	}
}

/** NOT COMPLETE */
interface GuildObject {
	id: Snowflake;
	name: string;
	ownerId: Snowflake;
	region: string;
	afkTimeout: number;
	verificationLevel: number;
	defaultMessageNotifications: number;
	explicitContentFilter: number;
	roles: "Role"[];
	emojis: "Emoji"[];
	features: "GuildFeature"[];
	mfaLevel: number;
	icon?: string;
	splash?: string;
	discovery_splash?: string;
	owner?: boolean;
	permissions?: number;
	afkChannelId?: Snowflake;
	embedEnabled?: boolean;
	embedChannelId?: Snowflake;
}
