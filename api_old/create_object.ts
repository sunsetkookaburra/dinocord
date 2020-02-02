// Copyright (c) 2020 Oliver Lenehan. All rights reserved. MIT license.

// each needs to export an Init aka shortened version for users.
// Need object types but for end user (no point in creating a new user for example.)

import { ClientContext } from './net.ts'
import { Channel, ChannelObject } from './channel.ts';
import { Guild, GuildObject } from './guild.ts';
import { User, UserObject } from './user.ts';
import { Message, MessageObject } from './message.ts';

export interface PublicObjectTypes {
    'channel': [ChannelObject,Channel];
    'guild': [GuildObject,Guild];
    'message': [MessageObject,Message];
}

interface ObjectTypes extends PublicObjectTypes {
    'user': [UserObject,User];
}


export function createObject<T extends keyof ObjectTypes, I extends ObjectTypes[T][0]>( ctx: ClientContext, type: T, init: I ): ObjectTypes[T][1] {
    if( type === 'channel' ){
        let o = new Channel();
        //ctx.cache.set(o.id,o);
        return o;
    }
    else if( type === 'guild' ){
        let o = new Guild(init as GuildObject);
        //ctx.cache.set(o.id,o);
        return o;
    }
    else if( type === 'user' ){
        let o = new User(init as UserObject);
        //ctx.cache.set(o.id,o);
        return o;
    }
    else if( type === 'message' ){
        let o = new Message();
        //ctx.cache.set(o.id,o);
        return o;
    }
    throw "INVALID OBJECT TYPE";
}
