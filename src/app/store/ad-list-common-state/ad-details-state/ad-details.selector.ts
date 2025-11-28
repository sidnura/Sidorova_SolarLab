import { createSelector } from '@ngrx/store';
import { getAdListCommonState } from '../common/ad-list-common.selector';
import { AD_DETAILS_STATE_KEY } from './ad-details.model';
import { isNil } from 'lodash';

const getState = createSelector(
  getAdListCommonState,
  (state) => state[AD_DETAILS_STATE_KEY]
);

export const getElement = createSelector(getState, (state) => state.data);
export const getLoading = createSelector(getState, (state) => state.loading);
export const getHasData = createSelector(
  getState,
  (state) => !isNil(state.data) && !state.loading['read']
);
