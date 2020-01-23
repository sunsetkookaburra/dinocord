// Copyright (c) 2020 Oliver Lenehan. All rights reserved. MIT license.

/*

Service Queue Model:
 - Customers
 - Services

*/

// Future optimisation: Fixed length array. Need to benchmark speed of processing requests.
// UPGRADE:: extends queue
/** A queue where 'customers' wait until their requested services are not busy. */
class ServiceQueue
{
	/** What services are currently busy. */
	private busyServices: Set<any> = new Set();
	/** A queue of customers waiting. */
	private customers: [any[],()=>Promise<void>][] = [];

	/** Clear services that are no longer being used. */
	private free( services: any[] ){
		// remove services as busy
		for( let s of services ) this.busyServices.delete(s);
		// go through and find a customer that can use the available services
		for( let i = 0; i < this.customers.length; i++ ){
			// check if the services are available [i][0] is the customer's requested services
			if( this.available(this.customers[i][0]) ){
				// services were available, ensure they are marked as busy.
				for( let s of services ) this.busyServices.add(s);
				// access onServed code to run ([i][1]), then free up after completion.
				this.customers[i][1]().then(()=>{
					// splice here returns one customer, so [0][0] refer's to their requested services
					this.free(this.customers.splice(i,1)[0][0]);
				});
			}
		}
	}

	/** Returns whether the services are available. */
	available( services: any[] ){
		// iterate and check if any service is taken, if so then the services cannot be fulfilled.
		for( let s of services ) if (this.busyServices.has(s)) return false;
		return true;
	}

	/** Serves the customer. */
	serve( services: any[], onServed: ()=>Promise<void> ){
		// if the requested services are not available, put the customer in the cue.
		if( !this.available(services) ) this.customers.push([services, onServed]);
		// else: the customer can be served immediately as the services are available.
		else {
			// services were available, ensure they are marked as busy.
			for( let s of services ) this.busyServices.add(s);
			// access onServed code to run
			onServed().then(()=>{
				// free up after completion.
				this.free(services);
			});
		}
	}
}
