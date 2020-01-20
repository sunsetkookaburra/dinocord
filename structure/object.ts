// Copyright (c) 2020 Oliver Lenehan. All rights reserved. MIT license.
import {
    Snowflake,
    ISO8601
} from "../deps.ts";

/** What type of user. */
export enum UserFlags {
	/** No special attributes */
	NONE				= 0,
	/** Is a Discord Employee */
	EMPLOYEE			= 1 << 0,
	/** Is a Discord Partner */
	PARTNER				= 1 << 1,
	/** Helps with HypeSquad Events */
	HYPESQUAD_EVENTS	= 1 << 2,
	/** Is a Bug Hunter */
	BUG_HUNTER			= 1 << 3,
	/** Is in the House of Bravery */
	HOUSE_BRAVERY		= 1 << 6,
	/** Is in the House of Brilliance */
	HOUSE_BRILLIANCE	= 1 << 7,
	/** Is in the House of Balance */
	HOUSE_BALANCE		= 1 << 8,
	/** Was an early supporter */
	EARLY_SUPPORTER		= 1 << 9,
	/** Uses Discord Teams */
	TEAM_USER			= 1 << 10,
	/** Discord System user */
	SYSTEM				= 1 << 12
}

/** Type of discord premium subscription. */
export enum PremiumTypes {
	/** Lower tier nitro subscription. */
	NITRO_CLASSIC	= 1,
	/** Higher tier nitro subscription. */
	NITRO			= 2
}

export interface UserObject {
	id:				Snowflake;
	username:		string;
	discriminator:	string;
	avatar?:		string;
	bot?:			boolean;
	system?:		boolean;
	mfa_enabled?:	boolean;
	locale?:		string;
	verified?:		boolean;
	email?:			string;
	flags?:			UserFlags;
	premium_type?:	PremiumTypes;
}



export interface IntegrationAccountObject {
    id:		string;
    name:	string;
}

export interface IntegrationObject {
    id:                    Snowflake;
    name:                  string;
    type:                  string;
    enabled:               boolean;
    syncing:               boolean;
    role_id:               Snowflake;
    expire_behaviour:      number;
    expire_grace_period:   number;
    user:                  UserObject;
    account:               IntegrationAccountObject;
    synced_at:             ISO8601;
}



export interface ConnectionObject {
	id:            string;
	name:          string;
	type:          string;
	revoked:       boolean;
	integrations:  IntegrationObject[];

}



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



/** What type of channel. */
export enum ChannelTypes {
	/** Guild Text Channel. */
	TEXT		= 0,
	/** Message Chat between users. */
	DM				= 1,
	/** Guild Voice Channel. */
	VOICE 	= 2,
	/** Group Chat. */
	GROUP		= 3,
	/** Guild Category. */
	CATEGORY 	= 4,
	/** Guild News Channel. */
	NEWS		= 5,
	/** Store Channel to sell games. */
	STORE		= 6
}

/** JSON representation of channels on Discord. */
export interface ChannelObject {
	id:						Snowflake;
	type:					number;
	guild_id:				Snowflake;
	position:				number;
	permission_overwrites?//:Overwrite[]
	name?:					string;
	topic?:					string;
	nsfw?:					boolean
	last_message_id:		Snowflake;
	bitrate?:				number;
	user_limit?:			number
	rate_limit_per_user?:	number;
	recipients?:			UserObject[]
	icon?:					string;
	owner_id?:				Snowflake;
	application_id?:		Snowflake;
	parent_id?:				Snowflake;
	last_pin_timestamp?:	ISO8601;
}
