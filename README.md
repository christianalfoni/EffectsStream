# EffectsStream (WIP)
An observable stream API with focus on side effects management

- [What](#what)
- [Why](#why)
- [How](#how)
- [API](#api)
- [Redux](#redux)
- [Mobx](#mobx)

## What
EffectsStream is an API that allows you to manage side effects using streams. Unlike traditional streams, the operators of EffectsStream will in addition to the current stream value also expose defined effects. This allows for efficient expression and management of application logic flows.

## Why
Tools like [RxJS]() are very powerful. The concept of an observable and operators allows for a lot of flexibility in flows. But its academic history and its focus on value transformation makes [RxJS]() a difficult tool to grasp, and it has limitations in traditional web application development. EffectsStream is a simple API based on the concept of observables, but makes some radical changes to allow expression of application logic to be simpler and more efficient.

*application logic* in this context refers to expressing state changes and side effects.

## How

```ts
import { Stream } from 'effects-stream'
import store from './store'

// We define all our effects 
const uiEffect = {
  html(selector, content) {
    document.querySelector(selector).innerHTML = content
  }
}

// We expose our effects on a context
const context = {
  ui: uiEffect
}

// To improve the declarativeness of our code
// we define all our logic as simple and testable functions
const minLength = (minLength) => (value) => value.length > minLength
const getInputValue = (event) => event.target.value
const updateTitle = (value, { ui }) => ui.html('#title', value)

// We can now compose together a stream which takes events from
// an input and updates a title on the page if the value is longer than
// 2 characters
const onInputChange = Stream(context)
  .filter(minLength(2))
  .map(getInputValue)
  .forEach(updateTitle)

// We bind the stream to the listener, so that it triggers the stream with the event
document.querySelector('#input').addEventListener('change', onInputChange.bind())
```

## API

- [Stream](#stream)
- [push](#push)
- [callback](#callback)
- [middleware](#middleware)
- [map](#map)
- [mapWhenIdle](#mapwhenidle)
- [filter](#filter)

### Stream(context?)

```js
import { Stream } from 'effects-stream'

const stream = Stream()
```

Provide a **context** for effects:

```js
import { Stream } from 'effects-stream'

const ui = {
  html(selector, content) {
    document.querySelector(selector).innerHTML = content
  }
}
const http = {
  get(url) {
    return fetch(url).then(response => response.toJSON())
  }
}

const context = {
  ui,
  http
}

const stream = Stream(context)
```

### push(value)

Pushes a new value on to the stream.

```js
import { Stream } from 'effects-stream'

const stream = Stream()

stream.push('foo')
```

### callback(boundValue?)

Create a callback that will push a value to the stream, optionally with a bound value. If no bound value
it will push the value when callback is called.

```js
import { Stream } from 'effects-stream'

const stream = Stream()

const callback = stream.callback('foo')

callback() // Pushes "foo" to the stream
```

### middleware()

Creates a callback that will push callback arguments as an array to the stream.

```js
import { Stream } from 'effects-stream'

const stream = Stream()

const middleware = stream.middleware()

middleware('foo', 'bar') // Pushes {0: "foo", 1: "bar"} to the stream
```

### map(value, context?) => newValue

`sync` `async`

Takes in the value from the stream and returns a new value.

```js
import { Stream } from 'effects-stream'

const stream = Stream(context)
  .map((value) => {
    return value.toUpperCase()
  })

stream.push('foo')
```

### mapWhenIdle(value, context?) => newValue?

`async`

Takes in the value from the stream and returns a new promised value, but only if the previous promise has been resolved.

```js
import { Stream } from 'effects-stream'

const stream = Stream(context)
  .mapWhenIdle((id, { http }) => {
    return http.get(`/users/${id}`)
  })

stream.push('123')
```

### filter(value, context?) => true/false

Takes in the value from the stream and returns a boolean to indicate the stream to continue or not.

```js
import { Stream } from 'effects-stream'

const stream = Stream(context)
  .filter((value) => {
    return value.length > 3
  })

stream.push('foo')
```