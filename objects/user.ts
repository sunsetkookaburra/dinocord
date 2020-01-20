import {
	Snowflake,
	UserFlags,
	PremiumTypes
} from "../constants.ts";

export interface UserStructure
{
	readonly id:			Snowflake;
	readonly username:		string;
	readonly discriminator:	string;
	readonly avatar?:		string;
	readonly bot?:			boolean;
	readonly system?:		boolean;
	readonly mfa_enabled?:	boolean;
	readonly locale?:		string;
	readonly verified?:		boolean;
	readonly email?:		string;
	readonly flags?:		UserFlags | undefined;
	readonly premium_type?:	PremiumTypes | undefined;
}

export class User
{
	/** The User's ID. */
	public readonly id: Snowflake;
	/** The name of the user, e.g. `"name"#1234`. */
	public readonly name: string;
	/** The tag number of the user, e.g. `name#"1234"`. */
	public readonly tag: string;
	/** List of guilds to which the user belongs. */
	public readonly guilds //:Guild[];
	constructor( userData: UserStructure )
	{
		this.id 	= userData.id;
		this.name 	= userData.username;
		this.tag 	= userData.discriminator;
	}
}
