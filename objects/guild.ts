import {
    Snowflake,
    ISO8601
} from "../constants.ts";

export class Guild
{
    public readonly id: Snowflake;
    public readonly name: string;
    public readonly icon: string | null;
    public readonly splash: string | null;
    public readonly owner: boolean | undefined;
    public readonly ownerId: Snowflake;
    public readonly permissions: number | undefined
    public readonly region: string;
    public readonly afkChannelId: Snowflake | null;
    public readonly afkTimeout: number;
    public readonly embedEnabled: boolean | undefined;
    public readonly embedChannelId: Snowflake | undefined;
    public readonly verificationLevel: number;
    public readonly defaultMessageNotifications: number;
    public readonly explicitContentFilter: number;
    public readonly roles: Role[];
    public readonly emojis: Emoji[];
    public readonly features: GuildFeature[];
    public readonly mfaLevel: number;
}
