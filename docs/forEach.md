{% method %}
## forEach {#push}

[sync](docs/sync.md) | [async](docs/async.md) | [context](docs/context.md) | [boundContext](docs/boundContext.md)

Allows you to manage new values coming on to the stream. The incoming value is passed to the next operator automatically. Typically used for effects.

{% sample lang="ts" %}
```ts
import { Stream } from 'effects-stream'

const log = value => console.log(value)

const stream = Stream<string>()
  .forEach(log)
```

{% sample lang="js" %}
```js
import { Stream } from 'effects-stream'

const log = value => console.log(value)

const stream = Stream()
  .forEach(log)
```

{% endmethod %}

{% method %}
### example {#example}

Log out incoming values.

{% sample lang="ts" %}
```ts
import { Stream } from 'effects-stream'

const log = value => console.log(value)

const stream = Stream<string>()
  .forEach(log)
```

{% sample lang="js" %}
```js
import { Stream } from 'effects-stream'

const log = value => console.log(value)

const stream = Stream()
  .forEach(log)
```

{% endmethod %}

{% method %}
### example 2 {#example2}

Wait for some external process to finish.

{% sample lang="ts" %}
```ts
import { Stream, Effect } from 'effects-stream'

type External = {
  runAsync: () => Promise<any>
}

const external: Effect<External> = Effect({
  runAsync: () => new Promise(...)
})

type Context = { external: External }

const context: Context = { external }

const waitForExternal = (_, { external }) => external.runAsync()

const stream = Stream<string, Context>()
  .forEach(waitForExternal)
```

{% sample lang="js" %}
```js
import { Stream } from 'effects-stream'

const context = {
  external: {
    runAsync: () => new Promise(...)
  }
}

const waitForExternal = async (_, { external }) => external.runAsync()

const stream = Stream(context)
  .forEach(waitForExternal)
```

{% endmethod %}