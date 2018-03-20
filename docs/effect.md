{% method %}
## Effect {#effect}

Create an effect which is tracked by **EffectsStream**. Think of effects as a custom API for your application. You expose external functionalty through methods that will be tracked by the debugger.

{% sample lang="ts" %}
```ts
import { Stream, Effect } from 'effects-stream'
import uuid from 'uuid'

type Id = {
  create: () => string
}

const id: Effect<Id> = Effect({
  create: uuid.v4
})

type Context = {
  id: Effect<Id>
}

const context: Context = {
  id
}

const stream = Stream<string>(context)
```

{% sample lang="js" %}
```js
import { Stream, Effect } from 'effects-stream'
import uuid from 'uuid'

const id = Effect({
  create: uuid.v4
})

const context = {
  id
}

const stream = Stream(context)
```

{% endmethod %}

{% method %}
### Fetch example {#effect-fetch-example}

**Fetch** is a typical example of a generic API you want to bridge to a context specific API. You probably want to use *json* data by default and maybe there are some headers that should be passed with every request. This is something you can define on your **Effect** and make it available to any operator.


{% sample lang="ts" %}
```ts
import { Stream, Effect } from 'effects-stream'

type Http = {
  get: <Response>(url: string) => Promise<Response>,
  post: <Response>(url: string, data: {}) => Promise<Response>
}

const http: Effect<Http> = Effect({
  get(url) {
    return fetch(url).then(response => response.json())
  },
  post(url, data) {
    return fetch({
      url,
      method: 'POST',
      body: JSON.stringify(data)
    }).then(response => response.json())
  }
})

type Context = { http: Effect<Http> }

const context: Context = { http }

const stream = Stream<string>(context)
```

{% sample lang="js" %}
```js
import { Stream, Effect } from 'effects-stream'

const http = Effect({
  get(url) {
    return fetch(url).then(response => response.json())
  },
  post(url, data) {
    return fetch({
      url,
      method: 'POST',
      body: JSON.stringify(data)
    }).then(response => response.json())
  }
})

const context = { http }

const stream = Stream(context)
```

{% endmethod %}