import { writable } from 'svelte/store';
import { disksData } from './controllers/disksManager';
import DiskFileSystem from './lib/disk/diskFileSystem';

export let page = writable('home');
export let disks = writable(disksData());
export let loadedDisk = writable<DiskFileSystem | null>(null);
export let loadedDiskWorkPath = writable<string[] | null>(null);
