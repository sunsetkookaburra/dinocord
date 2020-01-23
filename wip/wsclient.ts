/*
+ Sending payloads.
+ Receiving payloads.

identified a need to listen for different events depending on bot needs.

actually getting data
+ maintain 500ms+ gap between sent events (timed queue)

1. connecting
+ getting a gateway url (getGateway for non-sharded, getGatewayBot for sharded)
+ append gateway url params
+ receive HELLO and store heartbeat
+ sharded bots must wait five+ seconds between starting another gateway

2. heartbeating
+ send HEARTBEAT every heartbeat interval millis until closed or terminated.
+ if not ack'd before sending next, terminate with non-1000 error code, re-connect and attempt to resume (log error too).

3. identifying
+ send IDENTIFY with payload (this can pass in an initial discord presence)
+ receive READY EVENT, store session_id and latest sequence number

4. resuming
+ buffer new events while starting resume
+ wait for READY then send RESUME
+ wait for RESUMED event
+ playback buffered events
+ open listing for new

5. invalidated sessions
+ could not initialise IDENTIFY
+ could not resume
+ dropped active session
+ ACTIONS: see 'd' key, if true, it can be resumed
+ should wait around 5-6 seconds then retry

6. disconnections
+ action via event code and handle properly

data object:
FlowControlQueue
EventQueue
ObjectCache

----------------------
a next version: sharding
+ a process per socket
? should all events be merged ?
+ a different api for merged events?


*/