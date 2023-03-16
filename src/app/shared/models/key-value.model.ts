export class KeyValueModel {
  key: string;
  value: any;

  constructor(init?: Partial<KeyValueModel>) {
    Object.assign(this, init);
  }
}
