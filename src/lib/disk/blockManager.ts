import Block from './block';
import DiskInterface from './diskInterface';

class BlockManager {
  private registryBlock: Block;
  public disk: DiskInterface;

  private getFreeBlocks(n: number): Block[] {
    // TODO
  }
  private addFreeBlocks(blocks: Block[]) {
    // TODO
  }

  readData(initBlock: Block, offset?: number, length?: number) {
    let dataParts: Buffer[] = initBlock.array().map(b => b.dataFrame);
    let buffer = Buffer.concat(dataParts);
    if (offset && length) return buffer.slice(offset, offset + length);
    if (offset) return buffer.slice(offset);
    return buffer;
  }

  writeData(data: Buffer, initBlock?: Block) {
    // TODO
  }

  constructor(disk: DiskInterface) {
    this.disk = disk;
    this.registryBlock = new Block(0, this.disk);
  }
}

export default BlockManager;
