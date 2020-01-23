// Dependencies from the Deno Standard Library
export { connectWebSocket } from 'https://deno.land/std@v0.30.0/ws/mod.ts';

/** Library related metadata */
export const LibraryMeta = {
	url: 'https://github.com/sunsetkookaburra',
	version: 'v0.0.1'
};

export type ISO8601 = string & { isISO8601: true };

//class DiscordError<T extends DiscordErrorKind> extends Error {}
