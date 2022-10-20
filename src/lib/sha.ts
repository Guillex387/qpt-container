import { createHash } from 'crypto';

class SHA {
  static HASH_SIZE = 32;

  static hash(input: string): Buffer {
    let inputBuffer = Buffer.from(input, 'utf-8');
    return createHash('sha256').update(inputBuffer).digest();
  }
}

export default SHA;
