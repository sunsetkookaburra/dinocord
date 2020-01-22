![DinoCord](banner.png)

## WARNING!
This is by no means ready, do not use it at all. You probably will rate limit yourself.

## About
A Discord API Library for Deno

## Example
```js
import { createClient } from 'https://deno.land/x/dinocord/mod.ts';

const client = await createClient('token');

console.log('Bot Connected:', client);

for await (const event of client) {
    if (event.type === 'message') {
        event.reply('Hello!');
    }
}
```

## API Documentation
Can be found [here](DOC.md). Currently is hand-generated.

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