// Copyright (c) 2020 Oliver Lenehan. All rights reserved. MIT license.

import { Snowflake } from './data_object/mod.ts';

export class Message
{
    id: Snowflake;
    text: string;
    constructor( msgInit: any ){
        this.id = "" as Snowflake;
        this.text = ""
    }
    async reply(msg: string){

    }
}
