import { Execution } from '../Executor';
import { Producer } from '../Producer';
import { throwError } from '../utils';

export default <Paths, ParentInput, Input, Context>(producer: Producer<ParentInput, Input, Context>, callback: (value: Input, context: Context) => keyof Paths, paths: Paths) => {
		let returnedProducer = new Producer<ParentInput, any, Context>(producer._parentProducer);
		producer.subscribe((value: Input, context: Context, execution: Execution) => {
			let result;
			try {
				result = callback(value, context);
			} catch (error) {
				returnedProducer.error(error, context, execution);
				return;
			}

			const pathProducer = new Producer<ParentInput, Input, Context>(producer._parentProducer);
			const pathStreamCallback = paths[result];
			const pathStream = pathStreamCallback(pathProducer);
			pathStream.subscribe((pathValue, context, execution) => {
				returnedProducer.next(pathValue, context, execution);
			});
			pathProducer.next(value, context, execution);
		}, throwError);

		return returnedProducer;
	}