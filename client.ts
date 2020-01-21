// Copyright (c) 2020 Oliver Lenehan. All rights reserved. MIT license.
import { 
	Endpoint,
	LibraryMeta,
	DiscordError,
	User,
	UserObject,
	GatewayOpcode,
	GatewayPayload,
	connectWebSocket,
	Route,
	BucketPool,
	ResourcePool
} from "./deps.ts";

class Client
{
	readonly user: User;
	private _bucketPool: BucketPool;
	private _resPool: ResourcePool;

	constructor( userData: UserObject ){
		this.user = new User(userData);
		this._bucketPool = new BucketPool();
		this._resPool = new ResourcePool();
	}

	/** Event Listener */
	[Symbol.asyncIterator] = async function*(){
		return 1;
	}
	
	static async getUserData( token: string ): Promise<UserObject>
	{
		const r = await fetch(Endpoint.api+"/users/@me",{
			"method": "GET",
			"headers": new Headers([
				["Authorization", "Bot "+token],
				["User-Agent", "DiscordBot ("+LibraryMeta.url+", "+LibraryMeta.version+") Deno/"+String(Deno.version.deno)],
				["Content-Type", "application/json"],
				["X-RateLimit-Precision", "millisecond"],
			])
		});
		//console.log("=============================");
		//console.log(r.status);
		//console.log(r.headers);
		//console.log(JSON.stringify(await r.json()));
		//console.log("=============================");

		// If the bot is unauthorised, e.g. token is invalid
		if (r.status === 401) throw new DiscordError("Unauthorised.");
		else if (r.status === 429) throw new DiscordError("Damn! Rate limited.");
		return await r.json() as UserObject;
	} 
}

export async function createClient( token: string )
{
	const ud = await Client.getUserData(token);
	return new Client(ud);
}

async function createSockClient( token: string )
{
	const sock = await connectWebSocket(Endpoint.gateway);
	let heartbeatInterval = 0;
	let heartId = 0;
	let awaitingRepsone = false;
	for await (const msg of sock.receive())
	{
		if (typeof msg === "string")
		{
			const parsed = JSON.parse(msg) as GatewayPayload;
			if (parsed.opcode === GatewayOpcode.HELLO)
			{
				heartbeatInterval = Number(parsed.data["heartbeat_interval"]);
				heartId = setInterval(async()=>{
					// socket died on discord's end
					if (awaitingRepsone)
					{
						sock.close(2000);
						clearInterval(heartId);
						return;
					}
					awaitingRepsone = true;
					await sock.send(JSON.stringify({
						"opcode": GatewayOpcode.HEARTBEAT,
						"data": {}
					} as GatewayPayload));
				}, heartbeatInterval);

				// Now identify
				await sock.send(JSON.stringify({
					"opcode": GatewayOpcode.IDENTIFY,
					"data": {
						"token": token,
						
					}
				} as GatewayPayload));
			}
			else if (parsed.opcode === GatewayOpcode.HEARTBEAT_ACK)
			{
				awaitingRepsone = false;
			}
			GatewayOpcode.DISPATCH
		}
	}
}
