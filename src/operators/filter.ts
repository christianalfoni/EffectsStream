import { Execution } from '../Executor';
import { Producer } from '../Producer';
import { throwError } from '../utils';

export default <ParentInput, Input, Context, BoundContext>(producer: Producer<ParentInput, Input, Context, BoundContext>, callback: (value: Input, context: Context, boundContext?: BoundContext) => boolean | Promise<boolean>) => {
  const returnedProducer = new Producer<ParentInput, Input, Context, BoundContext>(producer._parentProducer);
  producer.subscribe(
    (value: Input, context: Context, execution: Execution, boundContext?: BoundContext) => {
      const result = callback(value, context, boundContext);
      if (result instanceof Promise) {
        result
          .then((shouldContinue) => {
            shouldContinue && returnedProducer.next(value, context, execution, boundContext);
          })
          .catch((error) => {
            returnedProducer.error(error, context, execution, boundContext)
          });
      } else {
        result && returnedProducer.next(value, context, execution, boundContext);
      }
    },
    throwError,
    () => {}
  );

  return returnedProducer;
}