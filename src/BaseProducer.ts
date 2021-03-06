import { Executor, Execution } from './Executor';

export type Listeners<Input, Context> = Listener<Input, Context>[];
export type NextCallback<Input, Context> = (
	value: Input,
	context: Context,
	execution: Execution,
	boundValue: any
) => void;
export type ErrorCallback<Context> = (value: Error, context: Context, execution: Execution) => void;
export type CompleteCallback<Context> = (value: any, context: Context, execution: Execution) => void;

export type Listener<Input, Context> = {
	next: NextCallback<Input, Context>;
	error: ErrorCallback<Context>;
	complete: CompleteCallback<Context>;
};

export class BaseProducer<ParentInput, Input, Context, BoundContext> {
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

		return new BaseProducer<ParentInput, Input, Context, BoundContext>(this._parentProducer);
	}
	next(value: Input, context?: Context, execution?: Execution, boundContext?: BoundContext) {
		this._listeners.forEach((listener) => {
			listener.next(value, context || this._context, execution || this._executor.create(), boundContext);
		});
	}
	error(error: Error, context?: Context, execution?: Execution, boundContext?: BoundContext) {
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
	callback(boundValue?: ParentInput) {
		if (typeof boundValue === 'undefined') {
			return (arg: ParentInput) => this.push(arg);
		}

		return () => this.push(boundValue);
	}
	middleware() {
		return (...args) =>
			this.push(args.reduce((currentValue, arg, index) => {
				currentValue[index] = arg;

				return currentValue;
			}, {}) as ParentInput);
	}
	bindContext(boundContext: BoundContext) {
		const producer = this;
		return function(value: ParentInput) {
			producer._parentProducer.next(value, null, null, boundContext);
		};
	}
	bind() {
		const producer = this;

		return function(this: BoundContext, value: ParentInput) {
			producer._parentProducer.next(value, null, null, this);
		};
	}
	push(value: ParentInput) {
		this._parentProducer.next(value);
	}
}
