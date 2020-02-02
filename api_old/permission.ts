// Copyright (c) 2020 Oliver Lenehan. All rights reserved. MIT license.

import { Snowflake } from './snowflake.ts';

/** Permissions and their bit-masks. */
const PermissionFlags = {
	'VIEW_AUDIT_LOG': 0x00000080,
	'CHANGE_NICKNAME': 0x04000000,
	'MANAGE_NICKNAMES': 0x08000000,
}

const TwoFactorPermissionFlags = {
	'KICK_MEMBERS': 0x000000002,
	'BAN_MEMBERS': 0x00000004,
	'ADMINISTRATOR': 0x00000008,
	'MANAGE_GUILD': 0x00000020,
	'MANAGE_EMOJIS':0x40000000,
}

const VoiceAndTextPermissionFlags = {
	'CREATE_INSTANT_INVITE': 0x00000001,
	'MANAGE_CHANNELS': 0x00000010,
	'VIEW_CHANNEL': 0x00000400,
}

const TwoFactorVoiceAndTextPermissionFlags = {
	'MANAGE_ROLES': 0x10000000,
	'MANAGE_WEBHOOKS': 0x20000000,
}

const VoicePermissionFlags = {
	'CONNECT': 0x00100000,
	'SPEAK': 0x00200000,
	'MUTE_MEMBERS': 0x00400000,
	'DEAFEN_MEMBERS': 0x00800000,
	'MOVE_MEMBERS': 0x01000000,
	'USE_VAD': 0x02000000,
	'PRIORITY_SPEAKER': 0x00000100,
	'STREAM': 0x00000200,
}

const TextPermissionFlags = {
	'ADD_REACTIONS': 0x00000040,
	'SEND_MESSAGES': 0x00000800,
	'SEND_TTS_MESSAGES': 0x00001000,
	'EMBED_LINKS': 0x00004000,
	'ATTACH_FILES': 0x00008000,
	'READ_MESSAGE_HISTORY': 0x00010000,
	'MENTION_EVERYONE': 0x00020000,
	'USE_EXTERNAL_EMOJIS': 0x00040000,
}

const TwoFactorTextPermissionFlags = {
	'MANAGE_MESSAGES': 0x00002000,
}

type TwoFactorPermissions =
	keyof typeof TwoFactorPermissionFlags |
	keyof typeof TwoFactorVoiceAndTextPermissionFlags |
	keyof typeof TwoFactorTextPermissionFlags;

type AllPermissions = 
	keyof typeof PermissionFlags |
	keyof typeof VoiceAndTextPermissionFlags |
	keyof typeof VoicePermissionFlags |
	keyof typeof TextPermissionFlags |
	TwoFactorPermissions;


//@public_api
/** Role data object. */
export interface RoleObject {
	/** ID of the role. */
	id:Snowflake;
	/** Name of the role. */
	name:string;
	/** Color of the role (NEEDS WORK TO CONVERT TO HEX STRING OR COLOUR OBJECT) */
	color:number;
	/** Whether the role is pinned to its own group. */
	hoist:boolean;
	/** How far from the top permissions is this role. */
	position:number;
	/** What permissions are allowed. */
	permissions:number;
	/** Whether the role is managed by an integration, (game integration for teams, etc). */
	managed:boolean;
	/** Whether this role can be mentioned, e.g. `@role`. */
	mentionable:boolean;
}

//@public_api
/** A Discord Role. */
export class Role implements RoleObject {
	/** ID of the role. */
	id:Snowflake;
	/** Name of the role. */
	name:string;
	/** Color of the role (NEEDS WORK TO CONVERT TO HEX STRING OR COLOUR OBJECT) */
	color:number;
	/** Whether the role is pinned to its own group. */
	hoist:boolean;
	/** How far from the top permissions is this role. */
	position:number;
	/** What permissions are allowed. */
	permissions:number;
	/** Whether the role is managed by an integration, (game integration for teams, etc). */
	managed:boolean;
	/** Whether this role can be mentioned, e.g. `@role`. */
	mentionable:boolean;

	constructor( roleInit: RoleObject ){
		this.id = roleInit.id
		this.name = roleInit.name;
		this.color = roleInit.color;
		this.hoist = roleInit.hoist;
		this.position = roleInit.position;
		this.permissions = roleInit.permissions;
		this.managed = roleInit.managed;
		this.mentionable = roleInit.mentionable;
	}

	can( permission: AllPermissions ){
		let permissionToCheck: number;
		for( let permGroup of [
			PermissionFlags,
			VoiceAndTextPermissionFlags,
			VoicePermissionFlags,
			TextPermissionFlags,
			TwoFactorPermissionFlags,
			TwoFactorVoiceAndTextPermissionFlags,
			TwoFactorTextPermissionFlags
		]){
			for( let perm of Object.keys(permGroup) ){
				if( permGroup[permission] !== undefined ){
					permissionToCheck = permGroup[permission];
					break;
				}
			}
		}
		if( permissionToCheck !== undefined ){
			return Boolean(this.permissions & permissionToCheck);
		}
		throw 'PERMISSION NAME NOT FOUND';
	}
}
