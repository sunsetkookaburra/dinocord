// Copyright (c) 2020 Oliver Lenehan. All rights reserved. MIT license.

import { Snowflake, GuildObject } from "./data_objects.ts";

export class Guild
{
    public id: Snowflake;
    public name: string;
    public icon: string | null;

    constructor( guildInit: GuildObject ){
        this.id = guildInit.id;
        this.name = guildInit.name;
        this.icon = guildInit.icon || null;
    }
}

export type GuildMap = Map<Snowflake, Guild>;