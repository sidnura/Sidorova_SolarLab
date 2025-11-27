import { createSelector } from '@ngrx/store';
import { getAdDetailCommonState } from '../common/ad-detail-common.selector';
import { AD_DETAIL_STATE_KEY } from './ad-detail.model';
import { isNil } from 'lodash';

const getState = createSelector(
  getAdDetailCommonState,
  (state) => state[AD_DETAIL_STATE_KEY]
);

export const getElement = createSelector(getState, (state) => state.data);
export const getLoading = createSelector(getState, (state) => state.loading);
export const getHasData = createSelector(
  getState,
  (state) => !isNil(state.data) && !state.loading['read']
);
