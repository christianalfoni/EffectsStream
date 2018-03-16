import { Executor, Execution } from './Executor';
import { throwError } from './utils';

export type NextCallback<Input, Context> = (value: Input, context: Context, execution: Execution) => void;
export type ErrorCallback<Context> = (value: Error, context: Context, execution: Execution) => void;
export type CompleteCallback<Context> = (value: any, context: Context, execution: Execution) => void;

export type Listener<Input, Context> = {
	next: NextCallback<Input, Context>;
	error: ErrorCallback<Context>;
	complete: CompleteCallback<Context>;
};
export type Listeners<Input, Context> = Listener<Input, Context>[];

type Callback<InputProducer, OutputProducer> = (p: InputProducer) => OutputProducer;

type BasePaths<Paths> = { [Path in keyof Paths]: Paths[Path] };

export class InternalProducer<ParentInput, Input, Context> {
	_listeners: Listeners<Input, Context> = [];
	_context?: Context;
	_executor?: Executor;
	valueType: Input;
	_parentProducer;
	constructor(parentProducer?) {
		this._parentProducer = parentProducer || this;
	}
	fork<
		Paths extends {
			[key: string]: (
				p: InternalProducer<ParentInput, Input, Context>
			) => InternalProducer<ParentInput, any, Context>;
		}
	>(callback: (value: Input, context: Context) => keyof Paths, paths: Paths) {
		let producer = new InternalProducer<ParentInput, any, Context>(this._parentProducer);
		this.subscribe((value: Input, context: Context, execution: Execution) => {
			let result;
			try {
				result = callback(value, context);
			} catch (error) {
				producer.error(error, context, execution);
				return;
			}

			const pathProducer = new InternalProducer<ParentInput, Input, Context>(this._parentProducer);
			const pathStreamCallback = paths[result];
			const pathStream = pathStreamCallback(pathProducer);
			pathStream.subscribe((pathValue, context, execution) => {
				producer.next(pathValue, context, execution);
			});
			pathProducer.next(value, context, execution);
		}, throwError);

		return producer;
	}
	map<Output>(callback: (value: Input, context: Context) => Output | Promise<Output>) {
		const producer = new InternalProducer<ParentInput, Output, Context>(this._parentProducer);
		this.subscribe(
			(value: Input, context: Context, execution: Execution) => {
				let result;
				try {
					result = callback(value, context);
				} catch (error) {
					producer.error(error, context, execution);
					return;
				}

				if (result instanceof Promise) {
					result
						.then((value) => {
							producer.next(value, context, execution);
						})
						.catch((error) => {
							producer.error(error, context, execution);
						});
				} else {
					producer.next(result, context, execution);
				}
			},
			throwError,
			() => {}
		);

		return producer;
	}
	mapWhenIdle<Output>(callback: (value: Input, context: Context) => Promise<Output>) {
		const producer = new InternalProducer<ParentInput, Output, Context>(this._parentProducer);
		let result;
		this.subscribe(
			(value: Input, context: Context, execution: Execution) => {
				if (result) {
					return;
				}

				try {
					result = callback(value, context);
				} catch (error) {
					producer.error(error, context, execution);
					return;
				}

				result
					.then((value) => {
						result = null;
						producer.next(value, context, execution);
					})
					.catch((error) => {
						result = null;
						producer.error(error, context, execution);
					});
			},
			throwError,
			() => {}
		);

		return producer;
	}
	compose<Output>(
		callback: (
			producer: InternalProducer<ParentInput, Input, Context>
		) => InternalProducer<ParentInput, Output, Context>
	) {
		const producer = new InternalProducer<ParentInput, Input, Context>(this._parentProducer);
		this.subscribe(
			(value: Input, context: Context, execution: Execution) => {
				producer.next(value, context, execution);
			},
			throwError,
			() => {}
		);

		return callback(producer);
	}
	forEach(callback: (value: Input, context: Context) => void | Promise<void>) {
		const producer = new InternalProducer<ParentInput, Input, Context>(this._parentProducer);
		this.subscribe(
			(value: Input, context: Context, execution: Execution) => {
				const result = callback(value, context);
				if (result instanceof Promise) {
					result
						.then(() => {
							producer.next(value, context, execution);
						})
						.catch(producer.error.bind(producer));
				} else {
					producer.next(value, context, execution);
				}
			},
			throwError,
			() => {}
		);

		return producer;
	}
	filter(callback: (value: Input, context: Context) => boolean | Promise<boolean>) {
		const producer = new InternalProducer<ParentInput, Input, Context>(this._parentProducer);
		this.subscribe(
			(value: Input, context: Context, execution: Execution) => {
				const result = callback(value, context);
				if (result instanceof Promise) {
					result
						.then((shouldContinue) => {
							shouldContinue && producer.next(value, context, execution);
						})
						.catch(producer.error.bind(producer));
				} else {
					result && producer.next(value, context, execution);
				}
			},
			throwError,
			() => {}
		);

		return producer;
	}
	catch<Output>(callback: (error: Error) => Output | Promise<Output>) {
		const producer = new InternalProducer(this._parentProducer);
		this.subscribe(
			(value, context, execution) => {
				producer.next(value, context, execution);
			},
			(value, context, execution) => {
				const result = callback(value);
				if (result instanceof Promise) {
					result
						.then((value) => {
							producer.next(value);
						})
						.catch((error) => {
							producer.error(error, context, execution);
						});
				} else {
					producer.next(result, context, execution);
				}
			}
		);
		return producer;
	}
	subscribe(
		next: NextCallback<Input, Context>,
		error?: ErrorCallback<Context>,
		complete?: CompleteCallback<Context>
	) {
		this._listeners.push({ next, error, complete });

		return this;
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
	callback(boundValue) {
		if (boundValue === 'undefined') {
			return (arg) => this.next(arg);
		}

		return () => this.next(boundValue);
	}
	middleware() {
		return (...args) =>
			this.next(
				args.reduce((currentValue, arg, index) => {
					currentValue[index] = arg;

					return currentValue;
				}, {})
			);
	}
	push(value: ParentInput) {
		this._parentProducer.next(value);
	}
}
