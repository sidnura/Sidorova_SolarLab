import { createReducer, on } from '@ngrx/store';
import * as stateAction from './ad-details.action';
import { AdDetailsStateModel, initialState } from './ad-details.model';

const adDetailsReducer = createReducer<AdDetailsStateModel>(
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

export const adDetailsReducerFn = (state, action): AdDetailsStateModel =>
  adDetailsReducer(state, action);
