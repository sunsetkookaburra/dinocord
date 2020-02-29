// Copyright (c) 2020 Oliver Lenehan. All rights reserved. MIT license.
import { createClient } from './mod.ts';

const client = await createClient(Deno.env('TOKEN')!);
console.log('Bot Connected:', client);

for await (const ctx of client) {
	if (ctx.event === 'MESSAGE_CREATE') {
		ctx.reply('Roar! You said: '+ ctx.text);
	}
}

console.log('Bot Exited.');