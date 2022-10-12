import { createHash } from 'crypto';

class SHA {
  static HASH_SIZE = 32;

  static hash(input: Buffer): Buffer {
    return createHash('sha256').update(input).digest();
  }
}

export default SHA;
