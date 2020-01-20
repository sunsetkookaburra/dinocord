import { DiscordURLs,LibraryMeta, DiscordError } from "../constants.ts";
import { UserStructure, User } from "./user.ts";

class Client
{
	public readonly user: User;
	constructor( userData: UserStructure ){
		this.user = new User(userData);
	}
	/** Event Listener */
	[Symbol.asyncIterator] = async function* main(){
		return 1;
	}
	
	public static async getUserData( token: string )
	{
		const r = await fetch(DiscordURLs.api+"/users/@me",{
			"method": "GET",
			"headers": new Headers([
				["Authorization", "Bot "+token],
				["User-Agent", "DiscordBot ("+LibraryMeta.url+", "+LibraryMeta.version+") Deno/"+String(Deno.version.deno)],
				["Content-Type", "application/json"],
				["X-RateLimit-Precision", "millisecond"],
			])
		});
		//console.log(r.status);
		//console.log(r.headers);
		//console.log(JSON.stringify(await r.json()));
		// If the bot is unauthorised, e.g. token is invalid
		if (r.status === 401) throw new DiscordError("Unauthorised.");
		else if (r.status === 429) throw new DiscordError("Damn! Rate limited.");
		return await r.json() as UserStructure;
	}
}

export async function createClient( token: string )
{
	const ud = await Client.getUserData(token);
	return new Client(ud);
}
