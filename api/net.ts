// Copyright (c) 2020 Oliver Lenehan. All rights reserved. MIT license.

import {
	WebSocket,
	isWebSocketCloseEvent,
	connectWebSocket,
	WebSocketEvent,
	LibraryMeta,
	deferred,
} from "../deps.ts";
import {
	Snowflake,
	GatewayOpcode,
	GatewayPayload,
	Presence,
} from "./data_object/mod.ts";
import { AsyncServiceQueue, AsyncEventQueue } from "./queue.ts";
import { dinoLog } from "./debug.ts";

async function waitableDate(date: Date): Promise<void> {
	let timerId: number;
	return new Promise((resolve) => {
		timerId = setInterval(() => {
			if (Date.now() > date.valueOf()) {
				clearInterval(timerId);
				resolve();
			}
		}, 100); // wait 100ms until retry
	});
}

/*
export async function createClientContext( token: string, initialPresence?: Presence ){
	let http = new DiscordHTTPClient(token);
	let gateway: string = (await http.requestJson<any>('GET','/gateway'))['url'];
	let ws = new DiscordWSClient(gateway, token);
	await ws.init(initialPresence)
	let ctx = new ClientContext(http, ws);
	return ctx;
}*/

export class ClientContext {
	// any time a data object is created, cache it
	cache: Map<Snowflake, unknown>;
	http: DiscordHTTPClient;
	ws: DiscordWSClient;
	constructor(http: DiscordHTTPClient, ws: DiscordWSClient) {
		this.cache = new Map();
		this.http = http;
		this.ws = ws;
	}
}

async function initialiseObjects(
	ctx: ClientContext,
	arr: ([Snowflake, "channel" | "guild" | "user"] | null)[],
) {
	for (let k of arr) {
		if (!k || !k[0]) continue;
		if (!ctx.cache.has(k[0])) {
			let o: any;
			if (k[1] === "channel") {
				o = await ctx.http.requestJson("GET", "/channels/{channel.id}", {
					substitutions: { "{channel.id}": k[0] },
				});
				ctx.cache.set(k[0], o);
			} else if (k[1] === "guild") {
				o = await ctx.http.requestJson("GET", "/guilds/{guild.id}", {
					substitutions: { "{guild.id}": k[0] },
				});
				ctx.cache.set(k[0], o);
			} else if (k[1] === "user") {
				o = await ctx.http.requestJson("GET", "/users/{user.id}", {
					substitutions: { "{user.id}": k[0] },
				});
				ctx.cache.set(k[0], o);
			}
		}
	}
}

