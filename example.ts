// Copyright (c) 2020 Oliver Lenehan. All rights reserved. MIT license.
import { createClient } from "./mod.ts";

window.onload = async()=>{
    //await createSockClient(Deno.env("TOKEN"));
    const client = await createClient(Deno.env("TOKEN"));
    console.log("Bot Connected:", client.user.name+"#"+client.user.tag);
    for await (const msg of client)
    {
        console.log(msg);
    }
}
