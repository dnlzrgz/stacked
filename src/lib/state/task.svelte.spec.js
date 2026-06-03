import { describe, it, expect } from 'vitest';
import { Task } from './task.svelte';

describe('Task', () => {
	it('throws if title is blank', () => {
		expect(() => new Task({ title: '   ' })).toThrow('Title is required.');
	});

	it('serializes and deserializes correctly', () => {
		const task = new Task({ title: 'Buy milk' });
		const restored = Task.fromJSON(task.toJSON());
		expect(restored.title).toBe(task.title);
		expect(restored.id).toBe(task.id);
	});
});
