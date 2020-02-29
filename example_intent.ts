// Copyright (c) 2020 Oliver Lenehan. All rights reserved. MIT license.
//@ts-nocheck

import { createClient } from './mod.ts';

// Option One

const clientA = await createClient('TOKEN', {
	intents: [
		'GUILDS',
		'GUILD_MEMBERS'
	]
});

for await (const event of clientA) {
	if (event.type === 'MESSAGE_CREATE') {
		await event.reply('Roar!');
		console.log('RECV::', event.text);
	}
}
