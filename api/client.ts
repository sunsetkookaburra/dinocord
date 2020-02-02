// Copyright (c) 2020 Oliver Lenehan. All rights reserved. MIT license.

import { User } from "./user.ts";
import { UserObject } from "./data_objects.ts";
import { createClientContext, ClientContext } from "./net";

class Client extends User {
    constructor( userInit: UserObject, private context: ClientContext ){
        super(userInit);
    }
}

export async function createClient( token: string ) {
    let ctx = await createClientContext(token);
    ctx
}
