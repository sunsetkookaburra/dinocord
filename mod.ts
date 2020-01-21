/*
discord docs::
key type => key: type
key ?type => key: type | null
?key type => key: type | undefined
?key ?type => key: type | null | undefined


const client = await createClient(token);
client.channels[0].getLastMessage();
for await (const msg of client){
	
}

allow this to happen by extending
extend guild class for ClientGuild
client.guilds[0].leave();

*/

export { createClient } from "./api/client.ts";