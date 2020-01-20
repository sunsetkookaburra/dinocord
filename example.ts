import { createClient } from "./mod.ts";
import { createSockClient } from "./client.ts";

window.onload = async()=>{
    //await createSockClient(Deno.env("TOKEN"));
    const client = await createClient(Deno.env("TOKEN"));
    console.log("Bot Connected:", client.user.name+"#"+client.user.tag);
    for await (const msg of client)
    {
        console.log(msg);
    }
}
