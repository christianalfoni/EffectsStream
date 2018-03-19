import { Execution } from '../Executor';
import { Producer } from '../Producer';
import { throwError } from '../utils';

export default <Output, ParentInput, Input, Context, BoundContext>(
	producer: Producer<ParentInput, Input, Context, BoundContext>,
	callback: (value: Input, context: Context, boundContext?: BoundContext) => Promise<Output>
) => {
	const returnedProducer = new Producer<ParentInput, Output, Context, BoundContext>(producer._parentProducer);
	let pending = [];
	producer.subscribe(
		(value: Input, context: Context, execution: Execution, boundContext?: BoundContext) => {
			let result;
			try {
				result = callback(value, context, boundContext);
				pending.push(result);
			} catch (error) {
				returnedProducer.error(error, context, execution, boundContext);
				return;
			}

			result
				.then((value) => {
					if (pending.indexOf(result) === pending.length - 1) {
						returnedProducer.next(value, context, execution, boundContext);
						pending = pending.slice(pending.indexOf(result));
					}
				})
				.catch((error) => {
					if (pending.indexOf(result) === pending.length - 1) {
						returnedProducer.error(error, context, execution, boundContext);
						pending = pending.slice(pending.indexOf(result));
					}
				});
		},
		throwError,
		() => {}
	);

	return returnedProducer;
};
