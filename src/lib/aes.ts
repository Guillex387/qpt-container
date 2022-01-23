import crypto from 'crypto';
import Error from './error';

class AES {
  private static formatSymKey(symKey: string): Buffer {
    if (symKey.length > 32) {
      throw new Error(1);
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
    const symKey = AES.formatSymKey(pass);
    const iv = crypto.randomBytes(16);
    let cipher = crypto.createCipheriv('aes-256-cbc', symKey, iv);
    return Buffer.concat([iv, cipher.update(buff), cipher.final()]);
  }

  public static decrypt(bufEnc: Buffer, pass: string): Buffer {
    const symKey = AES.formatSymKey(pass);
    const iv = bufEnc.slice(0, 16);
    const dataEnc = bufEnc.slice(16);
    let decipher = crypto.createDecipheriv('aes-256-cbc', symKey, iv);
    try {
      return Buffer.concat([decipher.update(dataEnc), decipher.final()]);
    } catch (err) {
      throw new Error(0);
    }
  }
}

export default AES;