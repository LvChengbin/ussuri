# ussuri/@injection

A out of the box lightweight IoC framework for JavaScript.

## Concepts

## Usage

```ts
import { Injection, Injectable, Inject } from '@ussuri/injection';

class A {
    fn() {}
}

@Injectable()
class B {
    constructor( private a: A, @Inject( 'a' ) private aa: A ) {}

    active() {
        this.a.fn();
        this.aa.fn();
    }
}

class C {
    @Inject( B ) b: B;

    foo() {
        this.b.active();
    }
}

const injection = new Injection( {
    providers : [ A, B ]
} );

injection.set( C );

const c = injection.instantiate( C );
c.foo();
```
