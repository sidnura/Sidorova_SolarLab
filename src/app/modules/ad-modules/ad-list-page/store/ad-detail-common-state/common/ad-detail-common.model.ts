import { ActionReducerMap } from '@ngrx/store';
import {
  AD_DETAIL_STATE_KEY,
  AdDetailStateModel,
} from '../ad-detail-state/ad-detail.model';
import { adDetailReducerFn } from '../ad-detail-state/ad-detail.reducer';

export const AD_DETAIL_COMMON_STATE_KEY = 'ad-detail-common-state';

export type AdDetailCommonStateModel = {
  [AD_DETAIL_STATE_KEY]: AdDetailStateModel;
};

export const adDetailCommonActionReducerMap: ActionReducerMap<AdDetailCommonStateModel> =
  {
    [AD_DETAIL_STATE_KEY]: adDetailReducerFn,
  };
