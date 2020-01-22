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
		if( this.isBusy(customerServices) ) this._customers.push({customerServices, onServed});
		else {
			for( let s of customerServices ) this._busyServices.add(s);
			onServed().then(()=>{
				this._free(customerServices);
			});
		}
	}

	/** Free up services. */
	private _free( customerServices: any[] ){
		for( let s of customerServices ) this._busyServices.delete(s);
		// serve customers not requiring currently busy services
		for( let i = 0; i < this._customers.length; i++ ){
			if( !this.isBusy(this._customers[i].customerServices) ){
				for( let s of customerServices ) this._busyServices.add(s);
				this._customers[i].onServed().then(()=>{
					this._free(this._customers.splice(i,1)[0].customerServices);
				});
			}
		}
	}
}
