![DinoCord](banner.png)

## About
A Discord API Library for Deno

## Example
```js
import { createClient } from "https://raw.githubusercontent.com/sunsetkookaburra/dinocord/master/mod.ts";

const client = createClient(Deno.args[0]);

for await (const msg of client) {
    msg.reply("Why hello there.");
}
```

## API Checklist
See how far along the implementation is [here](CHECKLIST.md).
