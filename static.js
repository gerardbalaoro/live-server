const fs = require('fs')
const url = require('url')
const path = require('path')
const send = require('send')
const es = require('event-stream')

module.exports = (root, payload) => {
	return (req, res, next) => {
		if (req.method !== 'GET' && req.method !== 'HEAD') return next()
		let payloadTarget = null

		send(req, url.parse(req.url).pathname, { root: root })
			.on('error', err => {
				if (err.status === 404) return next()
				next(err)
			})
			.on('directory', () => {
				const pathname = url.parse(req.originalUrl).pathname
				res.statusCode = 301
				res.setHeader('Location', pathname + '/')
				res.end()
			})
			.on('file', filepath => {
				const ext = path.extname(filepath).toLocaleLowerCase()
				if (!req.headers.origin && ['', '.html', '.htm', '.xhtml'].indexOf(ext) > -1) {
					let contents = fs.readFileSync(filepath, 'utf-8')
					for (const target of [new RegExp('</body>', 'i'), new RegExp('</head>', 'i')]) {
						let match = target.exec(contents)
						if (match) {
							payloadTarget = match[0]
							break
						}
					}
				}
			})
			.on('stream', stream => {
				if (payloadTarget) {
					payload = fs.readFileSync(path.join(__dirname, 'payload.html'), 'ascii') + (payload || '')
					res.setHeader('Content-Length', payload.length + res.getHeader('Content-Length'))
					const originalPipe = stream.pipe
					stream.pipe = resp => {
						originalPipe
							.call(stream, es.replace(new RegExp(payloadTarget, 'i'), payload + payloadTarget))
							.pipe(resp)
					}
				}
			})
			.pipe(res)
	}
}
