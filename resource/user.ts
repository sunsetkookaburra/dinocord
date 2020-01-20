// Copyright (c) 2020 Oliver Lenehan. All rights reserved. MIT license.
import {
	Snowflake,
	UserObject
} from "../deps.ts";

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
	constructor( userData: UserObject )
	{
		this.id 	= userData.id;
		this.name 	= userData.username;
		this.tag 	= userData.discriminator;
	}
}
