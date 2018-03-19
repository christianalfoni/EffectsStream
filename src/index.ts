import { Observable } from './Observable';
import { Producer } from './Producer';

export type ComposableStream<Input, Output, Context = {}, BoundContext = {}> = (stream: Producer<any, Input, Context, BoundContext>) => Producer<any, Output, Context, BoundContext>

export { Producer } from './Producer';

export const Stream = <Input, Context = {}, BoundContext = {}>(context?: Context) => {
	return new Observable<Input, Context, BoundContext>(context);
};
