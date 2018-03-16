import { Producer } from './Producer';
import { Execution } from './Executor';
import { expect } from 'chai';
import 'mocha';
import { InternalProducer } from './InternalProducer';

type Context = { foo: string };

describe('Operators', () => {
	it('should run MAP operator', () => {
		let subscribeCalled = false;
		const p = new Producer<string, Context>({ foo: 'bar' })
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
		const p = new Producer<string>().compose<number>((p) => p.map((value) => 123)).subscribe((value) => {
			subscribeCalled = true;
			expect(value).to.equal(123);
		});
		p.push('foo');
		expect(subscribeCalled).to.be.ok;
	});
	it('should run FOREACH operator', () => {
		let subscribeCalled = false;
		const p = new Producer<string, Context>({ foo: 'bar' })
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
		const p = new Producer<string, Context>({ foo: 'bar' })
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
		const fork = (p: Producer<string>) => p.map((value) => 'foo');
		const p = new Producer<string>()
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
	it('should run CATCH operator', () => {
		let subscribeCalled = false;
		const p = new Producer<string>()
			.map(() => {
				throw new Error('test');
			})
			.catch((error) => {
				expect(error.message).to.be.equal('test');

				return 'bar';
			})
			.subscribe((value, context) => {
				subscribeCalled = true;
				expect(value).to.equal('bar');
			});

		p.push('foo');
		expect(subscribeCalled).to.be.ok;
	});
	it('should run MAPIDLE operator', (done) => {
		let subscribeCalledCount = 0;
		const p = new Producer<string>()
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