// done as far as a working solution, just a bit of polish
// queue needs to be reimplemented
// need an endpoints property
export class DiscordHTTPClient {
	static Endpoint = "https://discordapp.com/api/v6";
	static UserAgent =
		`DiscordBot (${LibraryMeta.url}, ${LibraryMeta.version}) Deno/${Deno.version.deno}`;
	private headers: Headers;
	private queue = new AsyncServiceQueue();
	private buckets = new Map<Snowflake, Bucket>();
	constructor(token: string) {
		this.headers = new Headers([
			["Authorization", `Bot ${token}`],
			["User-Agent", DiscordHTTPClient.UserAgent],
			["X-RateLimit-Precision", "second"],
		]);
		dinoLog("debug", "[HTTPClient] Ready.");
	}
	static route(path: string, substitutions?: { [key: string]: string }): Route {
		return {
			resources: [path],
			url: (() => {
				let url = path;
				// return unmodified url if there are no substitutions to be made
				if (substitutions === undefined) return url;
				for (let k of Object.keys(substitutions)) {
					url = url.replace(k, Deno.inspect(substitutions[k]));
				}
				return url;
			})(),
		};
	}
	async request(
		method: HTTPMethod,
		path: string,
		options: RequestOptions = {},
	) {
		// format path for api
		let route = DiscordHTTPClient.route(path, options.substitutions);
		// check bucket
		for (let [key, bucket] of this.buckets) {
			// if bucket low, wait until refill
			//console.log(path, bucket);
			if (path === bucket.path && bucket.remaining < 2) {
				await waitableDate(new Date(bucket.reset));
				break;
			} else if (path === bucket.path) {
				bucket.remaining--;
			}
		}
		// serve the request
		// route.resources is passed as require resources, the callback is called when they first become available
		let result = await this.queue.serve<Response>(route.resources, async () => {
			let body: string | null = null; // consider making Uint8Array
			if (options.type === "json") {
				this.headers.set("Content-Type", "application/json");
				body = JSON.stringify(options.body);
			}
			/* IMPLEMENT FOR FILES
			else if( options.type === 'form' ){
				let boundary = '----DiscordFormBoundary'+Array.from(crypto.getRandomValues(new Uint32Array(2))).map(v=>v.toString(36)).join('');
				this.headers.set('Content-Type', 'multipart/form-data; boundary='+boundary);
				for( let key of Object.keys(options.body) ){
					body += boundary+'\r\n';
					body += 'Content-Disposition: form-data; name="'+key+'"'+'\r\n\r\n'
					body += DATA
					body += '\r\n'
				}
				body += boundary+'--'
			}*/
			let result = await fetch(DiscordHTTPClient.Endpoint + route.url, {
				"method": method,
				"headers": this.headers,
				"body": body,
			});
			this.headers.delete("Content-Type");
			return result;
		});
		// check for rate-limit headers
		if (result.headers.has("X-RateLimit-Bucket")) {
			let bucketId = result.headers.get("X-RateLimit-Bucket") as Snowflake;
			if (this.buckets.has(bucketId)) {
				if (path !== this.buckets.get(bucketId)!.path) {
					console.log("AAAAAAAA RATE LIMIT BUCKET PATHS CHANGE !!!!");
				}
				this.buckets.get(bucketId)!.limit = Number(
					result.headers.get("X-RateLimit-Limit"),
				);
				this.buckets.get(bucketId)!.remaining = Number(
					result.headers.get("X-RateLimit-Remaining"),
				);
				this.buckets.get(bucketId)!.reset = Number(
					result.headers.get("X-RateLimit-Reset"),
				);
				this.buckets.get(bucketId)!.path = path;
			} else {
				this.buckets.set(bucketId, {
					limit: Number(result.headers.get("X-RateLimit-Limit")),
					remaining: Number(result.headers.get("X-RateLimit-Remaining")),
					reset: Number(result.headers.get("X-RateLimit-Reset")),
					path: path,
				});
			}
		}
		dinoLog(
			"debug",
			`[HTTPClient] Content-Type: ${options?.type} ${method} ${route.url}`,
		);
		return result;
	}
	// Returns result as an object.
	async requestJson<T>(
		method: HTTPMethod,
		path: string,
		options: RequestOptions = {},
	) {
		const r = await this.request(method, path, options);
		return r.json() as Promise<T>;
	}
}

class Heart {
	private timerID: number | null = null;
	private wasAck: boolean = false;
	private currentInterval = 50000;
	constructor(private onBeat: () => void, private onStop?: () => void) {}
	start(interval: number) {
		this.currentInterval = interval;
		if (this.timerID !== null) clearInterval(this.timerID);
		this.onBeat();
		this.timerID = setInterval(() => {
			if (!this.wasAck) this.stop();
			else this.onBeat();
			this.wasAck = false; //reset flag
		}, interval);
	}
	beatExtra() {
		this.onBeat();
	}
	acknowledge() {
		this.wasAck = true;
	}
	// return last internval
	stop() {
		if (this.timerID !== null) clearInterval(this.timerID);
		if (this.onStop !== undefined) this.onStop();
		this.wasAck = false;
	}
}

export class DiscordWSClient {
	// "subscribeable" queue of events (limit chance of mucking up async generator code)
	public eventQueue: AsyncEventQueue<GatewayPayload>;
	private gateway: string;
	private token: string;
	private discordEndpointQueue: AsyncEventQueue<GatewayPayload>;
	private socket: WebSocket | null = null;
	private listener: AsyncIterableIterator<WebSocketEvent> | null = null;
	private heart: Heart;
	private sequenceID: number | null = null;
	private readyEventReceived = deferred<GatewayPayload>();
	private sessionID: string | null = null;

