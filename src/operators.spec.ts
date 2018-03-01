import { Producer } from './Producer';
import { Execution } from './Executor'
import { expect } from 'chai';
import 'mocha';

describe('Producer', () => {
  it('should run MAP operator', () => {
    let subscribeCalled = false
    const p = new Producer<string, { foo: string }>({ foo: 'bar' })
    p.map((value, context) => {
      return 123
    }).subscribe((value, context, execution) => {
      subscribeCalled = true
      expect(context).to.deep.equal({ foo: 'bar' })
      expect(execution).to.be.instanceOf(Execution)
    })
    p.next('foo')
    expect(subscribeCalled).to.be.ok
  });
})