# EffectsStream
An observable stream API with focus on state and side effects management

## Introduction
Streams is a powerful concept for flow control, but they are often related to managing transformation of values. Conceptually this can be challenging to put in the context of for example a simple button click. Let us imagine we would want to do something like this:

```js
import http from 'some-http-library'

document.body.querySelector('#button').addEventListener('click', async () => {
  const userRequest = await http.get('/user')
  const user = userRequest.response
  document.body.querySelector('#user').innerHTML = user.name
})
```

Basically when a button is clicked we want to grab a user and insert the name on the page. This code does not reflect the concept of transforming values. But what if we wrote our code like this:

```js
import { Stream } from 'effects-stream'

const stream = Stream.create()
  .map(getUser)
  .forEach(renderUserName)

document.body.querySelector('#button').addEventListener('click', stream.bind())
```

Conceptually we are now thinking about the button clicks as a stream a stream of clicks, where we express how to manage each click. The first **map** indicates that we want to map each click into a new value, which is the user requested from the server. The **forEach** indicates that for each user returned we want to render the username.

The benefits here is that the code is more *declarative*, meaning we are encouraged to describe this flow referencing functions that does the actual job of each step. This helps a lot as complexity increases, but we also get other benefits here. Lets say we do not want to make another request and render again if we are already requesting the user.

```js
import { Stream } from 'effects-stream'

const stream = Stream.create()
  .mapIdle(getUser)
  .forEach(renderUserName)

document.body.querySelector('#button').addEventListener('click', stream.bind())
```

By using **mapIdle** the click will not be handled when there is an existing pending request. This is just one so called **operator** that will help you manage flows.

The second part here are the *side-effects* running. We are talking to the server and we are changing the UI. Instead of running these side effects directly from our logic, we can rather provide them on the **context**.

```js
import { Stream } from 'effects-stream'
import http from 'some-http-library'

const ui = {
  html(selector, content) {
    document.querySelector(selector).innerHTML = content
  }
}

const context = { ui, http }

const stream = Stream.create(context)
  .mapIdle(getUser)
  .forEach(renderUserName)

document.body.querySelector('#button').addEventListener('click', stream.bind())
```

We have now exposed an application specific API to our streams. This makes testing a lot easier to do and you will see later how this improves the developer experience even more. The actual functions referenced now can be defined as:

```js
import { Stream } from 'effects-stream'
import http from 'some-http-library'

const ui = {...}
const context = { ui, http }

async function getUser (event, { http }) {
  return await http.get('/user')
}

function renderUserName(user, { ui }) {
  ui.html('#user', user.name)
}

const stream = Stream.create(context)
  .mapIdle(getUser)
  .forEach(renderUserName)

document.body.querySelector('#button').addEventListener('click', stream.bind())
```

**Effects-Stream** is written in TypeScript so we can ensure some type safety on this code by.

```ts
import { Stream } from 'effects-stream'
import http from 'some-http-library'

type Context = {
  http: typeof http,
  ui: {
    html(selector: string, content: string | number): void
  }
}

type User = {
  name: string
}

const ui = {...}
const context: Context = { ui, http }

async function getUser (event: MouseEvent, { http }: Context): User {
  return await http.get('/user')
}

function renderUserName(user: User, { ui }: Context) {
  ui.html('#user', user.name)
}

const stream = Stream.create<MouseEvent, Context>(context)
  .mapIdle<User>(getUser)
  .forEach(renderUserName)

document.body.querySelector('#button').addEventListener('click', stream.bind())
```

Now we can safely decouple our functions and any wrongful composition will be warned by TypeScript.
