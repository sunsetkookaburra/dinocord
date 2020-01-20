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
export const Endpoint = {
	api: "https://discordapp.com/api/v6",
	cdn: "https://cdn.discordapp.com",
	gateway: "wss://gateway.discord.gg/?v=6&encoding=json"
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


