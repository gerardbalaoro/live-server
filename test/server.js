const request = require('supertest');
const server = require('./data/index');

describe('Basic functionality tests', () => {
	after(() => {
		server.shutdown();
	});

	it('Responds with index.html', done => {
		request(server.$app)
			.get('/')
			.expect('Content-Type', 'text/html; charset=UTF-8')
			.expect(/Example Domain/i)
			.expect(200, done);
	});

	it('Injects payload', done => {
		request(server.$app)
			.get('/')
			.expect('Content-Type', 'text/html; charset=UTF-8')
			.expect(/<script [^]+?Live reload enabled[^]+?<\/script>/i)
			.expect(200, done);
	});

	it('Injects payload to <head> when no <body>', done => {
		request(server.$app)
			.get('/head.html')
			.expect('Content-Type', 'text/html; charset=UTF-8')
			.expect(/<script [^]+?Live reload enabled[^]+?<\/script>/i)
			.expect(200, done);
	});

	it('Does not inject HTML fragments', function(done) {
		request(server.$app)
			.get('/fragment.html')
			.expect('Content-Type', 'text/html; charset=UTF-8')
			.expect(function(res) {
				if (res.text.toString().indexOf('Live reload enabled') > -1)
					throw new Error('injected code should not be found');
			})
			.expect(200, done);
	});

	it('Mounts directories', done => {
		request(server.$app)
			.get('/extra/empty.txt')
			.expect('Content-Type', 'text/plain; charset=UTF-8')
			.expect(/^This is an empty file$/)
			.expect(200, done);
	});

	it('Uses custom middleware', done => {
		request(server.$app)
			.get('/')
			.expect('Live-Server', 'true')
			.expect(200, done);
	});

	it('Uses custom payload', done => {
		request(server.$app)
			.get('/')
			.expect('Content-Type', 'text/html; charset=UTF-8')
			.expect(/This is a custom payload/i)
			.expect(200, done);
	});
});
