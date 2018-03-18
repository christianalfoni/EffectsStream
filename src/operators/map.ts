import { Execution } from '../Executor';
import { Producer } from '../Producer';
import { throwError } from '../utils';

export default <Output, ParentInput, Input, Context>(producer: Producer<ParentInput, Input, Context>, callback: (value: Input, context: Context) => Output | Promise<Output>) => {
  const returnedProducer = new Producer<ParentInput, Output, Context>(producer._parentProducer);
  producer.subscribe(
    (value: Input, context: Context, execution: Execution) => {
      let result;
      try {
        result = callback(value, context);
      } catch (error) {
        returnedProducer.error(error, context, execution);
        return;
      }

      if (result instanceof Promise) {
        result
          .then((value) => {
            returnedProducer.next(value, context, execution);
          })
          .catch((error) => {
            returnedProducer.error(error, context, execution);
          });
      } else {
        returnedProducer.next(result, context, execution);
      }
    },
    throwError,
    () => {}
  );

  return returnedProducer;
}