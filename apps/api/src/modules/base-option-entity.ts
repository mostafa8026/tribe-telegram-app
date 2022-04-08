import { Column } from 'typeorm';

export interface QueryOption {
  pageAction?: string;
  message?: string;
  options?: Record<string, any>;
}

export abstract class BaseOptionEntity {
  // NOTE: in mssql, you have to provide latin collation for simple-json
  @Column('simple-json', { nullable: true })
  pageOptions: QueryOption;
}
