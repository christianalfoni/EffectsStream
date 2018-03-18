import { Observable } from '../Observable';
import { Execution } from '../Executor';
import { expect } from 'chai';
import { nextTick } from '../utils'
import 'mocha';

describe('mapWhenIdle', () => {
	it('should run with context', (done) => {
    type Context = { foo: string };

		const observable = new Observable<string, Context>({ foo: 'bar' })
			.mapWhenIdle((value, context) => {
        expect(context).to.deep.equal({ foo: 'bar' });
        return Promise.resolve()
      })
      .forEach(() => done())

    observable.push('foo');
  });
  it('should map to new value async', (done) => {
		const observable = new Observable<string>()
			.mapWhenIdle((value) => {
				expect(value).to.equal('foo');

				return Promise.resolve(123);
			})
			.subscribe((value) => {
        expect(value).to.equal(123);
        done()
      });

    observable.push('foo');
  });
  it('should not map when existing mapping is running', (done) => {
    let count = 0
		const observable = new Observable<string>()
			.mapWhenIdle((value) => {
				expect(value).to.equal('foo');

				return Promise.resolve(123);
			})
			.subscribe((value) => {
        expect(value).to.equal(123);
        count++
      });

    observable.push('foo');
    observable.push('bar');
    nextTick(() => {
      expect(count).to.equal(1)
      done()
    }, 2)
  });
})