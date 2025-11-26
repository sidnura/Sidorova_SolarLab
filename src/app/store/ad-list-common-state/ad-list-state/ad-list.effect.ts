import { HttpClient } from '@angular/common/http';
import { Injectable } from '@angular/core';
import { Actions, createEffect, ofType } from '@ngrx/effects';
import { map, switchMap } from 'rxjs';
import { AdModel } from '../../../core/models/ad.model';
import * as stateAction from './ad-list.action';

@Injectable()
export class AdListEffect {
  load = createEffect(() =>
    this.action$.pipe(
      ofType(stateAction.load),
      switchMap((action) => {
        return this.http
          .post<AdModel[]>('api/Advert/search', action.payload)
          .pipe(
            map((response) => stateAction.loadSuccess({ payload: response }))
          );
      })
    )
  );

  constructor(
    private readonly http: HttpClient,
    private readonly action$: Actions
  ) {}
}
