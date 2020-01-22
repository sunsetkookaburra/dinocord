/*
discord docs::
key type => key: type
key ?type => key: type | null
?key type => key?: type
?key ?type => key?: type | null


const client = await createClient(token);
client.channels[0].getLastMessage();
for await (const msg of client){
	
}

allow this to happen by extending
extend guild class for ClientGuild
client.guilds[0].leave();

need to identify data objects coming through net
and update cache from that.

add createObject('ClassName', init: ClassNameObject) or a special Object for creation.

*/

export { createClient } from "./api/client.ts";
// export { createObject } from "./api/create_object.ts";