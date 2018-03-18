import { Execution } from './Executor';
import { BaseProducer } from './BaseProducer';
import { throwError } from './utils';

import map from './operators/map'
import fork from './operators/fork'
import mapWhenIdle from './operators/mapWhenIdle'
import compose from './operators/compose'
import forEach from './operators/forEach'
import filter from './operators/filter'
import either from './operators/either'

export class Producer<ParentInput, Input, Context> extends BaseProducer<ParentInput, Input, Context> {
	constructor(parentProducer?) {
		super(parentProducer);
	}
	fork<
		Paths extends {
			[key: string]: (p: Producer<ParentInput, Input, Context>) => Producer<ParentInput, any, Context>;
		}
	>(callback: (value: Input, context: Context) => keyof Paths, paths: Paths) {
		return fork<Paths, ParentInput, Input, Context>(this, callback, paths)
	}
	map<Output>(callback: (value: Input, context: Context) => Output | Promise<Output>) {
		return map<Output, ParentInput, Input, Context>(this, callback)
	}
	mapWhenIdle<Output>(callback: (value: Input, context: Context) => Promise<Output>) {
		return mapWhenIdle<Output, ParentInput, Input, Context>(this, callback)
	}
	compose<Output>(
		callback: (producer: Producer<ParentInput, Input, Context>) => Producer<ParentInput, Output, Context>
	) {
		return compose<Output, ParentInput, Input, Context>(this, callback)
	}
	forEach(callback: (value: Input, context: Context) => void | Promise<void>) {
		return forEach(this, callback)
	}
	filter(callback: (value: Input, context: Context) => boolean | Promise<boolean>) {
		return filter(this, callback)
	}
	either<Output, ErrorOutput>(
		callback: (producer: Producer<ParentInput, Input, Context>) => Producer<ParentInput, Output, Context>,
		errorCallback: (producer: Producer<ParentInput, Error, Context>) => Producer<ParentInput, ErrorOutput, Context>
	) {
		return either<Output, ErrorOutput, ParentInput, Input, Context>(this, callback, errorCallback)
	}
}
