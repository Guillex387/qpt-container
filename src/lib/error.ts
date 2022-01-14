const errorMsgs: string[] = [
  'Incorrect key',
  'Invalid key',
  "Disk doesn't exists",
  'Error reading the disk',
  'Error modifying the disk',
];

class Error {
  public code: number;
  public msg: string;
  constructor(code: number) {
    this.code = code;
    if (code >= errorMsgs.length) this.msg = 'Unknow error';
    else this.msg = errorMsgs[code];
  }
}

export default Error;
