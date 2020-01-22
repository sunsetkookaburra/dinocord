# Current API Documentation

## `createClient( token: string ): Client`

## `User`
### Properties:
`.id: Snowflake`<br>
`.name: string`<br>
`.tag: string`<br>

## `Client extends User`
### Properties:
#### `.guilds: GuildMap`
### Methods:
`.getGuild( guildId: Snowflake ): Promise<Guild>`<br>
`.leaveGuild( guild: Snowflake | Guild ): Promise<void>`<br>

## `Guild`
### Properties:
`.id: Snowflake`<br>
`.name: string`<br>
`.created: Date`<br>