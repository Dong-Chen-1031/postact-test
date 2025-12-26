export class LocalStorageInterface {
  public key: string;

  constructor(key: string) {
    this.key = key;
  }

  set(value: string) {}
}

export function localStorage(key: string): LocalStorageInterface {
  return new LocalStorageInterface(key);
}
