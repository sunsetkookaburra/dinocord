// Copyright (c) 2020 Oliver Lenehan. All rights reserved. MIT license.
import { createClient , Message} from "./mod.ts";

window.onload = async()=>
{
    const client = await createClient(Deno.env("TOKEN"));

    console.log("Bot Connected:", client.user);

    for await (const e of client) {
        if (e.type === "message") {

        }
    }
}
