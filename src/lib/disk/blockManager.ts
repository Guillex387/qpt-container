import { BufferToUInt, UIntToBuffer } from '../../utils/binNums';
import Block, { RegistryBlock } from './block';
import DiskInterface from './diskInterface';

class BlockManager {
  private initRegistryBlock: RegistryBlock;
  public disk: DiskInterface;

  private getFreeBlock(): Block {
    let registryBuffer = this.readData(this.initRegistryBlock);
    if (!registryBuffer.length) return Block.create(this.disk);
    let registrySlice = registryBuffer.slice(0, registryBuffer.length - 8);
    let blockIdBuffer = registryBuffer.slice(registryBuffer.length - 8);
    this.writeData(registrySlice, this.initRegistryBlock);
    return new Block(BufferToUInt(blockIdBuffer), this.disk);
  }

  private addFreeBlocks(blocks: Block[]) {
    let blocksBuffer = Buffer.concat(blocks.map(b => UIntToBuffer(b.id)));
    this.appendData(blocksBuffer, this.initRegistryBlock);
  }

  readData(initBlock: Block, offset?: number, length?: number) {
    let blockArray = initBlock.array();
    let realOffset = offset % initBlock.realFragmentSize;
    let blockOffset = Math.floor(offset / initBlock.realFragmentSize);
    let blockCount = Math.floor(length / initBlock.realFragmentSize) + 1;
    if (offset) blockArray = blockArray.slice(blockOffset);
    if (length) blockArray = blockArray.slice(0, blockOffset + blockCount);
    blockArray = blockArray.slice(blockOffset, blockOffset + blockCount);
    let data = Buffer.concat(blockArray.map(block => block.dataFrame));
    if (offset) data = data.slice(realOffset);
    if (length) data = data.slice(0, realOffset + length);
    return data;
  }

  writeData(data: Buffer, initBlock?: Block) {
    let registry = initBlock instanceof RegistryBlock;
    let getBlock = () => (registry ? Block.create(this.disk, registry) : this.getFreeBlock());
    let blockArray: Block[] = initBlock ? initBlock.array() : [getBlock()];
    let dataOffset: number = 0;
    let lastBlockWrited: Block | null = null;
    while (true) {
      let currentBlock = blockArray.shift();
      if (!currentBlock) currentBlock = getBlock();
      if (lastBlockWrited) lastBlockWrited.next = currentBlock;
      currentBlock.dataFrame = data.slice(dataOffset, dataOffset + initBlock.realFragmentSize);
      dataOffset += initBlock.realFragmentSize;
      lastBlockWrited = currentBlock;
      if (dataOffset >= data.length) {
        currentBlock.next = null;
        break;
      }
    }
    if (blockArray.length !== 0) this.addFreeBlocks(blockArray);
    return initBlock;
  }

  appendData(data: Buffer, initBlock: Block) {
    let lastBlock = initBlock.array().pop();
    let lengthForWrite = initBlock.realFragmentSize - lastBlock.realLength();
    let dataFragment1 = data.slice(0, lengthForWrite);
    let dataFragment2 = data.slice(lengthForWrite);
    if (dataFragment1.length) lastBlock.dataFrame = Buffer.concat([lastBlock.dataFrame, dataFragment1]);
    if (dataFragment2.length) {
      let extraInitBlock = this.writeData(dataFragment2, undefined);
      lastBlock.next = extraInitBlock;
    }
  }

  removeData(initBlock: Block) {
    this.addFreeBlocks(initBlock.array());
  }

  constructor(disk: DiskInterface) {
    this.disk = disk;
    this.initRegistryBlock = new RegistryBlock(0, this.disk);
  }
}

export default BlockManager;
