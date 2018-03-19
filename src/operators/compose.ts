import { Execution } from '../Executor';
import { Producer } from '../Producer';
import { throwError } from '../utils';

export default <Output, ParentInput, Input, Context , BoundContext>(
  producer: Producer<ParentInput, Input, Context, BoundContext>,
  callback: (producer: Producer<ParentInput, Input, Context, BoundContext>) => Producer<ParentInput, Output, Context, BoundContext>
) => {
  const returnedProducer = new Producer<ParentInput, Input, Context, BoundContext>(producer._parentProducer);
  producer.subscribe(
    (value: Input, context: Context, execution: Execution, boundContext?: BoundContext) => {
      returnedProducer.next(value, context, execution, boundContext);
    },
    throwError,
    () => {}
  );

  return callback(returnedProducer);
}