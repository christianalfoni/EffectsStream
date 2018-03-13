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

type InternalProducerFactory = (input: InternalProducer<any, any>) => InternalProducer<any, any>;

type Callback<InputProducer, OutputProducer> = (p: InputProducer) => OutputProducer;

type BasePaths<Paths> = { [Path in keyof Paths]: Paths[Path] };

export class InternalProducer<Input, Context> {
	_listeners: Listeners<Input, Context> = [];
	_context?: Context;
	_executor?: Executor;
	valueType: Input;
	fork<Paths extends { [key: string]: (p: InternalProducer<Input, Context>) => InternalProducer<any, Context> }>(
		callback: (value: Input, context: Context) => keyof Paths,
		paths: Paths
	) {
		let producer = new InternalProducer<any, Context>();
		this.subscribe((value: Input, context: Context, execution: Execution) => {
			const result = callback(value, context);
			const pathProducer = new InternalProducer<Input, Context>();
			const pathStreamCallback = paths[result];
			const pathStream = pathStreamCallback(pathProducer);
			pathStream.subscribe((pathValue, context, execution) => {
				producer.next(pathValue, context, execution);
			});
			pathProducer.next(value, context, execution);
		}, throwError);

		return producer;
	}
	map<Output>(callback: (value: Input, context: Context) => Output) {
		const producer = new InternalProducer<Output, Context>();
		this.subscribe(
			(value: Input, context: Context, execution: Execution) => {
				const result: Output = callback(value, context);
				if (result instanceof Promise) {
					result
						.then((value) => {
							producer.next(value, context, execution);
						})
						.catch(producer.error.bind(producer));
				} else {
					producer.next(result, context, execution);
				}
			},
			throwError,
			() => {}
		);

		return producer;
	}
	compose<Output>(callback: (producer: InternalProducer<Input, Context>) => InternalProducer<Output, Context>) {
		const producer = new InternalProducer<Input, Context>();
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
		const producer = new InternalProducer<Input, Context>();
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
		const producer = new InternalProducer<Input, Context>();
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
	/*
  catch (callback) {
    const producer = new InternalProducer()
    this.subscribe((value, context, execution) => {
      const result = callback(value)
      if (result instanceof Promise) {
        result.then(() => {
          producer.next(value, context, execution)
        }).catch(producer.error.bind(producer))
      } else {
        producer.next(value, context, execution)
      }
    }, (value) => {
      const result = callback(value)
      if (result instanceof Promise) {
        result.then((value) => {
          producer.next(value)
        }).catch(producer.error.bind(producer))
      } else {
        producer.next(result)
      }
    })
    return producer
  }
  */
	subscribe(
		next: NextCallback<Input, Context>,
		error?: ErrorCallback<Context>,
		complete?: CompleteCallback<Context>
	) {
		this._listeners.push({ next, error, complete });
	}
	next(value: Input, context?: Context, execution?: Execution) {
		this._listeners.forEach((listener) => {
			listener.next(value, context || this._context, execution || this._executor.create());
		});
	}
	error(error: Error, context?: Context, execution?: Execution) {
		this._listeners.forEach((listener) => {
			listener.error(error, context || this._context, execution || this._executor.create());
		});
	}
	complete(value, context?: Context, execution?: Execution) {
		this._listeners.forEach((listener) => {
			listener.complete(value, context || this._context, execution || this._executor.create());
		});
	}
	bind(value) {
		return this.next.bind(this, value);
	}
}
