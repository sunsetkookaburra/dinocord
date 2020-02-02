// Copyright (c) 2020 Oliver Lenehan. All rights reserved. MIT license.

// write a wiki page about it.
/** Special queue which jumps people ahead who can get what they want immediately. */
export class ServiceQueue
{
	private _busyServices: Set<any> = new Set();
	private _customers: {customerServices: any[], onServed: ()=>Promise<void>}[] = [];

	isBusy( customerServices: any[] ){
		for (let s of customerServices) if (this._busyServices.has(s)) return true;
		return false;
	}

	/** Serve customer on arrival, or add to queue. */
	serve( customerServices: any[], onServed: ()=>Promise<void> ){
        // Add to waiting queue if required services are busy.
		if( this.isBusy(customerServices) ) this._customers.push({customerServices, onServed});
        // otherwise, serve them straight await.
        else {
            // lock the services
			for( let s of customerServices ) this._busyServices.add(s);
            // serve the customer
			onServed().then(()=>{
                // free the services
				this._free(customerServices);
			});
		}
	}

	/** Free up services. */
	private _free( customerServices: any[] ){
		for( let s of customerServices ) this._busyServices.delete(s);
		// serve customers not requiring currently busy services
		for( let i = 0; i < this._customers.length; i++ ){
            // if the required services are not busy
			if( !this.isBusy(this._customers[i].customerServices) ){
                // lock the services
                for( let s of customerServices ) this._busyServices.add(s);
                // serve the customer
				this._customers[i].onServed().then(()=>{
                    // free the services
					this._free(this._customers.splice(i,1)[0].customerServices);
				});
			}
		}
	}
}
