const errorMsgs: string[] = [
  'Incorrect key', // code 0
  'Invalid key', // code 1
  "The disk doesn't exists", // code 2
  'Error reading the disk', // code 3
  'Error writing the disk', // code 4
  'Error creating the disk', // code 5
  "Error, the element doesn't exists", // code 6
  'Error, the element already exists', // code 7
  'The name already exists', // code 8
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
