import { Execution } from '../Executor';
import { Producer } from '../Producer';
import { throwError } from '../utils';

export default <Output, ParentInput, Input, Context>(
  producer: Producer<ParentInput, Input, Context>,
  callback: (producer: Producer<ParentInput, Input, Context>) => Producer<ParentInput, Output, Context>
) => {
  const returnedProducer = new Producer<ParentInput, Input, Context>(producer._parentProducer);
  producer.subscribe(
    (value: Input, context: Context, execution: Execution) => {
      returnedProducer.next(value, context, execution);
    },
    throwError,
    () => {}
  );

  return callback(returnedProducer);
}