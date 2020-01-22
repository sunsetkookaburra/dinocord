// Copyright (c) 2020 Oliver Lenehan. All rights reserved. MIT license.
import { createClient } from "./mod.ts";

window.onload = async()=>
{
	const client = await createClient(Deno.env("TOKEN"));
	console.log("Bot Connected:", client);
	
	console.log("Bot Belongs To Guilds:");
	for (const guild of client.guilds.values()) {
		console.log(' +', guild.name);
	}

	for await (const e of client) {
		if (e.type === "message") {
			
		}
	}

	console.log("Bot Exited.");
}
