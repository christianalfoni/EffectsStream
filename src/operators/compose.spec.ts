import { Observable } from '../Observable';
import { Execution } from '../Executor';
import { expect } from 'chai';
import { ComposableStream } from '../'
import 'mocha';

describe('compose', () => {
	it('should compose in an other stream', (done) => {
    const composedStream: ComposableStream<string, number> = stream => stream.map(() => 123)
		const observable = new Observable<string>()
			.compose(composedStream)
      .forEach((value) => {
        expect(value).to.equal(123)
        done()
      })

    observable.push('foo');
  });
})