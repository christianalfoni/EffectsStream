{% method %}
## map {#map}

[sync](docs/sync.md) | [async](docs/async.md) | [context](docs/context.md) | [boundContext](docs/boundContext.md)

Allows you to map the incoming value to a new value. 

{% sample lang="ts" %}
```ts
import { Stream } from 'effects-stream'

const stream = Stream<string>()
  .subscribe(
    (value) => console.log(value),
    (error) => console.log(error)
  )
```

{% sample lang="js" %}
```js
import { Stream } from 'effects-stream'

const stream = Stream()
  .subscribe(
    (value) => console.log(value),
    (error) => console.log(error)
  )
```

{% endmethod %}

{% method %}
### example {#example}

Log out incoming values.

{% sample lang="ts" %}
```ts
import { Stream } from 'effects-stream'

const stream = Stream<string>()
  .forEach(value => console.log(value))
```

{% sample lang="js" %}
```js
import { Stream } from 'effects-stream'

const stream = Stream()
  .forEach(value => console.log(value))
```

{% endmethod %}