// Copyright (c) 2020 Oliver Lenehan. All rights reserved. MIT license.

export type Snowflake = string & { isSnowflake: true };

/** Snowflake utility */
export class SnowflakeBuilder
{
    /** 0000hrs 1st Jan 2015, start of "Discord Time". */
    static DISCORD_EPOCH = 1420070400000;
    /** Extract date from snowflake. */
    static getDate( s: Snowflake )
    {
        return new Date((parseInt(s) >> 22) + this.DISCORD_EPOCH);
    }
}