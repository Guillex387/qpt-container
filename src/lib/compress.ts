import zlib from 'zlib';
export default class Compressor {
    public static compress(buff: Buffer): Buffer {
        let compressBuff: Buffer = zlib.deflateRawSync(buff);
        return compressBuff;
    }
    public static deCompress(buff: Buffer): Buffer {
        let deCompressBuff: Buffer = zlib.inflateRawSync(buff);
        return deCompressBuff;
    }
}