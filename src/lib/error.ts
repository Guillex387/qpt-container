export default abstract class Error {
  public type: string;
  public message: string;
}
export abstract class DiskError extends Error {
  public type: string = 'Disk Error';
}
export abstract class EncryptionError extends Error {
  public type: string = 'Encryption Error';
}
export class IncorrectKey extends EncryptionError {
  constructor() {
    super();
    this.message = 'Incorrect key';
  }
}
export class InvalidKey extends EncryptionError {
  constructor() {
    super();
    this.message = 'Invalid key';
  }
}
export class DiskDontExists extends DiskError {
  constructor() {
    super();
    this.message = "The disk doesn't exists";
  }
}
export class DiskReadError extends DiskError {
  constructor() {
    super();
    this.message = 'Error reading the disk';
  }
}
export class DiskWriteError extends DiskError {
  constructor() {
    super();
    this.message = 'Error writing the disk';
  }
}
export class DiskCreateError extends DiskError {
  constructor() {
    super();
    this.message = 'Error creating the disk';
  }
}
export class ItemDontExists extends DiskError {
  constructor() {
    super();
    this.message = "The element doesn't exists";
  }
}
export class ItemAlreadyExists extends DiskError {
  constructor() {
    super();
    this.message = 'The element already exists';
  }
}
