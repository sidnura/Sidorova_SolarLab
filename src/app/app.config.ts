import { provideHttpClient, withInterceptors } from '@angular/common/http';
import { ApplicationConfig, provideZoneChangeDetection } from '@angular/core';
import {
  PreloadAllModules,
  provideRouter,
  withDebugTracing,
  withPreloading,
} from '@angular/router';
import { provideEffects } from '@ngrx/effects';
import { provideStore } from '@ngrx/store';
import { provideStoreDevtools } from '@ngrx/store-devtools';
import { authInterceptor } from './core/interceptors/auth.interceptor';
import routes from './routes';

export const appConfig: ApplicationConfig = {
  providers: [
    provideZoneChangeDetection({ eventCoalescing: true }),
    provideRouter(
      routes,
      withPreloading(PreloadAllModules),
     // withDebugTracing()
    ),
    provideHttpClient(withInterceptors([authInterceptor])),
    provideStore(),
    provideEffects([]),
    provideStoreDevtools({
      maxAge: 30,
    }),
  ],
};
