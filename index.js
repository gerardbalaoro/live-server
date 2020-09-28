const path = require('path');
const { EventEmitter } = require('events');
const { createHttpTerminator } = require('http-terminator');
const portfinder = require('portfinder');
const chokidar = require('chokidar');
const staticServer = require('./static');

const serverOptions = {
	root: process.cwd(),
	port: 8080,
	mount: {},
	middleware: [],
	payload: '',
	httpModule: null
};

class LiveServer {
	/**
	 * @param {serverOptions} options
	 */
	constructor(options) {
		this.options = Object.assign(serverOptions, options);
		this.$event = new EventEmitter();
		this.$app = require('express')();
		this.$socket = require('express-ws')(this.$app);
		this.$terminator = null;
		this.watcher = null;
		this.server = null;
	}

	get httpModule() {
		return this.options.httpModule || require('http');
	}

	on(event, listener) {
		this.$event.on(event, listener);
	}

	$prepareServer() {
		for (const middleware of this.options.middleware) {
			this.$app.use(middleware);
		}

		this.$app.ws('/', () => {});
		this.$app.use('/', staticServer(this.options.root, this.options.payload));

		for (let [route, directory] of Object.entries(this.options.mount)) {
			directory = path.resolve(process.cwd(), directory);
			this.$app.use(route, staticServer(directory, this.options.payload));
			this.$event.emit('mounted', route, directory);
		}
	}

	$prepareWatcher() {
		this.watcher = chokidar.watch([this.options.root, ...Object.values(this.options.mount)], {
			ignored: [p => p !== '.' && /(^[.#]|(?:__|~)$)/.test(path.basename(p))],
			ignoreInitial: true,
			ignorePermissionErrors: true,
		});

		this.watcher.on('all', () => {
			this.$socket.getWss().clients.forEach(ws => {
				ws.send('reload');
			});
		});
	}

	start() {
		this.$event.emit('starting');
		this.$prepareServer();
		this.$prepareWatcher();

		portfinder.getPort({ port: this.options.port || 3000 }, (err, port) => {
			if (err) throw err;
			const httpServer = this.httpModule.createServer(this.$app);
			this.server = httpServer.listen(port, '0.0.0.0', () => {
				const { address, port } = this.server.address();
				const url = `http://${address == '0.0.0.0' ? '127.0.0.1' : address}:${port}`;
				this.$terminator = createHttpTerminator({ server: this.server });
				this.$event.emit('started', url);
			});
		});
	}

	async shutdown() {
		this.$event.emit('shutdown', this.$app);
		if (this.watcher) await this.watcher.close();
		if (this.$terminator) await this.$terminator.terminate();
	}
}

module.exports = LiveServer;
