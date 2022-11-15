# qpt-container Disk docs

_@Project qpt-container_

_@Author Guillex387_

---

# Low level Disk

## Block

Block, is the basic unit in the disk, and it has 3 parts:

- Length: is an 8 bytes number which indicates the length of the data in the block.
- Data: is fixed size (Default 4000 bytes) binary data part.
- Pointer: is an 8 bytes number which indicates the id of next block. (0 is the Null_id).

![Frame 1(2).svg](<qpt-container%20Disk%20docs%20cbb2f5768712442b9a2eae8517c85888/Frame_1(2).svg>)

### Block types

In the disk exists 2 special blocks, the registry block and the reserved block:

- The registry block contains the id of blocks that are free for use it in the future, this are saved here when someone remove data. (id = 0). In this block are saved all free blocks id.
- The reserved block contains the root folder of the file system. (id = 1). In this are saved the root of the file system.

## Structure

The disks are divided in two general parts:

- The **Header** with a 8 bytes number who indicates the size of the header object, and the header object that is the general metadata.
- The **Block Array** which contains all the blocks of the disk.

![Frame 2(1).svg](<qpt-container%20Disk%20docs%20cbb2f5768712442b9a2eae8517c85888/Frame_2(1).svg>)

---

# File System (high level)

## File

The file is the basic unit of the file system, and it is a binary stored in 1 or more blocks, which are connected with the pointer making a linked list:

![Frame 3.svg](qpt-container%20Disk%20docs%20cbb2f5768712442b9a2eae8517c85888/Frame_3.svg)

Each file has two parts:

- Metadata, that is some information of the file, name, size, ...
- Data, which is the content of the file.

This parts are in different blocks, in the main block is stored a 8 bytes indicatior with the ID of the metadata block and in the rest the data of the file.

## Folder

The folder is a file with an specific content format, which are a map of a hash and a block id:

![Frame 4.svg](qpt-container%20Disk%20docs%20cbb2f5768712442b9a2eae8517c85888/Frame_4.svg)

- Hash: is obtained hashing the name of the file, with SHA-256.
- Initial Block: is the initial block of the file in the disk.

## Encryption algorithm

The algorithm for encrypt the files are AES-256.

---

# Metadata

- Disk Metadata, is a json that contains some useful properties of the disk:
  ```json
  {
    "fragment-size": 4000, // Default
    "name": "some name",
    "encrypted": true, // Default
    "opt": {}
  }
  ```
- File Metadata, is a json that contains some useful properties of the file:
  ```json
  {
    "name": "filename.extension",
    "size": 800,
    "type": "file", // or "folder"
    "opt": {}
  }
  ```
