import { createSelector } from '@ngrx/store';
import { getAdListCommonState } from '../common/ad-list-common.selector';
import { AD_LIST_STATE_KEY, adListEntityAdapter } from './ad-list.model';

const getState = createSelector(
  getAdListCommonState,
  (state) => state[AD_LIST_STATE_KEY]
);

const { selectAll } = adListEntityAdapter.getSelectors();

export const getElements = createSelector(getState, selectAll);
export const getLoading = createSelector(getState, (state) => state.loading);
