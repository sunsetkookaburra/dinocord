![DinoCord](banner.png)

## WARNING!
This is by no means ready, do not use it at all in production. Any functions or properties are likely to change.

The events system does not work yet, currently the library is only REST.
I did get a prototype Websocket connection working, so it won't be long until you can listen for messages.

The current documentation can be found below, and to some extent the library works! (or at least should by my testing).

Spelling for library functions is in UK/AU English, hence the appearance of "colour" and not "color".

## About
A Discord API Library for Deno

## Creating your first bot.
Unfortunately this isn't working entirely *yet*, Websockets need to be implemented for the for-await events to work.
```js
import { createClient } from 'https://deno.land/x/dinocord/mod.ts';

const client = await createClient('token');

console.log('Bot Connected:', client);

for await (const event of client) {
    if (event.type === 'message') {
        await event.reply('Roar!');
    }
}
```

## API Documentation
Can be found [here](doc.md). Currently is hand-generated.

## Short Term Checklist
- [ ] `ClientGuild extends Guild` so that `guild.leave()` can happen for guilds the client is in.
- [ ] Intercept requests to cache data objects.
- [ ] Figure out best way to pass through NetworkHandler to things such as TextChannel.
- [x] Rename NetworkHandler to ClientContext

## API Checklist
See how far along the implementation is [here](CHECKLIST.md).

## Contributing
I'm not currently accepting contributions through pull requests.
Once I'm happy with a functional state, then I might.
At that time I will also open the issue tracker.

###### Est. 20th Jan 2020
