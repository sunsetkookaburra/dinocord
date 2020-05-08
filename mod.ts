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

need errors!!! and handling

things such as client status need to be tied to client context, so that they are auto updated...
e.g. client.status = "idle"
or client.setStatus("idle")

consider getting user details from gateway rather than http

caching needs to maintain the original object, and just update properties

*/

export { createClient, ClientOptions } from "./api/client.ts";
export {
	PresenceStatus,
	ActivityType,
	ActivityTypes,
} from "./api/data_object/mod.ts";
