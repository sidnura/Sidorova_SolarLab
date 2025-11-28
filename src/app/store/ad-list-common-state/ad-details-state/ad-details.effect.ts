import { Injectable } from '@angular/core';
import { Actions, createEffect, ofType } from '@ngrx/effects';
import { HttpClient } from '@angular/common/http';
import { of } from 'rxjs';
import { catchError, map, switchMap } from 'rxjs/operators';
import { AdModel } from '@models/ad.model';
import * as stateAction from './ad-details.action';

@Injectable()
export class AdDetailsEffect {
  load$ = createEffect(() =>
    this.actions$.pipe(
      ofType(stateAction.load),
      switchMap(({ payload }) =>
        this.http.get<AdModel>(`api/Advert/${payload}`).pipe(
          map((ad) => stateAction.loadSuccess({ payload: ad })),
          catchError(() => of(stateAction.error()))
        )
      )
    )
  );

  constructor(
    private actions$: Actions,
    private http: HttpClient
  ) {}
}
