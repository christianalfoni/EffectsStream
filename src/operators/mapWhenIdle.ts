import { Execution } from '../Executor';
import { Producer } from '../Producer';
import { throwError } from '../utils';

export default <Output, ParentInput, Input, Context>(producer: Producer<ParentInput, Input, Context>, callback: (value: Input, context: Context) => Promise<Output>) => {
  const returnedProducer = new Producer<ParentInput, Output, Context>(producer._parentProducer);
  let result;
  producer.subscribe(
    (value: Input, context: Context, execution: Execution) => {
      if (result) {
        return;
      }

      try {
        result = callback(value, context);
      } catch (error) {
        returnedProducer.error(error, context, execution);
        return;
      }

      result
        .then((value) => {
          result = null;
          returnedProducer.next(value, context, execution);
        })
        .catch((error) => {
          result = null;
          returnedProducer.error(error, context, execution);
        });
    },
    throwError,
    () => {}
  );

  return returnedProducer;
}