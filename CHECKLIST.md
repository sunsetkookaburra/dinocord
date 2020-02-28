# API Operations Checklist (FULL)
- [x] Rate Limiting
## HTTP REST
#### Client:
- [ ] Edit Profile
- [x] List Guilds
- [x] Get Client-User Info
- [x] Leave Guild
#### Channels:
- [ ] Send Typing
- [ ] Create
- [ ] Delete
- [ ] DM
- [ ] Edit
- [ ] History
- [ ] Info
- [ ] Permission
#### Invites:
- [ ] Create
- [ ] Delete
- [ ] Info
- [ ] Join
#### Messages:
- [ ] Send
- [ ] Send File
- [ ] Edit
- [ ] Delete
#### Roles:
- [ ] Create
- [ ] Delete
- [ ] Edit
- [ ] Info
#### Guilds:
- [ ] Ban
- [ ] Ban List
- [ ] Create
- [ ] Delete
- [ ] Edit
- [ ] Info
- [ ] Kick
- [ ] Unban
- [ ] Change Owner

## WebSocket
#### Client:
- [ ] Typing
#### Channel Events:
- [ ] Create
- [ ] Delete
- [ ] Update
#### Message Events:
- [ ] Delete
- [ ] Receive
- [ ] Update
#### Role Events:
- [ ] Create
- [ ] Delete
- [ ] Update
#### Presence:
- [ ] Receive
- [ ] Send
#### Server Events:
- [ ] Ban
- [ ] Create
- [ ] Delete
- [ ] Unban
- [ ] Update
#### User Events:
- [ ] Join
- [ ] Leave
#### Voice:
- [ ] Receive
- [ ] Send
- [ ] Multi-server
- [ ] State Update

## Data Objects / Types / Values
- [ ] Audit Log
- [ ] Audit Log Entry
- [ ] Audit Log Events
- [ ] Audit Log Optional Entry Info
- [ ] Audit Log Change
- [ ] Audit Log Change Key
---
- [ ] Channel
- [x] Channel Types
- [ ] Message
- [ ] Message Types
- [ ] Message Activity
- [ ] Message Application
- [ ] Message Reference
- [ ] Message Activity Types
- [ ] Message Flags
- [ ] Reaction
- [ ] Overwrite
- [ ] Embed
- [ ] Embed Thumbnail
- [ ] Embed Video
- [ ] Embed Image
- [ ] Embed Provider
- [ ] Embed Author
- [ ] Embed Footer
- [ ] Embed Field
- [ ] Attachment
- [ ] Channel Mention
- [ ] Embed Limits
---
- [ ] Emoji
---
- [ ] Guild
- [ ] Default Message Notification Level
- [ ] Explicit Content Filter Level
- [ ] MFA Level
- [ ] Verification Level
- [ ] Premium Tier
- [ ] Guild Features
- [ ] Unavailable Guild
- [ ] Guild Embed
- [ ] Guild Member
- [ ] Integration
- [ ] Integration Account
- [ ] Ban
---
- [ ] Invite
- [ ] Target User Type
- [ ] Invite Metadata
---
- [ ] User
- [x] User Flags
- [x] Premium Types
- [ ] Connection
- [ ] Visibility Types
---
- [ ] Voice State
- [ ] Voice Region
---
- [ ] Webhook
- [ ] Webhook Types

## Gateway Data Structures
- [ ] Gateway Payload
- [ ] Gateway URL Params
- [ ] Gateway Commands
- [ ] Gateway Events
- [ ] Identify
- [ ] Identify Connection Properties
- [ ] Resume
- [ ] Guild Request Members
- [ ] Voice State Update
- [ ] Status Update
- [ ] Status Types
- [ ] Hello Event
- [ ] Ready Event
- [ ] Channel Pins Update Event
- [ ] Guild Ban Add Event
- [ ] Guild Ban Remove Event
- [ ] Guild Emojis Update
- [ ] Guild Integrations Update
- [ ] Guild Member Add Extra
- [ ] Guild Member Remove Event
- [ ] Guild Member Update Event
- [ ] Guild Members Chunk
- [ ] Guild Role Create Event
- [ ] Guild Role Update Event
- [ ] Guild Role Delete Event
- [ ] Message Create Event
- [ ] Message Update Event
- [ ] Message Delete Event
- [ ] Message Delete Bulk Event
- [ ] Message Reaction Add Event
- [ ] Message Reaction Remove Event
- [ ] Message Reaction Remove All Event
- [ ] Presense Update Event
- [ ] Client Status
- [ ] Activity
- [ ] Activity Types
- [ ] Activity Timestamps
- [ ] Activity Emoji
- [ ] Activity Party
- [ ] Activity Assets
- [ ] Activity Secrets
- [ ] Activity Flags
- [ ] Typing Start Event
- [ ] Voice Server Update Event
- [ ] Webhooks Update Event
- [ ] JSON Error Response

## Opcodes / Status Codes
- [x] Gateway Opcodes
- [ ] Gateway Close Event Codes
- [ ] Voice Opcodes
- [ ] Voice Close Event Codes
- [ ] HTTP Response Codes
- [ ] JSON Error Codes
- [ ] Discord RPC Error Codes (Currently in Private Beta)
- [ ] Discord RPC Close Event Codes (Currently in Private Beta)

## More
- [ ] Bitwise Permission Flags
- [ ] Role Object
- [ ] Rate Limit Response Object
- [ ] Team Object
- [ ] Team Members Object
- [ ] Membership State Enum
- [ ] Voice Gateway (Need to wait for Deno UDP)
