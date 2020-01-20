/** Discord Gateway Opcodes */
export enum GatewayOpcode
{
	/** Dispatches an event.  
		Client Action: `Receive` */
	DISPATCH				= 0,

	/** Used for ping checking.  
		Client Action: Send, Receive */
	HEARTBEAT				= 1,

	/** Used for client handshake.  
		Client Action: Send */
	IDENTIFY				= 2,

	/** Used to update the client status.  
		Client Action: Send */
	STATUS_UPDATE			= 3,

	/** Used to join/move/leave voice channels.  
		Client Action: Send */
	VOICE_STATE_UPDATE		= 4,

	/** Used to resume a closed connection.  
		Client Action: Send */
	RESUME					= 6,

	/** Used to tell clients to reconnect to the gateway.  
		Client Action: Receive */
	RECONNECT				= 7,

	/** Used to request guild members.  
		Client Action: Send */
	REQUEST_GUILD_MEMBERS	= 8,

	/** Used to notify client they have an invalid session id.  
		Client Action: Receive */
	INVALID_SESSION			= 9,

	/** Sent immediately after connecting, contains heartbeat and server debug information.  
		Client Action: Receive */
	HELLO					= 10,
	
	/** Sent immediately following a client heartbeat that was received.  
		Client Action: Receive */
	HEARTBEAT_ACK			= 11
}

/** Discord Gateway Payload */
export interface GatewayPayload
{
	/** opcode for the payload */
	opcode: GatewayOpcode,
	/** event data */
	data: any,
	/** sequence number, used for resuming sessions and heartbeats */
	sequenceNumber?: number,
	/** the event name for this payload */
	eventName?: string
}
