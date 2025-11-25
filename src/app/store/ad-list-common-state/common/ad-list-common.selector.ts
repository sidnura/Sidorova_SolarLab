import { createFeatureSelector } from '@ngrx/store';
import {
  AD_LIST_COMMON_STATE_KEY,
  AdListCommonStateModel,
} from './ad-list-common.model';

export const getAdListCommonState =
  createFeatureSelector<AdListCommonStateModel>(AD_LIST_COMMON_STATE_KEY);
