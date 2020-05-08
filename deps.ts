// Dependencies from the Deno Standard Library
export {
  connectWebSocket,
  WebSocket,
  isWebSocketCloseEvent,
  WebSocketEvent,
} from "https://deno.land/std@v1.0.0-rc1/ws/mod.ts";
export {
  deferred,
  Deferred,
} from "https://deno.land/std@v1.0.0-rc1/util/async.ts";
import * as Log from "https://deno.land/std@v1.0.0-rc1/log/mod.ts";
export { Log };

/** Library related metadata */
export const LibraryMeta = {
  url: "https://github.com/sunsetkookaburra/dinocord",
  version: "v0.0.1",
};

//class DiscordError<T extends DiscordErrorKind> extends Error {}
