import { Execution } from './Executor';
import { BaseProducer } from './BaseProducer';
import { throwError } from './utils';

import map from './operators/map';
import fork from './operators/fork';
import mapWhenIdle from './operators/mapWhenIdle';
import compose from './operators/compose';
import forEach from './operators/forEach';
import filter from './operators/filter';
import either from './operators/either';
import debounce from './operators/debounce';
import mapLatest from './operators/mapLatest';

export class Producer<ParentInput, Input, Context, BoundContext> extends BaseProducer<ParentInput, Input, Context, BoundContext> {
	constructor(parentProducer?) {
		super(parentProducer);
	}
	fork<
		Paths extends {
			[key: string]: (p: Producer<ParentInput, Input, Context, BoundContext>) => Producer<ParentInput, any, Context, BoundContext>;
		}
	>(callback: (value: Input, context: Context, boundContext?: BoundContext) => keyof Paths, paths: Paths) {
		return fork<Paths, ParentInput, Input, Context, BoundContext>(this, callback, paths);
	}
	map<Output>(callback: (value: Input, context: Context, boundContext?: BoundContext) => Output | Promise<Output>) {
		return map<Output, ParentInput, Input, Context, BoundContext>(this, callback);
	}
	mapLatest<Output>(callback: (value: Input, context: Context, boundContext?: BoundContext) => Promise<Output>) {
		return mapLatest<Output, ParentInput, Input, Context, BoundContext>(this, callback);
	}
	mapWhenIdle<Output>(callback: (value: Input, context: Context, boundContext?: BoundContext) => Promise<Output>) {
		return mapWhenIdle<Output, ParentInput, Input, Context, BoundContext>(this, callback);
	}
	compose<Output>(
		callback: (producer: Producer<ParentInput, Input, Context, BoundContext>) => Producer<ParentInput, Output, Context, BoundContext>
	) {
		return compose<Output, ParentInput, Input, Context, BoundContext>(this, callback);
	}
	forEach(callback: (value: Input, context: Context, boundContext?: BoundContext) => void | Promise<void>) {
		return forEach<ParentInput, Input, Context, BoundContext>(this, callback);
	}
	filter(callback: (value: Input, context: Context, boundContext?: BoundContext) => boolean | Promise<boolean>) {
		return filter<ParentInput, Input, Context, BoundContext>(this, callback);
	}
	either<Output, ErrorOutput>(
		callback: (producer: Producer<ParentInput, Input, Context, BoundContext>) => Producer<ParentInput, Output, Context, BoundContext>,
		errorCallback: (producer: Producer<ParentInput, Error, Context, BoundContext>) => Producer<ParentInput, ErrorOutput, Context, BoundContext>
	) {
		return either<Output, ErrorOutput, ParentInput, Input, Context, BoundContext>(this, callback, errorCallback);
	}
	debounce(time: number) {
		return debounce<ParentInput, Input, Context, BoundContext>(this, time);
	}
}
