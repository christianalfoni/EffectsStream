import { Observable } from './Observable';
import { Producer } from './Producer';

export type ComposableStream<Input, Output, Context = {}> = (stream: Producer<any, Input, Context>) => Producer<any, Output, Context>

export { Producer } from './Producer';

export const Stream = <Input, Context = {}>(context?: Context) => {
	return new Observable<Input, Context>(context);
};
