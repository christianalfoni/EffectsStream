import { Execution } from '../Executor';
import { Producer } from '../Producer';
import { throwError } from '../utils';

export default <Output, ParentInput, Input, Context>(
	producer: Producer<ParentInput, Input, Context>,
	callback: (value: Input, context: Context) => Promise<Output>
) => {
	const returnedProducer = new Producer<ParentInput, Output, Context>(producer._parentProducer);
	let pending = [];
	producer.subscribe(
		(value: Input, context: Context, execution: Execution) => {
			let result;
			try {
				result = callback(value, context);
				pending.push(result);
			} catch (error) {
				returnedProducer.error(error, context, execution);
				return;
			}

			result
				.then((value) => {
					if (pending.indexOf(result) === pending.length - 1) {
						returnedProducer.next(value, context, execution);
						pending = pending.slice(pending.indexOf(result));
					}
				})
				.catch((error) => {
					if (pending.indexOf(result) === pending.length - 1) {
						returnedProducer.error(error, context, execution);
						pending = pending.slice(pending.indexOf(result));
					}
				});
		},
		throwError,
		() => {}
	);

	return returnedProducer;
};
