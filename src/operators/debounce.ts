import { Execution } from '../Executor';
import { Producer } from '../Producer';
import { throwError } from '../utils';

export default <ParentInput, Input, Context, BoundContext>(producer: Producer<ParentInput, Input, Context, BoundContext>, time: number) => {
	const returnedProducer = new Producer<ParentInput, Input, Context, BoundContext>(producer._parentProducer);
	let timeout;
	producer.subscribe(
		(value: Input, context: Context, execution: Execution, boundContext?: BoundContext) => {
			clearTimeout(timeout);
			timeout = setTimeout(() => {
				returnedProducer.next(value, context, execution, boundContext);
			}, time);
		},
		throwError,
		() => {}
	);

	return returnedProducer;
};
