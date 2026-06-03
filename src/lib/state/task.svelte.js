export class Task {
	id = $state();
	title = $state();

	/**
	 * @param {Object} params
	 * @param {string} [params.id]
	 * @param {string} params.title
	 */
	constructor({ id = crypto.randomUUID(), title }) {
		if (!title.trim()) {
			throw new Error('Title is required.');
		}

		this.id = id;
		this.title = title.trim();
	}

	/*
	 * Reset completion.
	 */
	reset() {
		this.done = false;
		return this;
	}

	toJSON() {
		return { id: this.id, title: this.title, done: this.done };
	}

	/**
	 * @param {Object} data
	 */
	static fromJSON(data) {
		return new Task(data);
	}
}
