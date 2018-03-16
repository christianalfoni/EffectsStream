import { Executor } from './Executor';
import { InternalProducer } from './InternalProducer';

export class Producer<Input, Context = {}> extends InternalProducer<Input, Input, Context> {
	_context: Context;
	_executor: Executor;
	constructor(context?: Context) {
		super();
		this._context = context;
		this._executor = new Executor();
	}
}
