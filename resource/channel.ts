// Copyright (c) 2020 Oliver Lenehan. All rights reserved. MIT license.
import { 
    Snowflake,
    ISO8601
} from "../deps.ts";

export class Channel
{
    public readonly id: Snowflake;
    public readonly type: number;
}

class TextChannel extends Channel
{
    
}
