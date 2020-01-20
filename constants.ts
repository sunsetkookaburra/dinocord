/** Library related metadata */
export const LibraryMeta = {
	url: "https://github.com/sunsetkookaburra",
	version: "v0.0.1"
}

// discord defined special data-types
export type Snowflake = string & { isSnowflake: true };
export type ISO8601 = string & { isISO8601: true };

export class DiscordError extends Error {}

/** Discord Base Urls */
export const DiscordURLs = {
	api: "https://discordapp.com/api/v6",
	cdn: "https://cdn.discordapp.com"
};

/** CDN Endpoint Templates */
export const CDNTemplates = {
	emoji:				"/emojis/${emojiId}.png",
	guildIcon:			"/icons/${guildId}/${guildIcon}.png",
	guildSplash:		"/splashes/${guildId}/${guildSplash}.png",
	guildBanner:		"/splashes/${guildId}/${guildBanner}.png",
	defaultUserAvatar:	"/embed/avatars/${userDiscriminator}.png",
	userAvatar:			"/avatars/${userId}/${userAvatar}.png",
	teamIcon:			"/team-icons/${teamId}/${teamIcon}.png"
};

// channel types
enum ChannelTypes {

};

/** Type of user. */
export enum UserFlags {
	NONE				= 0,
	EMPLOYEE			= 1 << 0,
	PARTNER				= 1 << 1,
	HYPESQUAD_EVENTS	= 1 << 2,
	BUG_HUNTER			= 1 << 3,
	HOUSE_BRAVERY		= 1 << 6,
	HOUSE_BRILLIANCE	= 1 << 7,
	HOUSE_BALANCE		= 1 << 8,
	EARLY_SUPPORTER		= 1 << 9,
	TEAM_USER			= 1 << 10,
	SYSTEM				= 1 << 12
};

/** Type of discord premium subscription. */
export enum PremiumTypes {
	NITRO_CLASSIC	= 1,
	NITRO			= 2
}
