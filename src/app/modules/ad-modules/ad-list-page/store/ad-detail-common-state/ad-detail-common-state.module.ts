import { NgModule } from '@angular/core';
import { provideEffects } from '@ngrx/effects';
import { provideState } from '@ngrx/store';
import { AdDetailEffect } from './ad-detail-state/ad-detail.effect';
import { AdDetailFacade } from './ad-detail-state/ad-detail.facade';
import {
  AD_DETAIL_COMMON_STATE_KEY,
  adDetailCommonActionReducerMap,
} from './common/ad-detail-common.model';

@NgModule({
  providers: [
    provideState(AD_DETAIL_COMMON_STATE_KEY, adDetailCommonActionReducerMap),
    provideEffects([AdDetailEffect]),
    AdDetailFacade,
  ],
})
export class AdDetailCommonStateModule {}
