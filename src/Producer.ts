import { Execution } from './Executor';
import { BaseProducer } from './BaseProducer';
import { throwError } from './utils';

import map from './operators/map'
import fork from './operators/fork'

export class Producer<ParentInput, Input, Context> extends BaseProducer<ParentInput, Input, Context> {
	constructor(parentProducer?) {
		super(parentProducer);
	}
	fork<
		Paths extends {
			[key: string]: (p: Producer<ParentInput, Input, Context>) => Producer<ParentInput, any, Context>;
		}
	>(callback: (value: Input, context: Context) => keyof Paths, paths: Paths) {
		return fork<Paths, ParentInput, Input, Context>(this, callback, paths)
	}
	map<Output>(callback: (value: Input, context: Context) => Output | Promise<Output>) {
		return map<Output, ParentInput, Input, Context>(this, callback)
	}
	mapWhenIdle<Output>(callback: (value: Input, context: Context) => Promise<Output>) {
		const producer = new Producer<ParentInput, Output, Context>(this._parentProducer);
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
		callback: (producer: Producer<ParentInput, Input, Context>) => Producer<ParentInput, Output, Context>
	) {
		const producer = new Producer<ParentInput, Input, Context>(this._parentProducer);
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
		const producer = new Producer<ParentInput, Input, Context>(this._parentProducer);
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
		const producer = new Producer<ParentInput, Input, Context>(this._parentProducer);
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
	catch<Output>(callback: (value: Error, context: Context) => Output | Promise<Output>) {
		const producer = new Producer<ParentInput, Input | Output, Context>(this._parentProducer);
		this.subscribe(
			(value, context, execution) => {
				producer.next(value, context, execution);
			},
			(value, context, execution) => {
				const result = callback(value, context);
				if (result instanceof Promise) {
					result
						.then((promiseValue) => {
							producer.next(promiseValue, context, execution);
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
	either<Output, ErrorOutput>(
		callback: (producer: Producer<ParentInput, Input, Context>) => Producer<ParentInput, Output, Context>,
		errorCallback: (producer: Producer<ParentInput, Error, Context>) => Producer<ParentInput, ErrorOutput, Context>
	) {
		const returnedProducer = new Producer<ParentInput, Output | ErrorOutput, Context>(this._parentProducer);
		this.subscribe(
			(value, context, execution) => {
				const producer = new Producer<ParentInput, Input, Context>(this._parentProducer);
				const newProducer = callback(producer);
				newProducer.subscribe((value) => returnedProducer.next(value, context, execution));
				producer.next(value, context, execution);
			},
			(value, context, execution) => {
				const producer = new Producer<ParentInput, Error, Context>(this._parentProducer);
				const newProducer = errorCallback(producer);
				newProducer.subscribe((value) => returnedProducer.next(value, context, execution));
				producer.next(value, context, execution);
			}
		);

		return returnedProducer;
	}
}
