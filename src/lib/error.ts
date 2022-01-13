const errorMsgs: string[] = ['Incorrect key', 'Invalid key'];

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
