import { createClient } from "./mod.ts";

window.onload = async()=>{
    const client = await createClient(Deno.env("TOKEN"));
    console.log("Bot Connected:", client.user.name+"#"+client.user.tag);
    for await (const msg of client)
    {
        console.log(msg);
    }
}
