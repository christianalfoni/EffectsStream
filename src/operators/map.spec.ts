import { Observable } from '../Observable';
import { Execution } from '../Executor';
import { expect } from 'chai';
import 'mocha';

describe('MAP', () => {
	it('should run with context', (done) => {
    type Context = { foo: string };

		const observable = new Observable<string, Context>({ foo: 'bar' })
			.map((value, context) => {
        expect(context).to.deep.equal({ foo: 'bar' });
        done()
			})

    observable.push('foo');
  });
  it('should map to new value sync', (done) => {
		const observable = new Observable<string>()
			.map((value) => {
				expect(value).to.equal('foo');

				return 123;
			})
			.subscribe((value) => {
        expect(value).to.equal(123);
        done()
      });

    observable.push('foo');
  });
  it('should map to new value async', (done) => {
		const observable = new Observable<string>()
			.map((value) => {
				expect(value).to.equal('foo');

				return Promise.resolve(123);
			})
			.subscribe((value) => {
        expect(value).to.equal(123);
        done()
      });

    observable.push('foo');
  });
})