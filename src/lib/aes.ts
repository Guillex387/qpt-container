import { IncorrectKey, InvalidKey } from './error';
import nodeCrypto from 'crypto';

class AES {
  public static extraBytes: number = 32;

  private static formatSymKey(symKey: string): Buffer {
    if (symKey.length > 32) {
      throw new InvalidKey();
    }
    let remaining = '0'.repeat(32 - symKey.length);
    let formatKey = remaining + symKey;
    return Buffer.from(formatKey, 'utf-8');
  }

  public static verifyPassFormat(pass: string): boolean {
    if (pass.length > 32) {
      return false;
    }
    return true;
  }

  public static encrypt(buff: Buffer, pass: string): Buffer {
    if (!this.verifyPassFormat(pass)) throw new InvalidKey();
    const symKey = AES.formatSymKey(pass);
    const iv = nodeCrypto.randomBytes(16);
    let cipher = nodeCrypto.createCipheriv('aes-256-cbc', symKey, iv);
    return Buffer.concat([iv, cipher.update(buff), cipher.final()]);
  }

  public static decrypt(bufEnc: Buffer, pass: string): Buffer {
    if (!this.verifyPassFormat(pass)) throw new InvalidKey();
    const symKey = AES.formatSymKey(pass);
    const iv = bufEnc.slice(0, 16);
    const dataEnc = bufEnc.slice(16);
    try {
      let decipher = nodeCrypto.createDecipheriv('aes-256-cbc', symKey, iv);
      return Buffer.concat([decipher.update(dataEnc), decipher.final()]);
    } catch (err) {
      throw new IncorrectKey();
    }
  }
}

export default AES;
