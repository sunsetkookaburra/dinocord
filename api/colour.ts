// Copyright (c) 2020 Oliver Lenehan. All rights reserved. MIT license.

// Should work similarly to css OR
// An interface 'colour' with red,green,blue.
// consider a colour object, and then use getters/setters for hex/rgb etc.

export interface Colour {
    r: number;
    g: number;
    b: number;
}

export function toColour( v: number ): Colour {
    return {
        r: (v & 0xff0000) >>> 16,
        g: (v & 0x00ff00) >>> 8,
        b: (v & 0x0000ff)
    }
}