// Copyright (c) 2020 Oliver Lenehan. All rights reserved. MIT license.
import { Log } from '../deps.ts';

export type LoggingLevel = "notset" | "critical" | "error" | "warning" | "info" | "debug";

class DinocordError {
	constructor(public level: LoggingLevel, public reason: string){
	}
	[Deno.symbols.customInspect](){
		return 'DinocordError['+this.level+']: ' + this.reason
	}
}

export function dinoLog(level: LoggingLevel, reason: string){
    (Log.getLogger("default") as any)[level](reason);
    if (level === 'critical') throw new DinocordError(level, reason)
}

export async function initLogging(level: LoggingLevel){
	level = level.toUpperCase() as LoggingLevel;
	await Log.setup({
		handlers: {
			default: new Log.handlers.ConsoleHandler("DEBUG", {
				formatter: r=>{
					return `[${new Date().toISOString()}][${r.levelName}][Dinocord] ${r.msg}`;
				}
			})
		},
		loggers: {
			default: {
				level: level,
				handlers: ['default']
			}
		}
	});
}
