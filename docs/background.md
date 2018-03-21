# Background

An observable is a powerful construct in programming that can solve many problems. Its academic history and low level approach makes it difficult to see how you can use it for managing application flows. I am specifically talking about the logic you put into your [redux thunks](), your [mobx actions](), your  [vue methods]() and even your [React methods](). All these starting points for application logic flow is defined as a function and it is up to you how to move on from there. But we can actually replace these functions with a more expressive and powerful API for managing application logic.

## An observable

Think of an observable as a different construct than the plain function you normally use. You can call an observable and give it a value, just like a function, but other than that they work very differently. Let us look at an observable in **EffectsStream** from the perspective of [React](). On this code example we have created a simple component that updates the value of an input.

```js
import React from 'react'

class SearchComponent extends React.Component {
  state= {
    searchValue: ''
  }
  onInputChange = (event) => {
    this.setState({
      searchValue: event.target.value
    })
  }
  render () {
    return <input value={this.state.searchValue} onChange={this.onInputChange} />
  }
}
```

Now let us see how this would be expressed with **EffectsStream**. Now, take note that this example is not to show you what benefits you get. It is to show you how a stream is expressed as opposed to a function.


```js
import as React from 'react'
import { factories } from 'effects-stream/react'

const { Stream, setState } = factories()

const setSearchValue = setState(event => ({
  searchValue: event.target.value
}))

class SearchComponent extends React.Component {
  state = {
    searchValue: ''
  }
  onInputChange = Stream().forEach(setSearchValue).bind()
  render () {
    return <input value={this.state.searchValue} onChange={event => this.onInputChange(event)} />
  }
}
```

Take note here that we are encouraged to move into the functional world. Where each step of the logic is expressed as a simple isolated function that can be composed into any other stream where it makes sense. But this is just one of the benefits. The other benefit is the extra power you get to handle complex scenarios:

```js
import React from 'react'
import { factories } from 'effects-stream/react'

const getEventTargetValue = event => event.target.value
const minLength = length => value => value.length >= length
const getSearchResult = (value, { http }) => http.get(`/search?value=${value}`)
const getResponseData = response => response.data

const { Stream, setState } = factories()

const setSearchValue = setState(event => ({
  searchValue: event.target.value
}))

class SearchComponent extends React.Component {
  state = {
    searchValue: '',
    result: [],
    error: null
  }
  onInputChange = Stream()
    .map(getEventTargetValue)
    .forEach(setState(searchValue => ({ searchValue })))
    .filter(minLength(3))
    .debounce(300)
    .mapLatest(getSearchResult)
    .either(
      stream => stream
        .map(getResponseData)
        .forEach(setState(result => ({ result }))),
      stream => stream
        .forEach(setState(error => ({ error })))
    )
    .bind()
  render () {
    return <input value={this.state.searchValue} onChange={event => this.onInputChange(event)} />
  }
}
```

Again you see how we encourage moving every single piece of logic into its own little function and allowing the stream to manage the flow. Here is the stream with comments:

```js
export const updateInput = Stream()
  // We grab the value of the event target and
  // return it to the stream
  .map(getEventTargetValue)
  // We run an effect, changing the state of the component
  .forEach(setState(searchValue => ({ searchValue })))
  // If the value length is less than 3 it will stop here
  .filter(minLength(3))
  // It will move on after 300 milliseconds,
  // unless a new value is received within that
  // same time, postponing it a new 300 milliseconds
  .debounce(300)
  // Runs a request returning a promise. If a new request
  // is made during existing request, the existing promise
  // will be ignored, only passing through the latest promise
  // result
  .mapLatest(getSearchResult)
  // A promise might fail, which "either" manages. It will
  // continue the stream one way on resolve and a different
  // way on reject
  .either(
    stream => stream
      .map(getResponseData)
      .forEach(setState(result => ({ result }))),
    stream => stream
      .forEach(setState(error => ({ error })))
  )
```

## Benefits

### 1. Encourages declarative code

An observable API hands you  the ability to write declarative code on a silver plate. What this means is that each operator just references a function, rather than implementing the logic directly.

```js
Stream()
  .map(getEventTargetValue)

Stream()
  .map(event => event.target.value)
```

The second version here is arguably just as declarative as the first, but that is not the point. The point is that the operators naturally splits up your pieces of logic, encouraging you to reference by function. That gives every single line of code meaning with minimal effort.

### 2. Allows for very complex logic

The example above is actually pretty complex. Filtering, debouncing and forcing only the last request to be handled by the dispatcher. Tricky stuff. But we stay true to each line representing an operator and a function managing the logic. Giving us exactly what we need to know at this abstraction level.

### 3. Debugging

**EffectsStream** actually tracks all the executions. Every operator, the current value in the stream and side effect run is displayed in the debugger. This gives you a lot of insight into your running logic.
