import { Observable } from './Observable';
import { Execution } from './Executor';
import { expect } from 'chai';
import 'mocha';

type Context = { foo: string };

describe('Operators', () => {
	it('should run MAP operator', () => {
		let subscribeCalled = false;
		const p = new Observable<string, Context>({ foo: 'bar' })
			.map((value, context) => {
				expect(value).to.equal('foo');
				expect(context).to.deep.equal({ foo: 'bar' });
				return 123;
			})
			.subscribe((value) => {
				subscribeCalled = true;
				expect(value).to.equal(123);
			});
		p.push('foo');
		expect(subscribeCalled).to.be.ok;
	});
	it('should run COMPOSE operator', () => {
		let subscribeCalled = false;
		const p = new Observable<string>().compose<number>((p) => p.map((value) => 123)).subscribe((value) => {
			subscribeCalled = true;
			expect(value).to.equal(123);
		});
		p.push('foo');
		expect(subscribeCalled).to.be.ok;
	});
	it('should run FOREACH operator', () => {
		let subscribeCalled = false;
		const p = new Observable<string, Context>({ foo: 'bar' })
			.forEach((value, context) => {
				expect(context).to.deep.equal({ foo: 'bar' });
				expect(value).to.equal('foo');
			})
			.subscribe((value, context) => {
				subscribeCalled = true;
				expect(value).to.equal('foo');
				expect(context).to.deep.equal({ foo: 'bar' });
			});
		p.push('foo');
		expect(subscribeCalled).to.be.ok;
	});
	it('should run FILTER operator', () => {
		let subscribeCalled = false;
		const p = new Observable<string, Context>({ foo: 'bar' })
			.filter((value, context) => {
				expect(context).to.deep.equal({ foo: 'bar' });
				expect(value).to.equal('foo');

				return true;
			})
			.filter((value) => {
				expect(value).to.equal('foo');

				return false;
			})
			.subscribe((value, context) => {
				subscribeCalled = true;
				expect(context).to.deep.equal({ foo: 'bar' });
			});
		p.push('foo');
		expect(subscribeCalled).to.not.be.ok;
	});
	it('should run FORK operator', () => {
		let subscribeCalled = false;
		const fork = (p: Observable<string>) => p.map((value) => 'foo');
		const p = new Observable<string>()
			.fork(() => 'bar', {
				foo: fork,
				bar: (p) => p.map((value) => 123)
			})
			.subscribe((value, context) => {
				subscribeCalled = true;
				expect(value).to.equal(123);
			});

		p.push('foo');
		expect(subscribeCalled).to.be.ok;
	});
	it('should run CATCH operator', (done) => {
		let subscribeCalled = false;
		const p = new Observable<string>()
			.map(() => {
				return Promise.reject('error');
			})
			.catch((value) => {
				return 'bar';
			})
			.subscribe((value) => {
				expect(value).to.equal('bar');
				subscribeCalled = true;
			});

		p.push('foo');
		setTimeout(() => {
			expect(subscribeCalled).to.be.ok;
			done();
		});
	});
	it('should run EITHER operator', () => {
		let subscribeCalled = false;
		const p = new Observable<string>()
			.map(() => {
				throw new Error('test');
			})
			.either(
				(stream) =>
					stream.map((value) => {
						return 123;
					}),
				(stream) =>
					stream.map((value) => {
						return 'foo';
					})
			)
			.subscribe((value) => {
				subscribeCalled = true;
			});

		p.push('foo');
		expect(subscribeCalled).to.be.ok;
	});
	it('should run MAPIDLE operator', (done) => {
		let subscribeCalledCount = 0;
		const p = new Observable<string>()
			.mapWhenIdle((value) => {
				return Promise.resolve(value);
			})
			.subscribe(
				(value, context) => {
					subscribeCalledCount++;
					expect(value).to.equal('foo');
				},
				(error) => {
					console.log(error);
				}
			);

		p.push('foo');
		p.push('bar');
		setTimeout(() => {
			expect(subscribeCalledCount).to.be.equal(1);
			done();
		});
	});
});
