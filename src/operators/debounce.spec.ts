import { Observable } from '../Observable';
import { Execution } from '../Executor';
import { expect } from 'chai';
import { nextTick } from '../utils';
import 'mocha';

describe('compose', () => {
	it('should compose in an other stream', (done) => {
		let count = 0;
		const observable = new Observable<string>().debounce(0).forEach((value) => {
			count++;
		});

		observable.push('foo');
		observable.push('foo');
		nextTick(() => {
			expect(count).to.equal(1);
			done();
		}, 2);
	});
});
