// Dependencies from the Deno Standard Library
export { connectWebSocket, WebSocket } from 'https://deno.land/std@v0.31.0/ws/mod.ts';
export { deferred, Deferred } from 'https://deno.land/std@v0.31.0/util/async.ts';

/** Library related metadata */
export const LibraryMeta = {
	url: 'https://github.com/sunsetkookaburra',
	version: 'v0.0.1'
};

export type ISO8601 = string & { isISO8601: true };

//class DiscordError<T extends DiscordErrorKind> extends Error {}
