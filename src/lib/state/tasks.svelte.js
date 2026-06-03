import { Task } from './task.svelte';

export class Tasks {
	tasks = $state([]);
	top = $derived(this.tasks[0] ?? null);
	isEmpty = $derived(this.tasks.length === 0);

	#load() {
		const saved = localStorage.getItem('tasks');
		return saved ? JSON.parse(saved).map(Task.fromJSON) : [];
	}

	#save() {
		localStorage.setItem('tasks', JSON.stringify(this.tasks));
	}

	push(data) {
		this.tasks.unshift(data instanceof Task ? data : new Task(data));
		this.#save();
	}

	pop() {
		const task = this.tasks.shift() ?? null;
		this.#save();
		return task;
	}

	clear() {
		this.tasks = [];
	}
}
