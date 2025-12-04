import { HttpClient } from '@angular/common/http';
import { Injectable } from '@angular/core';
import { Actions, createEffect, ofType } from '@ngrx/effects';
import { of } from 'rxjs';
import { catchError, map, switchMap } from 'rxjs/operators';
import { AdModel, AdSearchRequestModel } from '../../../core/models/ad.model';
import * as stateAction from './ad-list.action';

@Injectable()
export class AdListEffect {
  load$ = createEffect(() =>
    this.action$.pipe(
      ofType(stateAction.load),
      switchMap((action) => {
        const searchParams: AdSearchRequestModel = {
          sortBy: 'createdAt',
          sortOrder: 'desc',
          ...action.payload,
        };

        return this.http
          .post<AdModel[]>('api/Advert/search', searchParams)
          .pipe(
            map((response) => {
              return stateAction.loadSuccess({ payload: response });
            }),
            catchError((error) => {
              return of(stateAction.error());
            })
          );
      })
    )
  );

  constructor(
    private readonly http: HttpClient,
    private readonly action$: Actions
  ) {}
}
