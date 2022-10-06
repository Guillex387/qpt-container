import { BufferToUInt, UIntToBuffer } from '../../utils/binNums';
import Block from './block';
import DiskInterface from './diskInterface';

class BlockManager {
  private registryBlock: Block;
  public disk: DiskInterface;

  private getFreeBlock(): Block {
    let registryBuffer = this.readData(this.registryBlock);
    if (!registryBuffer.length) return Block.create(this.disk);
    let registrySlice = registryBuffer.slice(0, registryBuffer.length - 8);
    let blockIdBuffer = registryBuffer.slice(registryBuffer.length - 8);
    this.writeData(registrySlice, this.registryBlock, true);
    return new Block(BufferToUInt(blockIdBuffer), this.disk);
  }

  private addFreeBlocks(blocks: Block[]) {
    let blocksBuffer = Buffer.concat(blocks.map(b => UIntToBuffer(b.id)));
    let registryData = this.readData(this.registryBlock);
    this.writeData(Buffer.concat([registryData, blocksBuffer]), this.registryBlock, true);
  }

  readData(initBlock: Block) {
    let dataParts: Buffer[] = initBlock.array().map(b => b.dataFrame);
    return Buffer.concat(dataParts);
  }

  writeData(data: Buffer, initBlock?: Block, registry: boolean = false) {
    let blockArray: Block[] = initBlock ? initBlock.array() : [this.getFreeBlock()];
    let dataOffset: number = 0;
    let lastBlockWrited: Block | null = null;
    while (true) {
      let currentBlock = blockArray.shift();
      if (!currentBlock) currentBlock = registry ? Block.create(this.disk) : this.getFreeBlock();
      if (lastBlockWrited) lastBlockWrited.next = currentBlock;
      currentBlock.dataFrame = data.slice(dataOffset, dataOffset + this.disk.BLOCK_DATA_SIZE);
      dataOffset += this.disk.BLOCK_DATA_SIZE;
      lastBlockWrited = currentBlock;
      if (dataOffset >= data.length) {
        currentBlock.next = null;
        break;
      }
    }
    if (blockArray.length !== 0) this.addFreeBlocks(blockArray);
    return initBlock;
  }

  removeData(initBlock: Block) {
    this.addFreeBlocks(initBlock.array());
  }

  constructor(disk: DiskInterface) {
    this.disk = disk;
    this.registryBlock = new Block(0, this.disk);
  }
}

export default BlockManager;
