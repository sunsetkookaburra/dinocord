// Copyright (c) 2020 Oliver Lenehan. All rights reserved. MIT license.
import { ISO8601 } from '../deps.ts';
import { Snowflake } from './snowflake.ts';

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

export enum VisibilityTypes {
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
	visibility:		VisibilityTypes;
}

//@public_api
/** A Discord User. */
export class User
{
	/** The User's ID. */
	readonly id: Snowflake;

	/** The name of the user, e.g. `"name"#1234`. */
	readonly name: string;

	/** The tag number of the user, e.g. `name#"1234"`. */
	readonly tag: string;

	constructor( userInit: UserObject ) {
		this.id 	= userInit.id;
		this.name 	= userInit.username;
		this.tag 	= userInit.discriminator;

		this[Deno.symbols.customInspect]; // Reference so typescript outputs the property.
	}

	private [Deno.symbols.customInspect]() {
		return this.name + '#' + this.tag;
	}
}
