import { createAction, props } from '@ngrx/store';
import { AD_DETAIL_STATE_KEY } from './ad-detail.model';
import { AdModel } from '../../../../../../core/models/ad.model';

export const load = createAction(
  `[${AD_DETAIL_STATE_KEY}] load`,
  props<{ payload: string }>()
);

export const loadSuccess = createAction(
  `[${AD_DETAIL_STATE_KEY}] load success`,
  props<{ payload: AdModel }>()
);

export const error = createAction(`[${AD_DETAIL_STATE_KEY}] error`);
