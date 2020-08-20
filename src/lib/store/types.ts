export type ReducerEvent<T, D> = {
  payload: T;
  type: D;
};

export type Reducer<T> = (state: T, event: ReducerEvent<any, string>) => T;

export type ComingEventValue = {
  aggregateId: string;
  type: string;
  data: any;
};

export type Snapshot = {
  offset: string;
  data: any;
  snapId: string;
};
