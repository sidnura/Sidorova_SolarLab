import { createFeatureSelector } from '@ngrx/store';
import {
  AD_DETAIL_COMMON_STATE_KEY,
  AdDetailCommonStateModel,
} from './ad-detail-common.model';

export const getAdDetailCommonState =
  createFeatureSelector<AdDetailCommonStateModel>(AD_DETAIL_COMMON_STATE_KEY);
