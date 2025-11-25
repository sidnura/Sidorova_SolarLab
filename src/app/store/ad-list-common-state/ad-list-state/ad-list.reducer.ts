import { createReducer } from '@ngrx/store';
import { AdListStateModel, initialState } from './ad-list.model';

const adListReducer = createReducer<AdListStateModel>(initialState);

export const adListReducerFn = (state, action): AdListStateModel =>
  adListReducer(state, action);
