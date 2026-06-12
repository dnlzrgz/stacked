import { browser } from '$app/environment';

class Task {
	/** @type {string} */
	id = '';

	/** @type {string} */
	title = $state('');

	/**
	 * @param {{ id?: string, title: string }} params
	 */
	constructor({ id = crypto.randomUUID(), title = '' }) {
		const trimmed = title.trim();
		if (!trimmed) {
			throw new Error('A title is required.');
		}

		this.id = id;
		this.title = trimmed;
	}

	/**
	 * @returns {{ id: string, title: string }}
	 */
	toJSON() {
		return { id: this.id, title: this.title };
	}

	/**
	 * @param {{ id: string, title: string }} data
	 * @returns {Task}
	 */
	static fromJSON({ id, title }) {
		return new Task({ id, title });
	}
}

export class Stack {
	/** @type {Task[]} */
	stack = $state([]);

	/** @type {Task | null} */
	top = $derived(this.stack.at(-1) ?? null);

	constructor() {
		if (browser) {
			this.stack = this.#load();
			$effect(() => {
				localStorage.setItem('tasks', JSON.stringify(this.stack));
			});
		}
	}

	#startTutorial() {
		return [
			new Task({
				title: 'Welcome to Stacked'
			}),
			new Task({
				title: 'Remove tasks with the delete button'
			}),
			new Task({
				title: 'Complete tasks with the check button'
			})
		];
	}

	/**
	 * Loads tasks from localStorage.
	 * @returns {Task[]}
	 */
	#load() {
		try {
			const saved = localStorage.getItem('tasks');
			const hasSeenTutorial = localStorage.getItem('onboarding-completed');

			if (!saved && !hasSeenTutorial) {
				localStorage.setItem('onboarding-completed', 'true');
				return this.#startTutorial();
			}

			return saved ? JSON.parse(saved).map(Task.fromJSON) : [];
		} catch {
			localStorage.removeItem('tasks');
			return [];
		}
	}

	/** @param {{ title: string }} data*/
	add({ title }) {
		this.stack.push(new Task({ title }));
	}

	remove() {
		this.stack.pop();
	}
}
