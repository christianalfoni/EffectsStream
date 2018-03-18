import { Observable } from './Observable';

export const Stream = <Input, Context = {}>(context?: Context) => {
	return new Observable<Input, Context>(context);
};
