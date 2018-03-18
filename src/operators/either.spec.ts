import { Observable } from '../Observable';
import { Execution } from '../Executor';
import { expect } from 'chai';
import 'mocha';

describe('either', () => {
	it('should run catch stream on error', (done) => {
		const stream = new Observable<string>()
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
						return 'bar';
					})
			)
			.subscribe((value) => {
        expect(value).to.equal('bar')
        done()
			});

      stream.push('foo');
  });
})
