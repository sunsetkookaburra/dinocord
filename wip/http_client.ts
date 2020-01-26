// Copyright (c) 2020 Oliver Lenehan. All rights reserved. MIT license.

import { AsyncServiceQueue } from './queue.ts'

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

type Snowflake = string
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

export class HTTPClient
{
    static Endpoint = 'https://discordapp.com/api/v6'
    static UserAgent = `DiscordBot (${'https://github.com/sunsetkookaburra/dinocord'}, ${'v0.0.1'}) Deno/${Deno.version.deno}`
    private headers: Headers
    private queue = new AsyncServiceQueue()
    private bucket = new Map<Snowflake, Bucket>()
    constructor( token: string ){
        this.headers = new Headers([
			['Authorization', `Bot ${token}`],
			['User-Agent', HTTPClient.UserAgent],
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
        let route = HTTPClient.route(path, (options||{}).substitutions);
        // check bucket
        for( let [key, bucket] of this.bucket ){
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
			if( this.bucket.has(bucketId) ){
				if( path !== this.bucket.get(bucketId).path) console.log('AAAAAAAA ROUTE LIMIT PATHS CHANGE !!!!');
				this.bucket.get(bucketId).limit = Number(result.headers.get('X-RateLimit-Limit'));
				this.bucket.get(bucketId).remaining = Number(result.headers.get('X-RateLimit-Remaining'));
				this.bucket.get(bucketId).reset = Number(result.headers.get('X-RateLimit-Reset'));
				this.bucket.get(bucketId).path = path;
			}
			else {
				this.bucket.set(bucketId, {
					limit: Number(result.headers.get('X-RateLimit-Limit')),
					remaining: Number(result.headers.get('X-RateLimit-Remaining')),
					reset: Number(result.headers.get('X-RateLimit-Reset')),
					path: path
				});
			}
        }
        return result;
    }
}
