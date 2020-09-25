const path = require('path')
const LiveServer = require('../../index')

const server = new LiveServer({
	root: path.join(__dirname, 'public'),
	payload: '<!-- This is a custom payload -->',
	mount: {
		'/extra': path.join(__dirname, 'extra'),
	},
	middleware: [
		(req, res, next) => {
			res.set('Live-Server', 'true')
			next()
		},
	],
})

server.on('started', (server, url) => {
	console.log(`Live Server: ${url}`)
})

server.start()
module.exports = server
