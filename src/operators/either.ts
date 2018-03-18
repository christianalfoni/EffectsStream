import { Execution } from '../Executor';
import { Producer } from '../Producer';
import { throwError } from '../utils';

export default <Output, ErrorOutput, ParentInput, Input, Context>(
  parentProducer: Producer<ParentInput, Input, Context>,
  callback: (producer: Producer<ParentInput, Input, Context>) => Producer<ParentInput, Output, Context>,
  errorCallback: (producer: Producer<ParentInput, Error, Context>) => Producer<ParentInput, ErrorOutput, Context>
) => {
  const returnedProducer = new Producer<ParentInput, Output | ErrorOutput, Context>(parentProducer._parentProducer);
  parentProducer.subscribe(
    (value, context, execution) => {
      const producer = new Producer<ParentInput, Input, Context>(parentProducer._parentProducer);
      const newProducer = callback(producer);
      newProducer.subscribe((value) => returnedProducer.next(value, context, execution));
      producer.next(value, context, execution);
    },
    (value, context, execution) => {
      const producer = new Producer<ParentInput, Error, Context>(parentProducer._parentProducer);
      const newProducer = errorCallback(producer);
      newProducer.subscribe((value) => returnedProducer.next(value, context, execution));
      producer.next(value, context, execution);
    }
  );

  return returnedProducer;
}