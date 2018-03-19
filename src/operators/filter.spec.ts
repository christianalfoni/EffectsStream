import { Observable } from '../Observable';
import { Execution } from '../Executor';
import { expect } from 'chai';
import 'mocha';

describe('filter', () => {
	it('should run with context', (done) => {
    type Context = { foo: string };

		const observable = new Observable<string, Context>({ foo: 'bar' })
			.filter((value, context) => {
        expect(context).to.deep.equal({ foo: 'bar' });
        done()
        return true
			})

    observable.push('foo');
  });
  it('should run with bound context', (done) => {
    type BoundContext = { foo: string };

		const boundedStream = new Observable<string, {}, BoundContext>()
			.filter((value, _, boundContext) => {
        expect(boundContext).to.deep.equal({ foo: 'bar' });
        done()
        return true
      })
      .bindContext({
        foo: 'bar'
      })

      boundedStream('foo');
  });
  it('should run sync', (done) => {
		const observable = new Observable<string>()
			.filter((value) => {
        expect(value).to.equal('foo');
        return true
			})
			.subscribe((value) => {
        expect(value).to.equal('foo');
        done()
      });

    observable.push('foo');
  });
  it('should run async', (done) => {
		const observable = new Observable<string>()
			.filter((value) => {
				expect(value).to.equal('foo');

				return Promise.resolve(true);
			})
			.subscribe((value) => {
        expect(value).to.equal('foo');
        done()
      });

    observable.push('foo');
  });
  it('should stop when returning false', (done) => {
    let subscribeCalled = false
		const observable = new Observable<string>()
			.filter((value) => {
				return false
			})
			.subscribe((value) => {
        subscribeCalled = true
        expect(value).to.equal('foo');
      });

    observable.push('foo');
    expect(subscribeCalled).to.be.not.ok
    done()
  });
})