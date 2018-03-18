import { Executor } from './Executor';
import { Producer } from './Producer';

export class Observable<Input, Context = {}> extends Producer<Input, Input, Context> {
	_context: Context;
	_executor: Executor;
	constructor(context?: Context) {
		super();
		this._context = context;
		this._executor = new Executor();
	}
}
