// Copyright (c) 2020 Oliver Lenehan. All rights reserved. MIT license.
import { Snowflake } from "../deps.ts";

export class SnowflakeBuilder
{
    static EPOCH = 1420070400000;
    static getTimestamp( s: Snowflake )
    {
        (parseInt(s) >> 22) + this.EPOCH;
    }
}