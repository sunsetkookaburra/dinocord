// Copyright (c) 2020 Oliver Lenehan. All rights reserved. MIT license.

import { AsyncEventQueue } from "./queue.ts";
import { connectWebSocket, WebSocket } from '../deps.ts';
import { HTTPClient } from './http_client.ts';

// creates objects from received

(async()=>{
	const p = new Uint8Array(1024);
	const http = new HTTPClient('token');
	const gateway = await http.request('GET','/gateway').then(v=>{return v.json()})['url'];
	console.log(gateway);
	const ws = await connectWebSocket(gateway);
	const wsMsg = ws.receive();
	console.log(wsMsg.next().then(v=>{return v.value}));
});

export class DiscordWSClient
{
	gateway: string;
	socketInitReady: Promise<void> = new Promise(r=>{});
	socket: Promise<WebSocket>;
	constructor( gateway: string, private token: string ){
		this.gateway = gateway + '?v=6&encoding=json';
		this.socket = connectWebSocket(this.gateway)
	}
	async*[Symbol.asyncIterator](){
		await this.socket;
		// this section listens for events and yields data to client context.
		for await( const msg of (await this.socket).receive() ){
			console.log(msg);
		}
	}
	private heartbeat(){
		
	}
	// should handle sequence number automatically.
	// recognise hard limit of 4096 bytes for a payload
	async sendPayload( opcode: number, eventData: any, eventName?: string ): Promise<void> {

	}
}
