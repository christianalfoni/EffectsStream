{% method %}
## Stream {#stream}

Creates the initial observable where you define your stream. 

{% sample lang="ts" %}
```ts
import { Stream } from 'effects-stream'

const stream = Stream<string>()
```

{% sample lang="js" %}
```js
import { Stream } from 'effects-stream'

const stream = Stream()
```

{% endmethod %}

{% method %}
## Context {#context}

```ts
type ObservableFactory = <Input, Context>(context) => Observable<Input, Context>
```

You can pass in a context to the stream which will be available in all the operators.

{% sample lang="ts" %}
```ts
import { Stream } from 'effects-stream'
import uuid from 'uuid'

type Context = {
  uuid: typeof uuid
}

const context: Context = {
  uuid
}

const stream = Stream<string, Context>(context)
```

{% sample lang="js" %}
```js
import { Stream } from 'effects-stream'
import uuid from 'uuid'

const stream = Stream({
  uuid
})
```

{% endmethod %}

{% method %}
### Custom stream {#custom-stream}

You will typically create a separate file with a wrapped **Stream** that holds the context you want to use with all the streams of your application.

{% sample lang="ts" %}
```ts
import { Stream as EffectsStream } from 'effects-stream'
import uuid from 'uuid'

type Context = {
  uuid: typeof uuid
}

const context: Context = {
  uuid
}

export const Stream = <Input>() => EffectsStream<Input, Context>(context)
```

{% sample lang="js" %}
```js
import { Stream as EffectsStream } from 'effects-stream'
import uuid from 'uuid'

export const Stream = () => EffectsStream({
  uuid
})
```

{% endmethod %}