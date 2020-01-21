// Dependencies from the Deno Standard Library
export { connectWebSocket } from "https://deno.land/std@v0.30.0/ws/mod.ts";

// Dependencies from Discord Resources
export * from "./resource/channel.ts";
export * from "./resource/guild.ts";
export * from "./resource/message.ts";
export * from "./resource/user.ts";

// Dependencies from Data Structures
export * from "./structure/constant.ts";
export * from "./structure/gateway.ts";
export * from "./structure/object.ts";
export * from "./structure/snowflake.ts";

export * from "./net.ts";