// Copyright (c) 2020 Oliver Lenehan. All rights reserved. MIT license.

type BucketID = string & {}

type Integer = number & ProxyHandler<Number>;

let hi: Integer;
let ho = hi + 2;


interface Bucket {
	limit:		number;
	remaining:	number;
	reset:		number;
}

export class BucketPool extends Map<BucketID, Bucket>{}