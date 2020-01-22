// Copyright (c) 2020 Oliver Lenehan. All rights reserved. MIT license.

type BucketId = string & {}

type Integer = number & ProxyHandler<Number>;

let hi: Integer;
let ho = hi + 2;

// need to double check if rate limits are per path, or an intersection of path and method and major_parameter
// assumption is per path/endpoint
interface Bucket {
	limit:		number;
	remaining:	number;
	reset:		number;
	path:		string;
}

export class BucketPool extends Map<BucketId, Bucket>{}