{% method %}
## push {#push}

Allows you to push a new value on to the stream.

{% sample lang="ts" %}
```ts
import { Stream } from 'effects-stream'

const stream = Stream<string>()

stream.push('foo')
```

{% sample lang="js" %}
```js
import { Stream } from 'effects-stream'

const stream = Stream()

stream.push('foo')
```

{% endmethod %}

{% method %}
### example {#example}

Push a value and log it out.

{% sample lang="ts" %}
```ts
import { Stream } from 'effects-stream'

const stream = Stream<string>()
  .forEach(value => console.log(value)) // "foo"

stream.push('foo')
```

{% sample lang="js" %}
```js
import { Stream } from 'effects-stream'

const stream = Stream()
  .forEach(value => console.log(value)) // "foo"

stream.push('foo')
```

{% endmethod %}