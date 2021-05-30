import { EventEmitter } from 'events';
let workQueue: (() => any)[] = [];
let controller = new EventEmitter();
export default function handleWork(func: () => any): void {
    workQueue.push(func);
    if (workQueue.length == 1) {
        controller.emit('run-work');
    }
}
controller.on('run-work', async () => {
    let fn = workQueue.shift();
    if (fn !== undefined) {
        await fn();
        controller.emit('run-work');
    }
    return;
});