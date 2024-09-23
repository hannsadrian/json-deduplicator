declare module "json-deduplicator" {
  export interface DeduplicationOptions {
    alwaysReplaceWithId?: boolean;
  }

  export interface DeduplicationResult {
    database: { [key: string]: any };
    data: any;
  }

  export function deduplicate(
    obj: object | any[],
    options?: DeduplicationOptions
  ): DeduplicationResult;
}
