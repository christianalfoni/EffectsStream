import { Execution } from '../Executor';
import { Producer } from '../Producer';
import { throwError } from '../utils';

export default <Output, ErrorOutput, ParentInput, Input, Context, BoundContext>(
  parentProducer: Producer<ParentInput, Input, Context, BoundContext>,
  callback: (producer: Producer<ParentInput, Input, Context, BoundContext>) => Producer<ParentInput, Output, Context, BoundContext>,
  errorCallback: (producer: Producer<ParentInput, Error, Context, BoundContext>) => Producer<ParentInput, ErrorOutput, Context, BoundContext>
) => {
  const returnedProducer = new Producer<ParentInput, Output | ErrorOutput, Context, BoundContext>(parentProducer._parentProducer);
  parentProducer.subscribe(
    (value, context, execution, boundContext?: BoundContext) => {
      const producer = new Producer<ParentInput, Input, Context, BoundContext>(parentProducer._parentProducer);
      const newProducer = callback(producer);
      newProducer.subscribe((value) => returnedProducer.next(value, context, execution, boundContext));
      producer.next(value, context, execution, boundContext);
    },
    (value, context, execution, boundContext?: BoundContext) => {
      const producer = new Producer<ParentInput, Error, Context, BoundContext>(parentProducer._parentProducer);
      const newProducer = errorCallback(producer);
      newProducer.subscribe((value) => returnedProducer.next(value, context, execution, boundContext));
      producer.next(value, context, execution, boundContext);
    }
  );

  return returnedProducer;
}