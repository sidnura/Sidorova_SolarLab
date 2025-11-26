import { createReducer, on } from '@ngrx/store';
import {
  adListEntityAdapter,
  AdListStateModel,
  initialState,
} from './ad-list.model';
import * as stateAction from './ad-list.action';

const adListReducer = createReducer<AdListStateModel>(
  initialState,
  on(stateAction.load, (state) =>
    adListEntityAdapter.removeAll({ ...state, loading: { list: true } })
  ),
  on(stateAction.loadSuccess, (state, action) =>
    adListEntityAdapter.upsertMany(action.payload, {
      ...state,
      count: action.payload.length,
      loading: {},
    })
  )
);

export const adListReducerFn = (state, action): AdListStateModel =>
  adListReducer(state, action);
