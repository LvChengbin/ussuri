# @ussuri/method-interceptor

Generate interceptors for *class methods* with `decorators`.

```ts
import { createDecoratorBefore, createInterceptorBefore } from '@ussuri/method-interceptor';

function fn1() {}
function fn2() {}

const BeforeDecorator1 = createDecoratorBefore( fn1 );
const BeforeDecorator2 = createDecoratorBefore( fn2 );

class Example {
    @BeforeDecorator1
    @BeforeDecorator2
    @AfterDecorator1
    @ExceptionDecorator
    foo( arg1: @ArgDecorator1, arg2: @ArgDecorator2 ) {

    }
}

create
```

## Concepts

We try abstracting a common type of process while calling a method in a class as follow:


```ts
try {

    Before calling interceptors

    Call target with parameter interceptors

    After alling interceptors

} catch( e ) {

    Exception interceptors

} finally {

    Finally interceptors

}
```
