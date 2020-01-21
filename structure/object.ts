// Copyright (c) 2020 Oliver Lenehan. All rights reserved. MIT license.
import { Snowflake, ISO8601 } from "../deps.ts";

// All data values used for network communications.

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

/** User data object. */
export interface UserObject {
	/** ID of the user. */
	id:				Snowflake;
	/** User's name (not unique). */
	username:		string;
	/** User's discord tag. */
	discriminator:	string;
	/** Avatar hash */
	avatar?:		string;
	/** Is the user a bot? */
	bot?:			boolean;
	/** Is the user part of Discord Urgent Message System. */
	system?:		boolean;
	/** Whether the user has 2-factor authentication. */
	mfa_enabled?:	boolean;
	/** User's chosen language. */
	locale?:		string;
	/** Is the user's email verified. */
	verified?:		boolean;
	/** The user's email. */
	email?:			string;
	/** User account type flags. */
	flags?:			UserFlags;
	/** Type of nitro subscription that the user has. */
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

export enum VisibilityTypes
{
	/** Only the user can see. */
	NONE		= 0,
	/** Everyone can see. */
	EVERYONE	= 1
}

/** JSON representation of a Connected Account. */
export interface ConnectionObject {
	/** Connected account id. */
	id:				string;
	/** The username of the connected account. */
	name:			string;
	/** The service connected (Steam, Twitch, Youtube, etc). */
	type:			string;
	/** Has the connected been revoked. */
	revoked:		boolean;
	/** Partial server integrations array. */
	integrations:	IntegrationObject[];
	/** Whether the connection is verified. */
	verified:		boolean;
	/** Whether the connection syncs with friends. */
	friend_sync:	boolean;
	/** Whether presence updates show from the connection. */
	show_activity:	boolean;
	/** Whether the connection is visible. */
	visibility:		number;
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

/** JSON representation of a Discord Channel. */
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
