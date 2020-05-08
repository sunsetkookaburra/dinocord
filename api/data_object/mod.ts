// Copyright (c) 2020 Oliver Lenehan. All rights reserved. MIT license.

type NotImplemented<T> = T;

export type Snowflake = string & { isSnowflake: true };
export type ISO8601 = string & { isISO8601: true };

/** What type of user. */
export enum UserFlags {
	/** No special attributes */
	NONE = 0,
	/** Is a Discord Employee */
	EMPLOYEE = 1 << 0,
	/** Is a Discord Partner */
	PARTNER = 1 << 1,
	/** Helps with HypeSquad Events */
	HYPESQUAD_EVENTS = 1 << 2,
	/** Is a Bug Hunter */
	BUG_HUNTER = 1 << 3,
	/** Is in the House of Bravery */
	HOUSE_BRAVERY = 1 << 6,
	/** Is in the House of Brilliance */
	HOUSE_BRILLIANCE = 1 << 7,
	/** Is in the House of Balance */
	HOUSE_BALANCE = 1 << 8,
	/** Was an early supporter */
	EARLY_SUPPORTER = 1 << 9,
	/** Uses Discord Teams */
	TEAM_USER = 1 << 10,
	/** Discord System user */
	SYSTEM = 1 << 12,
}

/** Type of discord premium subscription. */
export enum PremiumTypes {
	/** Lower tier nitro subscription. */
	NITRO_CLASSIC = 1,
	/** Higher tier nitro subscription. */
	NITRO = 2,
}

/** User data object. */
export interface UserObject {
	/** ID of the user. */
	id: Snowflake;
	/** User's name (not unique). */
	username: string;
	/** User's discord tag. */
	discriminator: string;
	/** Avatar hash */
	avatar?: string;
	/** Is the user a bot? */
	bot?: boolean;
	/** Is the user part of Discord Urgent Message System. */
	system?: boolean;
	/** Whether the user has 2-factor authentication. */
	mfa_enabled?: boolean;
	/** User's chosen language. */
	locale?: string;
	/** Is the user's email verified. */
	verified?: boolean;
	/** The user's email. */
	email?: string;
	/** User account type flags. */
	flags?: UserFlags;
	/** Type of nitro subscription that the user has. */
	premium_type?: PremiumTypes;
}

export interface IntegrationAccountObject {
	id: string;
	name: string;
}

export interface IntegrationObject {
	id: Snowflake;
	name: string;
	type: string;
	enabled: boolean;
	syncing: boolean;
	role_id: Snowflake;
	expire_behaviour: number;
	expire_grace_period: number;
	user: UserObject;
	account: IntegrationAccountObject;
	synced_at: ISO8601;
}

export enum VisibilityTypes {
	/** Only the user can see. */
	NONE = 0,
	/** Everyone can see. */
	EVERYONE = 1,
}

/** JSON representation of a Connected Account. */
export interface ConnectionObject {
	/** Connected account id. */
	id: string;
	/** The username of the connected account. */
	name: string;
	/** The service connected (Steam, Twitch, Youtube, etc). */
	type: string;
	/** Has the connected been revoked. */
	revoked: boolean;
	/** Partial server integrations array. */
	integrations: IntegrationObject[];
	/** Whether the connection is verified. */
	verified: boolean;
	/** Whether the connection syncs with friends. */
	friend_sync: boolean;
	/** Whether presence updates show from the connection. */
	show_activity: boolean;
	/** Whether the connection is visible. */
	visibility: VisibilityTypes;
}

/** Discord Gateway Opcodes */
export enum GatewayOpcode {
	/** Action an Event.  
		Client: `Receives` */
	DISPATCH = 0,
	/** Ping the gateway.  
		Client: `Sends, Receives` */
	HEARTBEAT = 1,
	/** Client Handshake.  
		Client: `Sends` */
	IDENTIFY = 2,
	/** Update Discord Status.  
		Client: `Sends` */
	STATUS_UPDATE = 3,
	/** Join/Move/Leave voice channels.  
		Client: `Sends` */
	VOICE_STATE_UPDATE = 4,
	/** Resume closed gateway connection.  
		Client: `Sends` */
	RESUME = 6,
	/** Ready to reconnect to gateway.  
		Client: `Receives` */
	RECONNECT = 7,
	/** Request members of a guild.  
		Client: `Sends` */
	REQUEST_GUILD_MEMBERS = 8,
	/** Client has an invalid session id.  
		Client: `Receives` */
	INVALID_SESSION = 9,
	/** Sent after first connection, contains heartbeat time.  
		Client: `Receives` */
	HELLO = 10,
	/** Acknowledges the heartbeat was received.  
		Client: `Receives` */
	HEARTBEAT_ACK = 11,
}

