// Copyright (c) 2020 Oliver Lenehan. All rights reserved. MIT license.

function sleep( ms: number ){
	return new Promise(r=>{setTimeout(r,ms)});
}

// optimisation with fixed length buffer, custom implementation required for performance
class Queue<T>
{
	public length = 0;
	private queueBuffer: T[] = [];

	add( item: T ): void {
		this.length++;
		this.queueBuffer.unshift(item);
	}

	pop(): T {
		if( this.queueBuffer.length > 0){
			this.length--;
			return this.queueBuffer.pop();
		}
		return undefined;
	}
}

/** An queue which can be used in `for-await-of` to listen for events.  
    Flow rate is how long to wait between event dispatches, used for flow control. */
class EventQueue<T> extends Queue<T>
{
	/** Whether the queue has been exited. */
	private isDone = false;
	/** Used to await for a new item. */
	private newItem = new Promise(r=>0)
	constructor( private flowRate: number = 0 ){
		super();
	}
	/** Post an event to the queue. */
	post( item: T ){
		this.add(item);
		this.newItem = Promise.resolve();
	}
	exit(){
		this.isDone = true;
		this.newItem = Promise.resolve();
	}
	async*[Symbol.asyncIterator](){
		while(1){
			if( this.length > 0 ){
				yield this.pop()
				if( this.flowRate !== 0 ) await sleep(this.flowRate);
			}
			else {
				// await next item to arrive in queue
				await this.newItem;
				this.newItem = new Promise(r=>{});
			}
			if( this.isDone ) return;
		}
	}
}

const a = new EventQueue();
console.log("a");
for (let i=0; i<3; i++){
	a.add('@'+String(i))
}
(async function(){
	for await(const e of a){
		console.log(e);
	}
}());
console.log("b")

