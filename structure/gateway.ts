// Copyright (c) 2020 Oliver Lenehan. All rights reserved. MIT license.

/** Discord Gateway Opcodes */
export enum GatewayOpcode {
	/** Action an Event.  
		Client: `Receives` */
	DISPATCH				= 0,
	/** Ping the gateway.  
		Client: `Sends, Receives` */
	HEARTBEAT				= 1,
	/** Client Handshake.  
		Client: `Sends` */
	IDENTIFY				= 2,
	/** Update Discord Status.  
		Client: `Sends` */
	STATUS_UPDATE			= 3,
	/** Join/Move/Leave voice channels.  
		Client: `Sends` */
	VOICE_STATE_UPDATE		= 4,
	/** Resume closed gateway connection.  
		Client: `Sends` */
	RESUME					= 6,
	/** Ready to reconnect to gateway.  
		Client: `Receives` */
	RECONNECT				= 7,
	/** Request members of a guild.  
		Client: `Sends` */
	REQUEST_GUILD_MEMBERS	= 8,
	/** Client has an ivalid session id.  
		Client: `Receives` */
	INVALID_SESSION			= 9,
	/** Sent after first connection, contains heartbeat time.  
		Client: `Receives` */
	HELLO					= 10,
	/** Acknowledges the heartbeat was received.  
		Client: `Receives` */
	HEARTBEAT_ACK			= 11
}

/** Discord Gateway Payload */
export interface GatewayPayload
{
	/** Payload Opcode */
	opcode: GatewayOpcode,
	/** Event Data */
	data: any,
	/** Sequence number (for resume / heartbeast) */
	sequenceNumber?: number,
	/** Event Name */
	eventName?: string
}
