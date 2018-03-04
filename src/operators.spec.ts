import { Producer } from './Producer';
import { Execution } from './Executor';
import { expect } from 'chai';
import 'mocha';
import { InternalProducer } from './InternalProducer';

type Context = { foo: string };

describe('Operators', () => {
	it('should run MAP operator', () => {
		let subscribeCalled = false;
		const p = new Producer<string, Context>({ foo: 'bar' });
		p
			.map((value, context) => {
				expect(value).to.equal('foo');
				expect(context).to.deep.equal({ foo: 'bar' });
				return 123;
			})
			.subscribe((value) => {
				subscribeCalled = true;
				expect(value).to.equal(123);
			});
		p.next('foo');
		expect(subscribeCalled).to.be.ok;
	});
	it('should run COMPOSE operator', () => {
		let subscribeCalled = false;
		const p = new Producer<string>();

		p.compose((p) => p.map((value) => 123)).subscribe((value) => {
			subscribeCalled = true;
			expect(value).to.equal(123);
		});
		p.next('foo');
		expect(subscribeCalled).to.be.ok;
	});
	it('should run FOREACH operator', () => {
		let subscribeCalled = false;
		const p = new Producer<string, Context>({ foo: 'bar' });

		p
			.forEach((value, context) => {
				expect(context).to.deep.equal({ foo: 'bar' });
				expect(value).to.equal('foo');
			})
			.subscribe((value, context) => {
				subscribeCalled = true;
				expect(value).to.equal('foo');
				expect(context).to.deep.equal({ foo: 'bar' });
			});
		p.next('foo');
		expect(subscribeCalled).to.be.ok;
	});
	it('should run FILTER operator', () => {
		let subscribeCalled = false;
		const p = new Producer<string, Context>({ foo: 'bar' });

		p
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
		p.next('foo');
		expect(subscribeCalled).to.not.be.ok;
	});
	it('should run FORK operator', () => {
		let subscribeCalled = false;
		const p = new Producer<string>();

		p
			.fork(() => 'bar', {
				foo: (p: Producer<string>) => p.map((value) => 'foo'),
				bar: (p: Producer<string>) => p.map((value) => 123)
			})
			.subscribe((value, context) => {
				subscribeCalled = true;
				expect(value).to.equal(123);
			});

		p.next('foo');
		expect(subscribeCalled).to.be.ok;
	});
});
