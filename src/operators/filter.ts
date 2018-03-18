import { Execution } from '../Executor';
import { Producer } from '../Producer';
import { throwError } from '../utils';

export default <ParentInput, Input, Context>(producer: Producer<ParentInput, Input, Context>, callback: (value: Input, context: Context) => boolean | Promise<boolean>) => {
  const returnedProducer = new Producer<ParentInput, Input, Context>(producer._parentProducer);
  producer.subscribe(
    (value: Input, context: Context, execution: Execution) => {
      const result = callback(value, context);
      if (result instanceof Promise) {
        result
          .then((shouldContinue) => {
            shouldContinue && returnedProducer.next(value, context, execution);
          })
          .catch((error) => {
            returnedProducer.error(error, context, execution)
          });
      } else {
        result && returnedProducer.next(value, context, execution);
      }
    },
    throwError,
    () => {}
  );

  return returnedProducer;
}