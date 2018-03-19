import { Execution } from '../Executor';
import { Producer } from '../Producer';
import { throwError } from '../utils';

export default <Output, ParentInput, Input, Context, BoundContext>(producer: Producer<ParentInput, Input, Context, BoundContext>, callback: (value: Input, context: Context, boundValue?: BoundContext) => Output | Promise<Output>) => {
  const returnedProducer = new Producer<ParentInput, Output, Context, BoundContext>(producer._parentProducer);
  producer.subscribe(
    (value: Input, context: Context, execution: Execution, boundContext?: BoundContext) => {
      let result;
      try {
        result = callback(value, context, boundContext);
      } catch (error) {
        returnedProducer.error(error, context, execution, boundContext);
        return;
      }

      if (result instanceof Promise) {
        result
          .then((value) => {
            returnedProducer.next(value, context, execution, boundContext);
          })
          .catch((error) => {
            returnedProducer.error(error, context, execution, boundContext);
          });
      } else {
        returnedProducer.next(result, context, execution, boundContext);
      }
    },
    throwError,
    () => {}
  );

  return returnedProducer;
}