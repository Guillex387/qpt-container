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
    this.appendData(blocksBuffer, this.registryBlock, true);
  }

  readData(initBlock: Block, offset?: number, length?: number) {
    let blockArray = initBlock.array();
    let realOffset = offset % this.disk.BLOCK_DATA_SIZE;
    let blockOffset = Math.floor(offset / this.disk.BLOCK_DATA_SIZE);
    let blockCount = Math.floor(length / this.disk.BLOCK_DATA_SIZE) + 1;
    if (offset) blockArray = blockArray.slice(blockOffset);
    if (length) blockArray = blockArray.slice(0, blockOffset + blockCount);
    blockArray = blockArray.slice(blockOffset, blockOffset + blockCount);
    let data = Buffer.concat(blockArray.map(block => block.dataFrame));
    if (offset) data = data.slice(realOffset);
    if (length) data = data.slice(0, realOffset + length);
    return data;
  }

  writeData(data: Buffer, initBlock?: Block, registry: boolean = false) {
    let getBlock = () => (registry ? Block.create(this.disk) : this.getFreeBlock());
    let blockArray: Block[] = initBlock ? initBlock.array() : [getBlock()];
    let dataOffset: number = 0;
    let lastBlockWrited: Block | null = null;
    while (true) {
      let currentBlock = blockArray.shift();
      if (!currentBlock) currentBlock = getBlock();
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

  appendData(data: Buffer, initBlock: Block, registry: boolean = false) {
    let lastBlock = initBlock.array().pop();
    let appendInit = this.writeData(data, undefined, registry);
    lastBlock.next = appendInit;
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
