import { Observable } from '../Observable';
import { Execution } from '../Executor';
import { expect } from 'chai';
import 'mocha';

describe('FORK', () => {
	it('should run with context', (done) => {
    type Context = { foo: string };

		const observable = new Observable<string, Context>({ foo: 'bar' })
			.fork((value, context) => {
        expect(context).to.deep.equal({ foo: 'bar' });
        return 'foo'
			}, {
        foo: stream => stream.forEach(() => done())
      })

    observable.push('foo');
  });
  it('should run sync', (done) => {
		const observable = new Observable<string>({ foo: 'bar' })
			.fork((value) => {
        expect(value).to.equal('foo');
        return 'foo'
			}, {
        foo: stream => stream.map((value) => 123)
      })
      .forEach((value) => {
        expect(value).to.equal(123);
        done()
      })

    observable.push('foo');
  });
})