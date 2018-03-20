// @ts-ignore
import React from 'react';
import { Observable } from '../Observable';

export const create = function createComponentStream<Props = {}, State = {}, Context = {}>(context?) {
	return {
		Stream: function<Input>() {
			return new Observable<Input, Context, React.Component<Props, State>>(context);
		},
		setState: function<StateProp extends keyof State, Value>(cb: (passedValue: Value) => Pick<State, StateProp>) {
			return function(passedValue: Value, _, component: React.Component<Props, State>) {
				component.setState(cb(passedValue));
			};
		}
	};
};
