import { Observable } from '../Observable';
import { Execution } from '../Executor';
import { expect } from 'chai';
import 'mocha';

describe('forEach', () => {
	it('should run with context', (done) => {
    type Context = { foo: string };

		const observable = new Observable<string, Context>({ foo: 'bar' })
			.forEach((value, context) => {
        expect(context).to.deep.equal({ foo: 'bar' });
        done()
			})

    observable.push('foo');
  });
  it('should run sync', (done) => {
		const observable = new Observable<string>()
			.forEach((value) => {
				expect(value).to.equal('foo');
			})
			.subscribe((value) => {
        expect(value).to.equal('foo');
        done()
      });

    observable.push('foo');
  });
  it('should run async', (done) => {
		const observable = new Observable<string>()
			.forEach((value) => {
				expect(value).to.equal('foo');

				return Promise.resolve();
			})
			.subscribe((value) => {
        expect(value).to.equal('foo');
        done()
      });

    observable.push('foo');
  });
})