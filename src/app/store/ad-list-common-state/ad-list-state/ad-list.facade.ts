import { Injectable } from '@angular/core';
import { Store } from '@ngrx/store';
import { Observable } from 'rxjs';
import { AdModel, AdSearchRequestModel } from '../../../core/models/ad.model';
import * as stateAction from './ad-list.action';
import * as stateSelector from './ad-list.selector';

@Injectable()
export class AdListFacade {
  public elements$: Observable<AdModel[]> = this.store.select(
    stateSelector.getElements
  );
  public loading$: Observable<Record<string, boolean>> = this.store.select(
    stateSelector.getLoading
  );

  constructor(private readonly store: Store) {}

  public load(filterRequest: AdSearchRequestModel): void {
    this.store.dispatch(stateAction.load({ payload: filterRequest }));
  }
}
