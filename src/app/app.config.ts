import { ApplicationConfig, isDevMode, importProvidersFrom } from '@angular/core';
import { provideRouter } from '@angular/router';

import { routes } from './app.routes';
import { provideAnimationsAsync } from '@angular/platform-browser/animations/async';
import {provideHttpClient, withFetch} from "@angular/common/http";
import { provideServiceWorker } from '@angular/service-worker';
import {SocketIoConfig, SocketIoModule} from "ngx-socket-io";
import {environment} from "../environments/environment";
import {
  GoogleLoginProvider,
  SocialAuthService,
  SocialAuthServiceConfig,
  SocialLoginModule
} from "@abacritt/angularx-social-login";
import {GOOGLE_CLIENT_ID} from "../definitions";
import {MAT_DIALOG_DATA} from "@angular/material/dialog";

const config: SocketIoConfig = { url: environment.server, options: {} };


export const appConfig: ApplicationConfig = {
  providers: [
    {provide: MAT_DIALOG_DATA, useValue: {hasBackdrop: false}},
    provideHttpClient(withFetch()),
    provideRouter(routes),
    provideAnimationsAsync(),
    provideServiceWorker('ngsw-worker.js', {
        enabled: !isDevMode(),
        registrationStrategy: 'registerWhenStable:30000'
    }),
    importProvidersFrom(
      SocketIoModule.forRoot(config),
      SocialLoginModule,
    ),
    {
      provide: 'SocialAuthServiceConfig',
      useValue: {
        autoLogin: false,
        providers: [{id: GoogleLoginProvider.PROVIDER_ID,provider: new GoogleLoginProvider(GOOGLE_CLIENT_ID)}],
        onError: (err) => {
          console.error(err);
        },
      } as SocialAuthServiceConfig
    },
  ],

};
