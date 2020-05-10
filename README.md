![DinoCord](docs/banner.png)

## WARNING!
This library is not ready; do not use it at all in production. Any names are almost certainly going to change.

While dinocord is still in early development, run your program as such:
```
deno run --allow-net --reload myBot.ts
```

## About
A Discord API Library for Deno

## Creating your first bot.
```js
import { createClient } from 'https://deno.land/x/dinocord/mod.ts';

const client = await createClient('token');

console.log('Bot Connected:', client);

for await (const ctx of client) {
  if (ctx.event === 'MESSAGE_CREATE') {
    await ctx.reply(`***Roar!*** ${ctx.author} said:\n>>> ${ctx.text}`);
  }
}
```

<!--## API Documentation
Can be found [here](doc.md). Currently is hand-generated.-->

<!--## API Checklist
See how far along the implementation is [here](CHECKLIST.md).-->

## Contributing
I'm not currently accepting contributions through pull requests.
Once I'm happy with a functional state, then I might.

###### Est. 20th Jan 2020
