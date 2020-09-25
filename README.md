# ⚡ Live Server
An HTTP server with live reloading powered by express

## Usage

```js
const LiveServer = require('live-server')

const server = new LiveServer({
    root: 'public',
    port: 8080
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