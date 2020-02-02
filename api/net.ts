// Copyright (c) 2020 Oliver Lenehan. All rights reserved. MIT license.

import { WebSocket, connectWebSocket, LibraryMeta, deferred } from '../deps.ts';
import { Snowflake, GatewayOpcode, GatewayPayload } from './data_objects.ts';
import { AsyncServiceQueue, AsyncEventQueue } from './queue.ts';

async function waitableDate( date: Date ): Promise<void> {
	let timerId: number;
	return new Promise(resolve=>{
		timerId = setInterval(()=>{
			if( Date.now() > date.valueOf() ){
				clearInterval(timerId);
				resolve();
			}
		}, 100); // wait 100ms until retry
	});
}

export async function createClientContext( token: string ){
    
    let http = new DiscordHTTPClient(token);
    let gateway: string = (await http.requestJson('GET','/gateway'))['url'];
    let ws = new DiscordWSClient(gateway, token);
    await ws.ready;
    let ctx =  new ClientContext(http, ws);
    return ctx;
}

export class ClientContext {
    // any time a data object is created, cache it
    cache: Map<Snowflake, unknown>;
    http: DiscordHTTPClient;
    ws: DiscordWSClient;
    constructor( http: DiscordHTTPClient, ws: DiscordWSClient ){
        this.cache = new Map();
        this.http = http;
        this.ws = ws;
    }
}

// done as far as a working solution, just a bit of polish
class DiscordHTTPClient
{
    static Endpoint = 'https://discordapp.com/api/v6';
    static UserAgent = `DiscordBot (${LibraryMeta.url}, ${LibraryMeta.version}) Deno/${Deno.version.deno}`;
    private headers: Headers;
    private queue = new AsyncServiceQueue();
    private buckets = new Map<Snowflake, Bucket>();
    constructor( token: string ){
        this.headers = new Headers([
			['Authorization', `Bot ${token}`],
			['User-Agent', DiscordHTTPClient.UserAgent],
			['X-RateLimit-Precision', 'second'],
        ]);
    }
    static route(path: string, substitutions?: {[key: string]: string} ): Route {
        return {
            resources: [path],
            url: (()=>{
                let url = path;
                for( let k of Object.keys(substitutions||{}) ){
                    url = url.replace(':'+k, Deno.inspect(substitutions[k]));
                }
                return url;
            })()
        }
    }
    async request( method: HTTPMethod, path: string, options?: RequestOptions ){
        // format path for api
        let route = DiscordHTTPClient.route(path, (options||{}).substitutions);
        // check bucket
        for( let [key, bucket] of this.buckets ){
            // if bucket low, wait until refill
            if( path === bucket.path && bucket.remaining < 2 ){
                await waitableDate(new Date(bucket.reset));
            }
        }
        // serve the request
        let result = await this.queue.serve<Response>(route.resources,async()=>{
            let body: string; // consider making Uint8Array
            if( (options||{}).type === 'json' ){
                this.headers.set('Content-Type', 'application/json');
                body = JSON.stringify(body);
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
            let result = await fetch('https://discordapp.com/api'+route.url, {
                'method': method,
                'headers': this.headers,
                'body': body
            });
            this.headers.delete('Content-Type');
            return result;
        });
        // check for rate-limit headers
		if( result.headers.has('X-RateLimit-Bucket') ){
			let bucketId = result.headers.get('X-RateLimit-Bucket');
			if( this.buckets.has(bucketId) ){
				if( path !== this.buckets.get(bucketId).path) console.log('AAAAAAAA ROUTE LIMIT PATHS CHANGE !!!!');
				this.buckets.get(bucketId).limit = Number(result.headers.get('X-RateLimit-Limit'));
				this.buckets.get(bucketId).remaining = Number(result.headers.get('X-RateLimit-Remaining'));
				this.buckets.get(bucketId).reset = Number(result.headers.get('X-RateLimit-Reset'));
				this.buckets.get(bucketId).path = path;
			}
			else {
				this.buckets.set(bucketId, {
					limit: Number(result.headers.get('X-RateLimit-Limit')),
					remaining: Number(result.headers.get('X-RateLimit-Remaining')),
					reset: Number(result.headers.get('X-RateLimit-Reset')),
					path: path
				});
			}
        }
        return result;
    }
    // Returns result as an object.
    async requestJson( method: HTTPMethod, path: string, options?: RequestOptions ){
        return (await this.request(method, path, options)).json();
    }
}

class DiscordWSClient
{
    ready = deferred<void>();
    private events = new AsyncEventQueue();
	private gateway: string;
    private socket: WebSocket;
    private heartbeatTimerId: number;
    private sequenceId: number;
    private receivedHeartbeatAck: boolean = true;
    private outboundQueue = new AsyncEventQueue(550);
    [Symbol.asyncIterator] = this.events[Symbol.asyncIterator];
	constructor( gateway: string, private token: string ){
        this.init(gateway);
        this.initOutbound();
        this.listenToDiscord();        
    }
    private async init( gateway: string ){
        this.gateway = gateway + '?v=6&encoding=json';
        this.socket = await connectWebSocket(this.gateway);
        let heartbeatInterval = JSON.parse((await this.socket.receive().next()).value)['d']['heartbeat_interval'];
        this.heartbeat();
        this.heartbeatTimerId = setInterval(this.heartbeat, heartbeatInterval);
        this.ready.resolve();
    }
    private async initOutbound(){
        await this.ready;
        for await( const payloadToSend of this.outboundQueue ){
            await this.socket.send(payloadToSend as string);
        }
    }
    private async listenToDiscord(){
        await this.ready;
        for await( const e of this.socket.receive() ){
            let eventObj = JSON.parse(e as string) as GatewayPayload;
            if( eventObj.op === GatewayOpcode.DISPATCH ){

            }
            else if( eventObj.op === GatewayOpcode.HEARTBEAT_ACK ){
                this.receivedHeartbeatAck = true;
            }
        }
    }
    private heartbeat(){
        if( !this.receivedHeartbeatAck ){
            clearInterval(this.heartbeatTimerId);
            this.socket.close(2000);
            console.log("CLOSED WEBSOCKET");
        }
        this.receivedHeartbeatAck = false;
        this.sendPayload(GatewayOpcode.HEARTBEAT, (this.sequenceId===undefined)?null:this.sequenceId);
    }
	// should handle sequence number automatically.
	// recognise hard limit of 4096 bytes for a payload
	async sendPayload( opcode: number, eventData: any ): Promise<void> {
        this.outboundQueue.post(JSON.stringify({
            'op': opcode,
            'd': eventData
        }));
	}
}

// Types and Interfaces

type HTTPMethod = 'GET' | 'POST' | 'PUT' | 'DELETE' | 'PATCH'

interface Bucket {
	limit:		number;
	remaining:	number;
	reset:		number;
	path:		string;
}

type RequestOptions = ({type: 'json', body: any} | {type: 'form', body: any, fileMimeType: string}) & {substitutions: {[key: string]: string}}
interface Route {
    url: string;
    resources: string[];
}

interface Bucket {
	limit:		number;
	remaining:	number;
	reset:		number;
	path:		string;
}
