export function UIntToBuffer(n: number) {
  let buf = Buffer.alloc(8);
  buf.writeBigUInt64BE(BigInt(n), 0);
  return buf;
}

export function BufferToUInt(b: Buffer) {
  let n = b.readBigUInt64BE(0);
  return Number(n);
}

export function BufferToUIntList(b: Buffer) {
  let list: number[] = [];
  for (let i = 0; i < b.length; i += 8) {
    let n = b.readBigUInt64BE(i);
    list.push(Number(n));
  }
  return list;
}

export function UIntListToBuffer(l: number[]) {
  return Buffer.concat(l.map(n => UIntToBuffer(n)));
}
