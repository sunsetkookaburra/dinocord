// Copyright (c) 2020 Oliver Lenehan. All rights reserved. MIT license.

type BucketID = string & {}

interface Bucket {
	limit:		number;
	remaining:	number;
	reset:		number;
}

export class BucketPool extends Map<BucketID, Bucket>{}