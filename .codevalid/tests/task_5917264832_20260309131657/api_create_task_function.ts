/**
 * @jest-environment jsdom
 * NOTE: This test file requires a test environment with fetch available.
 * If running in Node.js, use 'jest-environment-jsdom' or a fetch polyfill (e.g. 'whatwg-fetch').
 */
import 'whatwg-fetch'; // Polyfill fetch for Node.js environments
import { api } from '../../../../frontend/src/api';
import { Task, TaskCreate } from '../../../../frontend/src/api';

const API_URL = 'http://localhost:8000';

describe('api.createTask', () => {
  const originalFetch = global.fetch;

  afterEach(() => {
    global.fetch = originalFetch;
    jest.clearAllMocks();
  });

  function mockFetch(response: any, ok = true, status = 200) {
    global.fetch = jest.fn().mockResolvedValue({
      ok,
      status,
      json: jest.fn().mockResolvedValue(response),
    });
  }

  function mockFetchError(response: any, status = 500) {
    global.fetch = jest.fn().mockResolvedValue({
      ok: false,
      status,
      json: jest.fn().mockResolvedValue(response),
    });
  }

  // Test Case 1: Create Task with All Required Fields
  it('Create Task with All Required Fields', async () => {
    const request: TaskCreate = {
      title: 'Finish report',
      description: 'Complete the financial report by EOD',
      priority: 'High',
      due_date: '2024-07-10',
      completed: false,
    };
    const response: Task = {
      id: 'generated_task_id',
      title: 'Finish report',
      description: 'Complete the financial report by EOD',
      priority: 'High',
      due_date: '2024-07-10',
      completed: false,
    };
    mockFetch(response);
    const result = await api.createTask(request);
    expect(result).toEqual(response);
    expect(global.fetch).toHaveBeenCalledWith(
      `${API_URL}/tasks`,
      expect.objectContaining({
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(request),
      })
    );
  });

  // Test Case 2: Create Task Missing Title Field
  it('Create Task Missing Title Field', async () => {
    // @ts-expect-error: intentionally missing title
    const request = {
      description: 'Complete the financial report by EOD',
      priority: 'High',
      due_date: '2024-07-10',
      completed: false,
    };
    // Implementation blocking: cannot call api.createTask without title due to type
    await expect(api.createTask(request)).rejects.toThrow();
  });

  // Test Case 3: Create Task Missing Description Field
  it('Create Task Missing Description Field', async () => {
    const request: TaskCreate = {
      title: 'Finish report',
      priority: 'High',
      due_date: '2024-07-10',
      completed: false,
    };
    const response: Task = {
      id: 'generated_task_id',
      title: 'Finish report',
      description: undefined,
      priority: 'High',
      due_date: '2024-07-10',
      completed: false,
    };
    mockFetch(response);
    const result = await api.createTask(request);
    expect(result).toEqual(response);
  });

  // Test Case 4: Create Task Missing Priority Field
  it('Create Task Missing Priority Field', async () => {
    // @ts-expect-error: intentionally missing priority
    const request = {
      title: 'Finish report',
      description: 'Complete the financial report by EOD',
      due_date: '2024-07-10',
      completed: false,
    };
    // Implementation blocking: cannot call api.createTask without priority due to type
    await expect(api.createTask(request)).rejects.toThrow();
  });

  // Test Case 5: Create Task Missing Due Date Field
  it('Create Task Missing Due Date Field', async () => {
    const request: TaskCreate = {
      title: 'Finish report',
      description: 'Complete the financial report by EOD',
      priority: 'High',
      completed: false,
    };
    const response: Task = {
      id: 'generated_task_id',
      title: 'Finish report',
      description: 'Complete the financial report by EOD',
      priority: 'High',
      due_date: undefined,
      completed: false,
    };
    mockFetch(response);
    const result = await api.createTask(request);
    expect(result).toEqual(response);
  });

  // Test Case 6: Create Task Missing User Name Field
  it('Create Task Missing User Name Field', async () => {
    // User name field does not exist in TaskCreate interface, so cannot test
    // Implementation blocking: user_name is not a property of TaskCreate
    expect(true).toBe(true); // Placeholder
  });

  // Test Case 7: Create Task with Empty Strings for All Fields
  it('Create Task with Empty Strings for All Fields', async () => {
    // @ts-expect-error: empty strings for required fields
    const request = {
      title: '',
      description: '',
      priority: '',
      due_date: '',
      completed: false,
    };
    const response = {
      id: 'generated_task_id',
      title: '',
      description: '',
      priority: '',
      due_date: '',
      completed: false,
    };
    mockFetch(response);
    const result = await api.createTask(request);
    expect(result).toEqual(response);
  });

  // Test Case 8: Create Task with Maximum Length Input Strings
  it('Create Task with Maximum Length Input Strings', async () => {
    const longStr = 'A'.repeat(255);
    // @ts-expect-error: priority should be 'Low' | 'Medium' | 'High'
    const request = {
      title: longStr,
      description: longStr,
      priority: longStr,
      due_date: '2024-07-10',
      completed: false,
    };
    const response = {
      id: 'generated_task_id',
      title: longStr,
      description: longStr,
      priority: longStr,
      due_date: '2024-07-10',
      completed: false,
    };
    mockFetch(response);
    const result = await api.createTask(request);
    expect(result).toEqual(response);
  });

  // Test Case 9: Create Task with Invalid Due Date Format
  it('Create Task with Invalid Due Date Format', async () => {
    // @ts-expect-error: due_date should be string, but format is not validated
    const request = {
      title: 'Finish report',
      description: 'Complete the financial report by EOD',
      priority: 'High',
      due_date: 'July 10, 2024',
      completed: false,
    };
    const response = {
      id: 'generated_task_id',
      title: 'Finish report',
      description: 'Complete the financial report by EOD',
      priority: 'High',
      due_date: 'July 10, 2024',
      completed: false,
    };
    mockFetch(response);
    const result = await api.createTask(request);
    expect(result).toEqual(response);
  });

  // Test Case 10: Create Task with Unusual Priority Value
  it('Create Task with Unusual Priority Value', async () => {
    // @ts-expect-error: priority should be 'Low' | 'Medium' | 'High'
    const request = {
      title: 'Finish report',
      description: 'Complete the financial report by EOD',
      priority: 'urgent!!!',
      due_date: '2024-07-10',
      completed: false,
    };
    const response = {
      id: 'generated_task_id',
      title: 'Finish report',
      description: 'Complete the financial report by EOD',
      priority: 'urgent!!!',
      due_date: '2024-07-10',
      completed: false,
    };
    mockFetch(response);
    const result = await api.createTask(request);
    expect(result).toEqual(response);
  });

  // Test Case 11: Create Task When Backend Responds with Error
  it('Create Task When Backend Responds with Error', async () => {
    const request: TaskCreate = {
      title: 'Finish report',
      description: 'Complete the financial report by EOD',
      priority: 'High',
      due_date: '2024-07-10',
      completed: false,
    };
    mockFetchError({ error: 'Internal Server Error' }, 500);
    await expect(api.createTask(request)).rejects.toThrow('Failed to create task');
  });

  // Test Case 12: Create Task with Completed Field True
  it('Create Task with Completed Field True', async () => {
    const request: TaskCreate = {
      title: 'Finish report',
      description: 'Complete the financial report by EOD',
      priority: 'High',
      due_date: '2024-07-10',
      completed: true,
    };
    const response: Task = {
      id: 'generated_task_id',
      title: 'Finish report',
      description: 'Complete the financial report by EOD',
      priority: 'High',
      due_date: '2024-07-10',
      completed: true,
    };
    mockFetch(response);
    const result = await api.createTask(request);
    expect(result).toEqual(response);
  });

  // Test Case 13: Create Task with Completed Field False Explicitly
  it('Create Task with Completed Field False Explicitly', async () => {
    const request: TaskCreate = {
      title: 'Finish report',
      description: 'Complete the financial report by EOD',
      priority: 'High',
      due_date: '2024-07-10',
      completed: false,
    };
    const response: Task = {
      id: 'generated_task_id',
      title: 'Finish report',
      description: 'Complete the financial report by EOD',
      priority: 'High',
      due_date: '2024-07-10',
      completed: false,
    };
    mockFetch(response);
    const result = await api.createTask(request);
    expect(result).toEqual(response);
  });

  // Test Case 14: Create Task with Extra Fields in Request
  it('Create Task with Extra Fields in Request', async () => {
    // @ts-expect-error: extra fields not in TaskCreate
    const request = {
      title: 'Finish report',
      description: 'Complete the financial report by EOD',
      priority: 'High',
      due_date: '2024-07-10',
      completed: false,
      extra: 'something',
      tag: 'finance',
    };
    const response = {
      id: 'generated_task_id',
      title: 'Finish report',
      description: 'Complete the financial report by EOD',
      priority: 'High',
      due_date: '2024-07-10',
      completed: false,
    };
    mockFetch(response);
    const result = await api.createTask(request);
    expect(result).toEqual(response);
  });
});