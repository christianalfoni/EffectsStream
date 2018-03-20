# EffectsStream

{% method %}
## Install {#install}

The first thing is to get the GitBook API client.

{% sample lang="ts" %}
```bash
$ npm install effects-stream
```

{% sample lang="js" %}
```bash
$ npm install effects-stream
```

{% endmethod %}

## API

- [Stream](#stream)
- [push](#push)
- [callback](#callback)
- [middleware](#middleware)
- [map](#map)
- [mapWhenIdle](#mapwhenidle)
- [forEach](#foreach)
- [filter](#filter)
- [either](#either)



### push

**(value?) => Producer**

Pushes a new value on to the stream.

**JS**

```js
import { Stream } from 'effects-stream'

const stream = Stream()

stream.push('foo')
```

**TypeScript**

```js
import { Stream } from 'effects-stream'

const stream = Stream<string>()

stream.push('foo')
```

### callback

**(boundValue?) => (callbackArg?) => void**

Create a callback that will push a value to the stream, optionally with a bound value. If no bound value
it will push the value when callback is called.

**JS**

```js
import { Stream } from 'effects-stream'

const stream = Stream()

const callback = stream.callback('foo')

callback() // Pushes "foo" to the stream
```

**TypeScript**

```ts
import { Stream } from 'effects-stream'

const stream = Stream<string>()

const callback = stream.callback('foo')

callback() // Pushes "foo" to the stream
```

### middleware

**() => (...args) => void**

Creates a callback that will push callback arguments as an object to the stream.

**JS**

```js
import { Stream } from 'effects-stream'

const stream = Stream()

const middleware = stream.middleware()

middleware('foo', 'bar') // Pushes {0: "foo", 1: "bar"} to the stream
```

**TypeScript**

```ts
import { Stream } from 'effects-stream'

const stream = Stream<{ 0: string, 1: string}>()

const middleware = stream.middleware()

middleware('foo', 'bar') // Pushes {0: "foo", 1: "bar"} to the stream
```

### map

**(value, context?) => newValue**

`sync` `async`

Takes in the value from the stream and returns a new value.

**JS**

```js
import { Stream } from 'effects-stream'

const stream = Stream()
  .map((value) => {
    return value.toUpperCase()
  })

stream.push('foo')
```

**TypeScript**

```js
import { Stream } from 'effects-stream'

const stream = Stream<string>()
  .map<string>((value) => {
    return value.toUpperCase()
  })

stream.push('foo')
```

### mapWhenIdle

**(value, context?) => newValue?**

`cancelable` `async`

Takes in the value from the stream and returns a new promised value, but only if the previous promise has been resolved.

**JS**

```js
import { Stream } from 'effects-stream'

const stream = Stream(context)
  .mapWhenIdle((id, { http }) => {
    return http.get(`/users/${id}`)
  })

stream.push('123')
```

**TypeScript**

```js
import { Stream } from 'effects-stream'
import context from './context'

type User = {
  name: string
}

const stream = Stream<string, Context>(context)
  .mapWhenIdle<User>((id, { http }) => {
    return http.get(`/users/${id}`)
  })

stream.push('123')
```

### forEach

**(value, context?) => void**

`sync` `async`

Takes in the value from the stream, but returns nothing. Typically used to run effects without a returned value.

**JS**

```js
import { Stream } from 'effects-stream'
import context from './context'

const stream = Stream(context)
  .forEach((date, { ui }) => {
    ui.html('#date', date)
  })

stream.push(new Date().toString())
```

**TypeScript**

```ts
import { Stream } from 'effects-stream'
import context, { Context } from './context'

const stream = Stream<string, Context>(context)
  .forEach(date, { ui }) => {
    ui.html('#date', date)
  })

stream.push(new Date().toString())
```

### filter

**(value, context?) => boolean**

`cancelable` `sync` `async`

Takes in the value from the stream and returns a boolean to indicate the stream to continue or not.

**JS**

```js
import { Stream } from 'effects-stream'

const stream = Stream(context)
  .filter((value) => {
    return value.length > 3
  })

stream.push('foo')
```

**TypeScript**

```ts
import { Stream } from 'effects-stream'

const stream = Stream<string>()
  .filter((value) => {
    return value.length > 3
  })

stream.push('foo')
```