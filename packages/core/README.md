# @ussuri/core

```ts
import { Application } from '@ussuri/core';

const application = const Application( {
    controllers : [],
    providers : []
} );
```

```ts
import { Module } from '@ussuri/core';

@Module( {
    controllers : [],
    providers : []
} )
class MainModule {}

const application = Application.create( MainModule );
```

```ts
import { Application, ApplicationOptions } from '@ussuri/core';

@Module( {
    controllers : [],
    providers : []
} )
class SampleApplication extends Application {
    constructor( options: ApplicationOptions ) {
        super( options );
    }
}
```

```ts
import { Application, ApplicationOptions, Module } from '@ussuri/core';

@Module( {
    controllers : [],
    providers : []
} )
class MainModule {}


@Module( MainModule )
class SampleApplication extends Application {
}
```
