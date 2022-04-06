import { ModuleMetadata } from '@nestjs/common';

export interface TribeOption {
  clientId: string;
  clientSecret: string;
  signingSecret: string;
  networkId: string;
  memberId: string;
  // We provide a default value, but the end-user may want to change it, especially Siavash :)
  graphqlUrl?: string;
}

export interface TribeAsyncOption extends Pick<ModuleMetadata, 'imports'> {
  inject?: any[];
  useFactory?: (...args: any[]) => Promise<TribeOption> | TribeOption;
}
