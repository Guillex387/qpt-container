import { writable } from 'svelte/store';
import { disksData } from './controllers/disksManager';

export let page = writable('home');
export let disks = writable(disksData());
