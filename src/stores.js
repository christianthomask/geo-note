import { writable } from 'svelte/store';

export const userLoc = writable({});
export const posts = writable({});
export const notifPerm = writable('unset');
export const feedState = writable('unset');
export const cos = writable('unset');