/** Discord Gateway Payload */
export interface GatewayPayload {
	/** Payload Opcode */
	op: GatewayOpcode;
	/** Event Data */
	d: any;
	/** Sequence number (for resume / heartbeast) */
	s?: number;
	/** Event Name */
	t?: DispatchEvent_All;
}

export enum Intent {
	GUILDS = 1 << 0,
	GUILD_MEMBERS = 1 << 1,
	GUILD_BANS = 1 << 2,
	GUILD_EMOJIS = 1 << 3,
	GUILD_INTEGRATIONS = 1 << 4,
	GUILD_WEBHOOKS = 1 << 5,
	GUILD_INVITES = 1 << 6,
	GUILD_VOICE_STATES = 1 << 7,
	GUILD_PRESENCES = 1 << 8,
	GUILD_MESSAGES = 1 << 9,
	GUILD_MESSAGE_REACTIONS = 1 << 10,
	GUILD_MESSAGE_TYPING = 1 << 11,
	DIRECT_MESSAGES = 1 << 12,
	DIRECT_MESSAGE_REACTIONS = 1 << 13,
	DIRECT_MESSAGE_TYPING = 1 << 14,
}

interface DiscordIntentEvents {
	GUILDS:
		| "GUILD_CREATE"
		| "GUILD_DELETE"
		| "GUILD_ROLE_CREATE"
		| "GUILD_ROLE_UPDATE"
		| "GUILD_ROLE_DELETE"
		| "CHANNEL_CREATE"
		| "CHANNEL_UPDATE"
		| "CHANNEL_DELETE"
		| "CHANNEL_PINS_UPDATE";
	GUILD_MEMBERS:
		| "GUILD_MEMBER_ADD"
		| "GUILD_MEMBER_REMOVE"
		| "GUILD_MEMBER_UPDATE";
	GUILD_BANS: "GUILD_BAN_ADD" | "GUILD_BAN_REMOVE";
	GUILD_EMOJIS: "GUILD_EMOJIS_UPDATE";
	GUILD_INTEGRATIONS: "GUILD_INTEGRATIONS_UPDATE";
	GUILD_WEBHOOKS: "WEBHOOKS_UPDATE";
	GUILD_INVITES: "INVITE_CREATE" | "INVITE_DELETE";
	GUILD_VOICE_STATES: "VOICE_STATE_UPDATE";
	GUILD_PRESENCES: "PRESENCE_UPDATE";
	GUILD_MESSAGES: "MESSAGE_CREATE" | "MESSAGE_UPDATE" | "MESSAGE_DELETE";
	GUILD_MESSAGE_REACTIONS:
		| "MESSAGE_REACTION_ADD"
		| "MESSAGE_REACTION_REMOVE"
		| "MESSAGE_REACTION_REMOVE_ALL"
		| "MESSAGE_REACTION_REMOVE_EMOJI";
	GUILD_MESSAGE_TYPING: "TYPING_START";
	DIRECT_MESSAGES:
		| "CHANNEL_CREATE"
		| "CHANNEL_UPDATE"
		| "CHANNEL_DELETE"
		| "CHANNEL_PINS_UPDATE";
	DIRECT_MESSAGE_REACTIONS:
		| "MESSAGE_REACTION_ADD"
		| "MESSAGE_REACTION_REMOVE"
		| "MESSAGE_REACTION_REMOVE_ALL"
		| "MESSAGE_REACTION_REMOVE_EMOJI";
	DIRECT_MESSAGE_TYPING: "TYPING_START";
}

export type DispatchEvent_Passthrough =
	| "GUILD_MEMBERS_CHUNK"
	| "MESSAGE_DELETE_BULK"
	| "USER_UPDATE"
	| "VOICE_SERVER_UPDATE";
export type AvailableDispatchEvent<T extends (keyof DiscordIntentEvents)[]> =
	| DiscordIntentEvents[keyof Pick<DiscordIntentEvents, T[number]>]
	| DispatchEvent_Passthrough;
export type DispatchEvent_All =
	| DiscordIntentEvents[keyof DiscordIntentEvents]
	| "READY"
	| "RESUMED"
	| "RECONNECT"
	| "INVALID_SESSION";

export type PresenceStatus =
	| "online"
	| "dnd"
	| "idle"
	| "invisible"
	| "offline";

/** Discord Presence Structure */
export interface Presence {
	status: PresenceStatus;
	afk: boolean;
	since: number | null;
	game: Activity | null;
}

/** Discord Activity Structure */
export interface Activity {
	type: number;
	name: string;
	url?: string;
}

export enum ActivityTypes {
	GAME = 0,
	STREAMING = 1,
	LISTENING = 2,
	CUSTOM = 3,
}

export const ActivityType = {
	"game": ActivityTypes.GAME,
	"streaming": ActivityTypes.STREAMING,
	"listening": ActivityTypes.LISTENING,
	"custom": ActivityTypes.CUSTOM,
};
