import { createReducer, on } from '@ngrx/store';
import {
  adDetailEntityAdapter,
  AdDetailStateModel,
  initialState,
} from './ad-detail.model';
import * as stateAction from './ad-detail.action';

const adDetailReducer = createReducer<AdDetailStateModel>(
  initialState,
  on(stateAction.load, (state) =>
    adDetailEntityAdapter.removeAll({ ...state, loading: { detail: true } })
  ),
  on(stateAction.loadSuccess, (state, action) =>
    adDetailEntityAdapter.upsertOne(action.payload, {
      ...state,
      loading: {},
    })
  ),
  on(stateAction.error, (state) => ({
    ...state,
    loading: {},
  }))
);

export const adDetailReducerFn = (state, action): AdDetailStateModel =>
  adDetailReducer(state, action);
