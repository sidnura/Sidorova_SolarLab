import { createReducer, on } from '@ngrx/store';
import * as stateAction from './ad-detail.action';
import { AdDetailStateModel, initialState } from './ad-detail.model';

const adDetailReducer = createReducer<AdDetailStateModel>(
  initialState,
  on(stateAction.load, (state, action) => ({
    ...state,
    loading: { read: true },
    selectedId: action.payload,
  })),
  on(stateAction.loadSuccess, (state, action) => ({
    ...state,
    data: action.payload,
    loading: {},
  })),
  on(stateAction.error, (state) => ({
    ...state,
    ...initialState,
  })),
  on(stateAction.clear, () => ({ ...initialState }))
);

export const adDetailReducerFn = (state, action): AdDetailStateModel =>
  adDetailReducer(state, action);
