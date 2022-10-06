import { writable } from 'svelte/store';
import { disksData } from './controllers/disksManager';
import DiskFileSystem from './lib/disk/diskFileSystem';

// App
export let page = writable('home');
// Disk manager
export let disks = writable(disksData());
export const reloadDisksData = () => {
  disks.set(disksData());
};
// File system
export let loadedDisk = writable<DiskFileSystem | null>(null);
export let loadedDiskWorkPath = writable<string[] | null>(null);
// Previewer | Text editor
export let fileState = writable<{ name: string; content: Buffer }>({ name: 'Default', content: Buffer.alloc(0) });
export let saveCb = writable<(content: Buffer) => void>(() => null);
