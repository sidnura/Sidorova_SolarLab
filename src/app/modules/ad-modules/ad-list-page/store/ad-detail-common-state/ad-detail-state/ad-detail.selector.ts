import { createSelector } from '@ngrx/store';
import { getAdDetailCommonState } from '../common/ad-detail-common.selector';
import { AD_DETAIL_STATE_KEY, adDetailEntityAdapter } from './ad-detail.model';

const getState = createSelector(
  getAdDetailCommonState,
  (state) => state[AD_DETAIL_STATE_KEY]
);

const { selectAll } = adDetailEntityAdapter.getSelectors();

export const getElement = createSelector(getState, (state) => selectAll(state)[0] || null);
export const getLoading = createSelector(getState, (state) => state.loading);
