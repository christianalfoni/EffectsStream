/*
import { Observable } from './Observable';
import { Execution } from './Executor';
import { expect } from 'chai';
import 'mocha';

describe('Producer', () => {
	it('should expose Producer class', () => {
		expect(Observable).to.be.ok;
	});
	it('should instantiate Producer with subscription ability', () => {
		let subscribeValue;
		const p = new Observable({});
		p.subscribe((value) => {
			subscribeValue = value;
		});
		p.next('foo');
		expect(subscribeValue).to.equal('foo');
	});
	it('should expose context and execution', () => {
		let subscribeCalled = false;
		const p = new Observable({ foo: 'bar' });
		p.subscribe((value, context, execution) => {
			subscribeCalled = true;
			expect(context).to.deep.equal({ foo: 'bar' });
			expect(execution).to.be.instanceOf(Execution);
		});
		p.next('foo');
		expect(subscribeCalled).to.be.ok;
	});
});
*/