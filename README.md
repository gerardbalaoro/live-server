# ⚡ Live Server
An HTTP server with live reloading powered by [Express](https://expressjs.com)

## Usage

```js
const LiveServer = require('live-server')

const server = new LiveServer({
    root: 'public',
    port: 8080 // Will use a random port if in use
})

server.start()
```

### Mount directories to routes

```js
const server = new LiveServer({
    root: 'public',
    mount: {
        // Leading slash is required
        '/assets': '/path/to/folder'
    }
})
```

### Custom middleware

```js
const server = new LiveServer({
    root: 'public',
    middleware: [
        (req, res, next) => {
            console.log('Log: ' + Date.now())
            next()
        }
    ]
})
```

### Customizing the payload

Live reloading works by injecting a script to HTML files that
connect to a websocket that sends messages whenever a file or 
directory is added, updated, or deleted.

You can add a custom payload in the form of an HTML string
that will be appended after the live reloading script.

```js
const server = new LiveServer({
    root: 'public',
    payload: '<!-- This is a custom payload -->',
})
```

### Properties

- **`$app`** - [Express](https://expressjs.com) application instance
- **`$server`** - Active HTTP server
- **`$watcher`** - File system watcher
- **`$socket`** - WebSocket

### Methods

- **`start`** - Start the server
- **`shutdown`** - Shutdown the server
- **`on(event, listener)`** - Listen to events

### Events

- **`starting`** - Before server start
- **`started`** - On server start
- **`mounted`** - On directory mounted
- **`shutdown`** - On server shutdown

### Getting the server URL

You can retrieve the URL by listening to the `started` event.

```js
server.on('started', (url) => {
    console.log('Listening on ' + url)
})
```

### Watcher events

You can listen to any watcher events through the `$watcher` property
when the server has started.
Read [chokidar watcher's documentation](https://www.npmjs.com/package/chokidar)
to see a list of events.

```js
server.on('started', () => {
    server.$watcher.on('change', (file) => {
        console.log(file + ' has been updated')
    })
})
```
