// Dependencies from the Deno Standard Library
export { connectWebSocket, WebSocket, isWebSocketCloseEvent, WebSocketEvent } from 'https://deno.land/std@v0.35.0/ws/mod.ts';
export { deferred, Deferred } from 'https://deno.land/std@v0.35.0/util/async.ts';
export { yamlStringify } from 'https://deno.land/std@v0.35.0/encoding/mod.ts';
import * as Log from 'https://deno.land/std@v0.35.0/log/mod.ts';
export { Log };

/** Library related metadata */
export const LibraryMeta = {
	url: 'https://github.com/sunsetkookaburra/dinocord',
	version: 'v0.0.1'
};

//class DiscordError<T extends DiscordErrorKind> extends Error {}
