export function UIntToBuffer(n: number) {
  let buf = Buffer.alloc(8);
  buf.writeBigUInt64BE(BigInt(n), 0);
  return buf;
}

export function BufferToUInt(b: Buffer) {
  let n = b.readBigUInt64BE(0);
  return Number(n);
}
