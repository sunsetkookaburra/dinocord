// Copyright (c) 2020 Oliver Lenehan. All rights reserved. MIT license.

export type Snowflake = string & { isSnowflake: true };

export class SnowflakeBuilder
{
    static EPOCH = 1420070400000;
    static getTimestamp( s: Snowflake )
    {
        return (parseInt(s) >> 22) + this.EPOCH;
    }
}