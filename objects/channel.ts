import { 
    Snowflake,
    ISO8601
} from "../constants.ts";

export class Channel
{
    public readonly id: Snowflake;
    public readonly type: number;
}

class TextChannel extends Channel
{
    
}
