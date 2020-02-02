// Copyright (c) 2020 Oliver Lenehan. All rights reserved. MIT license.
// Currently i'm using this as my test program.

import { createClient } from './mod.ts';

window.onload = async()=>
{
	const client = await createClient(Deno.env('TOKEN'));
	console.log('Bot Connected:', client);
	
	console.log('Bot Belongs To Guilds:');
	console.log(client.guilds);

	for await (const e of client) {
		if (e.type === 'message') {
			await e.reply('Roar!');
		}
	}

	console.log('Bot Exited.');
}
