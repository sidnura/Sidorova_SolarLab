import { Injectable } from '@angular/core';
import { Store } from '@ngrx/store';
import { Observable } from 'rxjs';
import { AdModel } from '@models/ad.model';
import * as stateAction from './ad-detail.action';
import * as stateSelector from './ad-detail.selector';

@Injectable()
export class AdDetailFacade {
  public elements$: Observable<AdModel | null> = this.store.select(
    stateSelector.getElement
  );
  public loading$: Observable<Record<string, boolean>> = this.store.select(
    stateSelector.getLoading
  );
  public hasData$: Observable<boolean> = this.store.select(
    stateSelector.getHasData
  );

  constructor(private readonly store: Store) {}

  public load(payload: string): void {
    this.store.dispatch(stateAction.load({ payload }));
  }
}
