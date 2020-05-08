// Copyright (c) 2020 Oliver Lenehan. All rights reserved. MIT license.

import { Snowflake, UserObject } from "./data_object/mod.ts";

//@public_api
/** A Discord User. */
export class User {
	/** The User's ID. */
	readonly id: Snowflake;
	/** The name of the user, e.g. `"name"#1234`. */
	readonly name: string;
	/** The tag number of the user, e.g. `name#"1234"`. */
	readonly tag: string;

	constructor(userInit: UserObject) {
		this.id = userInit.id;
		this.name = userInit.username;
		this.tag = userInit.discriminator;
	}

	private [Deno.customInspect]() {
		return this.name + "#" + this.tag;
	}

	private [Symbol.toPrimitive](hint: string) {
		if (
			hint === "string" || hint === "default"
		) {
			return this[Deno.customInspect]();
		}
		return null;
	}
}
