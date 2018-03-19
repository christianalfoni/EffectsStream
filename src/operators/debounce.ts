import { Execution } from '../Executor';
import { Producer } from '../Producer';
import { throwError } from '../utils';

export default <ParentInput, Input, Context>(producer: Producer<ParentInput, Input, Context>, time: number) => {
	const returnedProducer = new Producer<ParentInput, Input, Context>(producer._parentProducer);
	let timeout;
	producer.subscribe(
		(value: Input, context: Context, execution: Execution) => {
			clearTimeout(timeout);
			timeout = setTimeout(() => {
				returnedProducer.next(value, context, execution);
			}, time);
		},
		throwError,
		() => {}
	);

	return returnedProducer;
};
