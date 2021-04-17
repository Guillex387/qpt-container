import crypto from 'crypto';
import errors from './errors';
export default class Encryptor {
    private static formatSymKey(symKey: string): Buffer {
        if(symKey.length > 32){
            throw errors.encrypter[1];
        }
        let formatKey = '';
        let loops = 32 - symKey.length;
        if(loops !== 0){
            for(let i = 0; i < loops; i++){
                formatKey += '0';
            }
        }
        formatKey += symKey;
        return Buffer.from(formatKey, 'utf-8'); 
    }
    public static encrypt(buff: Buffer, pass: string): Buffer {
        const symKey = Encryptor.formatSymKey(pass);
        const iv = crypto.randomBytes(16);
        let cipher = crypto.createCipheriv('aes-256-cbc', symKey, iv);
        return Buffer.concat([iv, cipher.update(buff), cipher.final()]);
    }
    public static decrypt(bufEnc: Buffer, pass: string): Buffer {
        const symKey = Encryptor.formatSymKey(pass);
        const iv = bufEnc.slice(0, 16);
        const dataEnc = bufEnc.slice(16);
        let decipher = crypto.createDecipheriv('aes-256-cbc', symKey, iv);
        try {
            return Buffer.concat([decipher.update(dataEnc), decipher.final()]);
        } catch (err) {
            throw errors.encrypter[0];
        }
    }
    public static verifyPass(pass: string): boolean {
        if(pass.length > 32){
            return false;
        }
        return true;
    }
}