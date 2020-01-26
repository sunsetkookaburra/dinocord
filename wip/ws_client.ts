// Copyright (c) 2020 Oliver Lenehan. All rights reserved. MIT license.

import { AsyncEventQueue } from "./queue.ts";
import { connectWebSocket, WebSocket, WebSocketMessage } from "https://deno.land/std@v0.30.0/ws/mod.ts";
import { HTTPClient } from './http_client.ts';

(async()=>{
	const p = new Uint8Array(1024);
	const http = new HTTPClient('token');
	const gateway = await http.request('GET','/gateway').then(v=>{return v.json()})['url'];
	console.log(gateway);
	const ws = await connectWebSocket(gateway);
	const wsMsg = ws.receive();
	console.log(wsMsg.next().then(v=>{return v.value}));
})();
