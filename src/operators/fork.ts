import { Execution } from '../Executor';
import { Producer } from '../Producer';
import { throwError } from '../utils';

export default <Paths, ParentInput, Input, Context, BoundContext>(producer: Producer<ParentInput, Input, Context, BoundContext>, callback: (value: Input, context: Context, boundContext?: BoundContext) => keyof Paths, paths: Paths) => {
		let returnedProducer = new Producer<ParentInput, any, Context, BoundContext>(producer._parentProducer);
		producer.subscribe((value: Input, context: Context, execution: Execution, boundContext?: BoundContext) => {
			let result;
			try {
				result = callback(value, context);
			} catch (error) {
				returnedProducer.error(error, context, execution, boundContext);
				return;
			}

			const pathProducer = new Producer<ParentInput, Input, Context, BoundContext>(producer._parentProducer);
			const pathStreamCallback = paths[result];
			const pathStream = pathStreamCallback(pathProducer);
			pathStream.subscribe((pathValue, context, execution, boundContext?: BoundContext) => {
				returnedProducer.next(pathValue, context, execution, boundContext);
			});
			pathProducer.next(value, context, execution, boundContext);
		}, throwError);

		return returnedProducer;
	}