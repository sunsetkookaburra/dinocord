// Copyright (c) 2020 Oliver Lenehan. All rights reserved. MIT license.
import { createClient } from "./mod.ts";

const client = await createClient(Deno.env.get("TOKEN")!, {
	logLevel: "debug",
});

console.log("Bot Connected:", client);

for await (const ctx of client) {
	if (ctx.event === "MESSAGE_CREATE") {
		await ctx.reply(`***Roar!*** ${ctx.author} said:\n>>> ${ctx.text}`);
	}
}

console.log("Bot Exited.");
