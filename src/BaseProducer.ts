import { Executor, Execution } from './Executor';

export type Listeners<Input, Context> = Listener<Input, Context>[];
export type NextCallback<Input, Context> = (value: Input, context: Context, execution: Execution) => void;
export type ErrorCallback<Context> = (value: Error, context: Context, execution: Execution) => void;
export type CompleteCallback<Context> = (value: any, context: Context, execution: Execution) => void;

export type Listener<Input, Context> = {
	next: NextCallback<Input, Context>;
	error: ErrorCallback<Context>;
	complete: CompleteCallback<Context>;
};

export class BaseProducer<ParentInput, Input, Context> {
	_listeners: Listeners<Input, Context> = [];
	_context?: Context;
	_executor?: Executor;
	_parentProducer;
	constructor(parentProducer?) {
		this._parentProducer = parentProducer || this;
	}
	subscribe(
		next: NextCallback<Input, Context>,
		error?: ErrorCallback<Context>,
		complete?: CompleteCallback<Context>
	) {
		this._listeners.push({ next, error, complete });

		return new BaseProducer<ParentInput, Input, Context>(this._parentProducer);
	}
	next(value: Input, context?: Context, execution?: Execution) {
		this._listeners.forEach((listener) => {
			listener.next(value, context || this._context, execution || this._executor.create());
		});
	}
	error(error: Error, context?: Context, execution?: Execution) {
		this._listeners.forEach((listener) => {
			listener.error && listener.error(error, context || this._context, execution || this._executor.create());
		});
	}
	complete(value, context?: Context, execution?: Execution) {
		this._listeners.forEach((listener) => {
			listener.complete &&
				listener.complete(value, context || this._context, execution || this._executor.create());
		});
	}
	callback(boundValue?: Input) {
		if (typeof boundValue === 'undefined') {
			return (arg: Input) => this.next(arg);
		}

		return () => this.next(boundValue);
	}
	middleware() {
		return (...args) =>
			this.next(args.reduce((currentValue, arg, index) => {
				currentValue[index] = arg;

				return currentValue;
			}, {}) as Input);
	}
	push(value: ParentInput) {
		this._parentProducer.next(value);
	}
}
