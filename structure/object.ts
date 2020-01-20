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
	/** Lower tier nitro subscription */
	NITRO_CLASSIC	= 1,
	/** Higher tier nitro subscription */
	NITRO			= 2
}

export interface UserObject {
	readonly id:			Snowflake;
	readonly username:		string;
	readonly discriminator:	string;
	readonly avatar?:		string;
	readonly bot?:			boolean;
	readonly system?:		boolean;
	readonly mfa_enabled?:	boolean;
	readonly locale?:		string;
	readonly verified?:		boolean;
	readonly email?:		string;
	readonly flags?:		UserFlags | undefined;
	readonly premium_type?:	PremiumTypes | undefined;
}



export interface IntegrationAccountObject {
    readonly id:    string;
    readonly name:  string;
}

export interface IntegrationObject {
    readonly id:                    Snowflake;
    readonly name:                  string;
    readonly type:                  string;
    readonly enabled:               boolean;
    readonly syncing:               boolean;
    readonly role_id:               Snowflake;
    readonly expire_behaviour:      number;
    readonly expire_grace_period:   number;
    readonly user:                  UserObject;
    readonly account:               IntegrationAccountObject;
    readonly synced_at:             ISO8601;
}



export interface ConnectionObject {
	readonly id:            string;
	readonly name:          string;
	readonly type:          string;
	readonly revoked:       boolean;
	readonly integrations:  IntegrationObject[];

}



export interface GuildObject
{
    readonly id: Snowflake;
    readonly name: string;
    readonly icon: string | null;
    readonly splash: string | null;
    readonly owner: boolean | undefined;
    readonly ownerId: Snowflake;
    readonly permissions: number | undefined
    readonly region: string;
    readonly afkChannelId: Snowflake | null;
    readonly afkTimeout: number;
    readonly embedEnabled: boolean | undefined;
    readonly embedChannelId: Snowflake | undefined;
    readonly verificationLevel: number;
    readonly defaultMessageNotifications: number;
    readonly explicitContentFilter: number;
    readonly roles//: Role[];
    readonly emojis//: Emoji[];
    readonly features//: GuildFeature[];
    readonly mfaLevel: number;
}
