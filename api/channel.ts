// Copyright (c) 2020 Oliver Lenehan. All rights reserved. MIT license.
import { ISO8601 } from '../deps.ts';
import { Snowflake } from './snowflake.ts';
import { UserObject } from './user.ts';

/** What type of channel. */
export enum ChannelTypes {
	/** Guild Text Channel. */
	TEXT		= 0,
	/** Message Chat between users. */
	DM				= 1,
	/** Guild Voice Channel. */
	VOICE 	= 2,
	/** Group Chat. */
	GROUP		= 3,
	/** Guild Category. */
	CATEGORY 	= 4,
	/** Guild News Channel. */
	NEWS		= 5,
	/** Store Channel to sell games. */
	STORE		= 6
}

/** JSON representation of a Discord Channel. */
export interface ChannelObject {
	id:						Snowflake;
	type:					number;
	guild_id:				Snowflake;
	position:				number;
	permission_overwrites?//:Overwrite[]
	name?:					string;
	topic?:					string;
	nsfw?:					boolean
	last_message_id:		Snowflake;
	bitrate?:				number;
	user_limit?:			number
	rate_limit_per_user?:	number;
	recipients?:			UserObject[]
	icon?:					string;
	owner_id?:				Snowflake;
	application_id?:		Snowflake;
	parent_id?:				Snowflake;
	last_pin_timestamp?:	ISO8601;
}


export class Channel
{
    readonly id:    Snowflake;
    readonly type:  number;
}

class TextChannel
{
    
}
