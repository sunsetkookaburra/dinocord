import { HTTPMethod, Endpoint, Snowflake } from "./deps.ts";

type BucketID = string & {}

interface Bucket {
	limit: number;
	remaining: number;
	reset: number;
}

export class BucketPool extends Map<BucketID, Bucket>{}

/** Small array extension to check whether resources are taken, and also unlock resources. */
export class ResourcePool {
	/** A list of the resources currently locked. */
	resources: string[] = [];
	/** Checks whether the resources are already in use. */
	inUse( resources: string[] ): boolean {
		for (let i = 0; i < resources.length; i++) {
			if (this.resources.includes(resources[i])) return true;
		}
		return false;
	}
	/** Lock the specified resources, allows even if already taken. */
	lock( resources: string[] ) {
		for (let i = 0; i < resources.length; i++) {
			if (!this.resources.includes(resources[i])){
				this.resources.push(resources[i]);
			}
		}
	}
	/** Unlock the specified resources. */
	unlock( resources: string[] ) {
		this.resources = this.resources.filter(res=>{
			return !resources.includes(res);
		});
	}
}

/** Substitutions for route. */
interface RouteOptions {
	channelId?:	Snowflake;
	guildId?:	Snowflake;
	userId?:	Snowflake;
	webhookId?:	Snowflake;
}

/** Wrapper around REST API URLs. Ensure resources are shared 
 * 	and not used at the same time to allow Bucket / Rate
 * 	management. */
export class Route {
	/** Formatted API Endpoint */
	url: string;
	private _res: string[];
	constructor( method: HTTPMethod, path: string, substitutions?: RouteOptions )
	{
		// Extract "Major Parameters" as resources.
		this._res = /:channelId|:messageId|:webhookId/g.exec(path);
		// Add current path as a resource.
		this._res.push(path);
		this._res.push(method);
		// Substitue values e.g. :channelId => {SNOWFLAKE}
		if (substitutions.channelId) path.replace(':channelId', substitutions.channelId);
		if (substitutions.guildId) path.replace(':channelId', substitutions.guildId);
		if (substitutions.userId) path.replace(':channelId', substitutions.userId);
		if (substitutions.webhookId) path.replace(':channelId', substitutions.webhookId);
		// Set url to api endpoint + path.
		this.url = Endpoint.api + path;
	}
	/** Resources required to use this path. */
	resources(): string[] {
		return this._res;
	}
}

