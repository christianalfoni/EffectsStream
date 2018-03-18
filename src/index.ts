import { Producer } from './Producer';

export const Stream = <Input, Context = {}>(context?: Context) => {
	return new Producer<Input, Context>(context);
};
