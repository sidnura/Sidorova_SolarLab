import { NgModule } from '@angular/core';
import { provideEffects } from '@ngrx/effects';
import { provideState } from '@ngrx/store';
import { AdListEffect } from './ad-list-state/ad-list.effect';
import { AdListFacade } from './ad-list-state/ad-list.facade';
import {
  AD_LIST_COMMON_STATE_KEY,
  adListCommonActionReducerMap,
} from './common/ad-list-common.model';

@NgModule({
  providers: [
    provideState(AD_LIST_COMMON_STATE_KEY, adListCommonActionReducerMap),
    provideEffects([AdListEffect]),
    AdListFacade
  ],
})
export class AdListCommonStateModule {}
