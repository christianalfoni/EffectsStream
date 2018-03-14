import { Producer } from './Producer';

export const Stream = {
	create<Input, Context>(context) {
		return new Producer<Input, Context>(context);
	}
};
