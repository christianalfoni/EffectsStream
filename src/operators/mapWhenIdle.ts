import { Execution } from '../Executor';
import { Producer } from '../Producer';
import { throwError } from '../utils';

export default <Output, ParentInput, Input, Context, BoundContext>(producer: Producer<ParentInput, Input, Context, BoundContext>, callback: (value: Input, context: Context, boundContext?: BoundContext) => Promise<Output>) => {
  const returnedProducer = new Producer<ParentInput, Output, Context, BoundContext>(producer._parentProducer);
  let result;
  producer.subscribe(
    (value: Input, context: Context, execution: Execution, boundContext?: BoundContext) => {
      if (result) {
        return;
      }

      try {
        result = callback(value, context, boundContext);
      } catch (error) {
        returnedProducer.error(error, context, execution, boundContext);
        return;
      }

      result
        .then((value) => {
          result = null;
          returnedProducer.next(value, context, execution, boundContext);
        })
        .catch((error) => {
          result = null;
          returnedProducer.error(error, context, execution, boundContext);
        });
    },
    throwError,
    () => {}
  );

  return returnedProducer;
}