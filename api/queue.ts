// Copyright (c) 2020 Oliver Lenehan. All rights reserved. MIT license.

import { deferred, Deferred } from "../deps.ts";

function sleep(ms: number) {
	return new Promise((r) => {
		setTimeout(r, ms);
	});
}

// optimisation with fixed length buffer, custom implementation required for performance
/** A simple queue with add and pop. */
class Queue<T> {
	/** How many items are currently in the queue. */
	length = 0;
	private queueBuffer: T[] = [];
	/** Add an item to the queue. */
	add(item: T): void {
		this.length++;
		this.queueBuffer.unshift(item); // currently just places at front of array.
	}
	/** Remove the next item at the front of the queue. */
	pop(): T | undefined {
		// if > 0, there is an item to pop
		if (this.queueBuffer.length > 0) {
			this.length--;
			return this.queueBuffer.pop(); // currently just removes from back of array.
		}
		// otherwise, nothing was removed.
		return undefined;
	}
}

/** An queue which can be used in `for-await-of` to listen for events.  
		Flow rate is how long to wait between event dispatches, used for flow control. */
export class AsyncEventQueue<T = any> {
	/** Whether the queue has been exited. */
	private isDone = false;
	/** Used to await for a new item. */
	private newItem = deferred();
	private queue = new Queue();
	constructor(
		private flowRate: number = 0,
		private handler?: (item: T) => void,
	) {}
	/** Post an event to the queue. */
	post(item: T) {
		this.queue.add(item);
		this.newItem.resolve();
	}
	/** Stop serving events. */
	exit() {
		this.isDone = true;
		this.newItem.resolve();
	}
	/** used for for-await-of */
	async *[Symbol.asyncIterator]() {
		while (1) {
			// if there are items in the queue, pop them one by one.
			if (this.queue.length > 0) {
				// yield the value
				yield this.queue.pop() as T;
				// wait for the desired time so as to act as 'flow control'
				if (this.flowRate !== 0) await sleep(this.flowRate);
			} // else: there are no items in the queue currently
			else {
				// await next item to arrive in queue, or exit() as it resolves this promise
				await this.newItem;
				// reset the promise to be unresolved
				this.newItem = deferred();
			}
			// if exit() was called this is true, and the generator exits.
			if (this.isDone) return;
		}
	}
	async run() {
		for await (const item of this) {
			if (this.handler !== undefined) this.handler(item);
		}
	}
}

// Service queue model: Customers, Services
// Future optimisation: Fixed length array, use numbers to mark priority. Need to benchmark speed of processing requests.
/** A queue where 'customers' wait until their requested services are not busy. Return value is that returned in the onServed callback. */
export class AsyncServiceQueue {
	/** What services are currently busy. */
	private busyServices: Set<any> = new Set();
	/** A queue of customers waiting. */
	private customers: [any[], () => Promise<unknown>, Deferred<unknown>][] = [];

	/** Clear services that are no longer being used. */
	private free(services: any[]) {
		// remove services as busy
		for (let s of services) this.busyServices.delete(s);
		// go through and find a customer that can use the available services
		for (let i = 0; i < this.customers.length; i++) {
			// check if the services are available [i][0] is the customer's requested services
			if (this.available(this.customers[i][0])) {
				// services were available, ensure they are marked as busy.
				for (let s of services) this.busyServices.add(s);
				// access onServed code to run ([i][1]), then free up after completion.
				this.customers[i][1]().then((v) => {
					// so [i][0] refer's to their requested services
					if (!this.customers[i]) return;
					this.free(this.customers[i][0]);
					// return the result
					this.customers[i][2].resolve(v);
					// splice here removes one customer
					this.customers.splice(i, 1);
				});
			}
		}
	}

	/** Returns whether the services are available. */
	available(services: any[]) {
		// iterate and check if any service is taken, if so then the services cannot be fulfilled.
		for (let s of services) if (this.busyServices.has(s)) return false;
		return true;
	}

	/** Serves the customer. */
	async serve<T>(services: any[], onServed: () => Promise<T>): Promise<T> {
		// if the requested services are not available, put the customer in the cue.
		if (!this.available(services)) {
			let uponServed = deferred<unknown>();
			this.customers.push([services, onServed, uponServed]);
			return uponServed as Deferred<T>;
		} // else: the customer can be served immediately as the services are available.
		else {
			// services were available, ensure they are marked as busy.
			for (let s of services) this.busyServices.add(s);
			// access onServed code to run
			const v = await onServed();
			// free up after completion.
			this.free(services);
			return v;
		}
	}
}
