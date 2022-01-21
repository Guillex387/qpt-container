const errorMsgs: string[] = [
  'Incorrect key',
  'Invalid key',
  "The disk doesn't exists",
  'Error reading the disk',
  'Error writing the disk',
  'Error creating the disk',
  "Error, the element doesn't exists",
  'Error, the element already exists',
];

class Error {
  public code: number;
  public message: string;
  constructor(code: number) {
    this.code = code;
    if (code >= errorMsgs.length) this.message = 'Unknow error';
    else this.message = errorMsgs[code];
  }
}

export default Error;
