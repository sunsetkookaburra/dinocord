// Copyright (c) 2020 Oliver Lenehan. All rights reserved. MIT license.
import { ISO8601 } from '../deps.ts';
import { Snowflake } from './snowflake.ts';

//@public_api
/** A Discord User. */
export class User
{
	/** The User's ID. */
	readonly id: Snowflake;

	/** The name of the user, e.g. `"name"#1234`. */
	readonly name: string;

	/** The tag number of the user, e.g. `name#"1234"`. */
	readonly tag: string;

	constructor( userInit: UserObject ) {
		this.id 	= userInit.id;
		this.name 	= userInit.username;
		this.tag 	= userInit.discriminator;

		this[Deno.symbols.customInspect]; // Reference so typescript outputs the property.
	}

	private [Deno.symbols.customInspect]() {
		return this.name + '#' + this.tag;
	}
}
