// Copyright (c) 2020 Oliver Lenehan. All rights reserved. MIT license.

import { Snowflake, GuildObject } from "./data_object/mod.ts";

export class Guild
{
    public id: Snowflake;
    public name: string;
    public icon: string | null;
    //public channels: Channel[]

    constructor( guildInit: GuildObject ){
        this.id = guildInit.id;
        this.name = guildInit.name;
        this.icon = guildInit.icon || null;
    }
}

export type GuildMap = Map<Snowflake, Guild>;