	constructor(token: string, gateway: string) {
		this.gateway = gateway + "?v=6&encoding=json";
		this.token = token;
		this.discordEndpointQueue = new AsyncEventQueue<GatewayPayload>(
			550,
			async (payload) => {
				dinoLog(
					"debug",
					`[WSClient@${this.sessionID}] SEND::OP::${GatewayOpcode[payload.op]}`,
				);
				if (!this.socket?.isClosed) this.socket!.send(JSON.stringify(payload));
				else this.discordEndpointQueue.exit();
			},
		);
		this.eventQueue = new AsyncEventQueue();
		this.heart = new Heart(() => {
			// send heartbeat to discord
			//dinoLog('debug', `[WSClient@${this.sessionID}] SEND::OP::HEARTBEAT`);
			this.sendPayload({
				op: GatewayOpcode.HEARTBEAT,
				d: this.sequenceID,
			});
		}); // bind to allow using class vars. this will break the websocket on a disconnection
		dinoLog("debug", "[WSClient] Created.");
	}
	sendPayload(p: GatewayPayload) {
		this.discordEndpointQueue.post(p);
	}
	// init socket, begin heartbeat, then return
	async init() {
		// figure out how to 'reboot'
		//this.readyEventReceived = deferred<GatewayPayload>();
		this.discordEndpointQueue.run();
		this.socket = await connectWebSocket(this.gateway);
		this.listener = this.socket[Symbol.asyncIterator]();
		let firstMsg = JSON.parse(
			(await this.listener.next()).value,
		) as GatewayPayload;
		if (firstMsg.op !== GatewayOpcode.HELLO) {
			dinoLog(
				"critical",
				`[WSClient] Expected HELLO as 1st message, but received: ${GatewayOpcode[firstMsg.op]}`,
			);
		}
		this.heart.start(firstMsg.d["heartbeat_interval"]);
		dinoLog("info", "[WSClient] Opened and heartbeating.");
		dinoLog("debug", "[WSClient] Started.");
		// run message loop
		this.messageLoop();
	}
	// send identify payload, then await and return READY
	async identify(presenceInit: Presence) {
		this.sendPayload({
			op: GatewayOpcode.IDENTIFY,
			d: {
				"token": this.token,
				"properties": {
					"$os": Deno.build.os,
					"$browser": "dinocord",
					"$device": "dinocord",
				},
				"presence": presenceInit,
			},
		});
		return this.readyEventReceived;
	}
	private async messageLoop() {
		let payload: GatewayPayload;
		for await (const msg of this.listener!) {
			if (typeof msg === "string") {
				payload = JSON.parse(msg);
				if (payload.op === GatewayOpcode.HEARTBEAT_ACK) {
					dinoLog("debug", `[WSClient@${this.sessionID}] RECV::OP::ACK`);
					this.heart.acknowledge();
				} else if (payload.op === GatewayOpcode.HEARTBEAT) {
					dinoLog(
						"debug",
						`[WSClient@${this.sessionID}] SEND::OP::HEARTBEAT EXTRA`,
					);
					this.heart.beatExtra();
				} else if (payload.t === "READY") {
					dinoLog(
						"debug",
						`[WSClient@${this.sessionID}] RECV::OP::DISPATCH::READY`,
					);
					this.readyEventReceived.resolve(payload);
					this.sessionID = payload.d["session_id"];
				} else if (payload.op === GatewayOpcode.DISPATCH) {
					dinoLog(
						"debug",
						`[WSClient@${this.sessionID}] RECV::OP::DISPATCH::${payload.t}`,
					);
					this.eventQueue.post(payload);
				} else if (payload.op === GatewayOpcode.INVALID_SESSION) {
					dinoLog(
						"critical",
						`[WSClient@${this.sessionID}] RECV::OP::INVALID_SESSION`,
					);
					this.gatewayClose();
				} else if (payload.op === GatewayOpcode.RECONNECT) {
					dinoLog(
						"debug",
						`[WSClient@${this.sessionID}] ___UNHANDLED___RECV::OP::RECONNECT`,
					);
				} else {
					dinoLog(
						"debug",
						`[WSClient@${this.sessionID}] ___UNHANDLED___RECV::OP::${GatewayOpcode[payload.op]}`,
					);
				}
			} else if (isWebSocketCloseEvent(msg)) {
				// log closure of socket
				dinoLog("info", `[WSClient@${this.sessionID}] Socket closed.`);
				this.close();
				if (msg.code === 4004){
					throw "Authentication Failed: Your token may be invalid."
				}
				break;
			}
		}
	}
	async gatewayClose(code = 4000) {
		dinoLog(
			"debug",
			`[WSClient@${this.sessionID}] WSClient->gatewayClose(${code})`,
		);
		this.socket?.close(code);
	}
	public close() {
		this.heart.stop();
		this.discordEndpointQueue.exit();
	}
}

// Types and Interfaces

type HTTPMethod = "GET" | "POST" | "PUT" | "DELETE" | "PATCH";

interface Bucket {
	limit: number;
	remaining: number;
	reset: number;
	path: string;
}

// convert to an interface
interface RequestOptions {
	type?: "json" | "form";
	body?: any;
	fileMimeType?: string;
	substitutions?: Record<string, string>;
}

interface Route {
	url: string;
	resources: string[];
}

interface Bucket {
	limit: number;
	remaining: number;
	reset: number;
	path: string;
}
