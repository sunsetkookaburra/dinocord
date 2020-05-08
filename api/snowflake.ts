// Copyright (c) 2020 Oliver Lenehan. All rights reserved. MIT license.

import { Snowflake } from "./data_object/mod.ts";

const DISCORD_EPOCH = 1420070400000;

export function getSnowflakeDate(s: Snowflake) {
	const snoNum = BigInt.asUintN(65, BigInt(s));
	return new Date(DISCORD_EPOCH + Number(snoNum >> BigInt(22)));
}
