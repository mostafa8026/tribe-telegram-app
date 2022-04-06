import { DynamicModule, Inject, Logger, Module } from '@nestjs/common';
import { TribeAsyncOption, TribeOption } from './config/tribe-options';
import { TRIBE_OPTION } from './constants/tribe.constants';
import { TribeService } from './tribe.service';
import { TribeClient } from '@tribeplatform/gql-client';

@Module({})
export class TribeModule {
  public static forRoot(tribeOption: TribeOption): DynamicModule {
    if (!tribeOption.graphqlUrl) {
      // provide a default value
      tribeOption.graphqlUrl = 'https://app.tribe.so/graphql';
    }
    return {
      module: TribeModule,
      providers: [
        Logger,
        {
          provide: TRIBE_OPTION,
          useValue: tribeOption,
        },
        TribeService,
        {
          provide: TribeClient,
          useFactory: (option: TribeOption) => {
            return new TribeClient({
              clientId: option.clientId,
              clientSecret: option.clientSecret,
              graphqlUrl: option.graphqlUrl,
              onError: (errors, client, error) => {
                console.log(errors);
                console.log(client);
                console.log(error);
              },
            });
          },
          inject: [TRIBE_OPTION],
        },
      ],
      exports: [TribeService],
    };
  }

  public static forRootAsync(
    tribeAsyncOption: TribeAsyncOption
  ): DynamicModule {
    return {
      module: TribeModule,
      imports: tribeAsyncOption.imports,
      providers: [
        Logger,
        TribeService,
        {
          provide: TRIBE_OPTION,
          useFactory: tribeAsyncOption.useFactory,
          inject: tribeAsyncOption.inject,
        },
        {
          provide: TribeClient,
          useFactory: (option: TribeOption) => {
            return new TribeClient({
              clientId: option.clientId,
              clientSecret: option.clientSecret,
              graphqlUrl: option.graphqlUrl,
            });
          },
          inject: [TRIBE_OPTION],
        },
      ],
      exports: [TribeService],
    };
  }
}
