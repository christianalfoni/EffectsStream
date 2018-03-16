import { Producer } from './Producer';

export const Stream = {
	create<Input, Context = {}>(context?: Context) {
		return new Producer<Input, Context>(context);
	}
};
