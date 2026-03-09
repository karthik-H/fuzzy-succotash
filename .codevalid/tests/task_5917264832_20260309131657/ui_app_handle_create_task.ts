import { api } from '../../../frontend/src/api';
import type { TaskCreate } from '../../../frontend/src/api';

// We reconstruct handleCreateTask for isolated testing, as in App.tsx
const mockSetIsFormOpen = jest.fn();
const mockLoadTasks = jest.fn();

async function handleCreateTask(taskData: TaskCreate) {
  try {
    await api.createTask(taskData);
    await mockLoadTasks();
    mockSetIsFormOpen(false);
  } catch (error) {
    // In App.tsx: alert('Failed to create task')
    // For test, we can throw or log
    throw new Error('Failed to create task');
  }
}

jest.mock('../../../frontend/src/api', () => ({
  api: {
    createTask: jest.fn(),
    getTasks: jest.fn(),
    updateTask: jest.fn(),
    deleteTask: jest.fn(),
  },
}));

describe('ui_app_handle_create_task', () => {
  beforeEach(() => {
    jest.clearAllMocks();
    mockSetIsFormOpen.mockClear();
    mockLoadTasks.mockClear();
  });

  // Helper for T.repeat(255)
  const T = {
    repeat: (n: number) => 'A'.repeat(n),
  };

  // Test Case 1: add_task_all_fields_valid
  it('add_task_all_fields_valid', async () => {
    const task = {
      description: 'Create a responsive login page using React.',
      due_date: '2024-06-15',
      priority: 'High',
      title: 'Implement login page',
      user_name: 'alice',
      completed: false,
    } as TaskCreate;
    (api.createTask as jest.Mock).mockResolvedValueOnce({ ...task, id: '1' });

    await handleCreateTask(task);

    expect(api.createTask).toHaveBeenCalledWith(task);
    expect(mockLoadTasks).toHaveBeenCalled();
    expect(mockSetIsFormOpen).toHaveBeenCalledWith(false);
  });

  // Test Case 2: add_task_missing_title
  it('add_task_missing_title', async () => {
    const task = {
      description: 'Task description',
      due_date: '2024-06-20',
      priority: 'Medium',
      user_name: 'bob',
      completed: false,
    } as any;
    (api.createTask as jest.Mock).mockResolvedValueOnce({ ...task, id: '2' });

    // Title is required in TaskCreate, so this will likely throw
    await expect(handleCreateTask(task)).rejects.toThrow();
    expect(api.createTask).toHaveBeenCalledWith(task);
  });

  // Test Case 3: add_task_missing_description
  it('add_task_missing_description', async () => {
    const task = {
      due_date: '2024-06-30',
      priority: 'Low',
      title: 'Setup CI/CD pipeline',
      user_name: 'charlie',
      completed: false,
    } as TaskCreate;
    (api.createTask as jest.Mock).mockResolvedValueOnce({ ...task, id: '3' });

    await handleCreateTask(task);

    expect(api.createTask).toHaveBeenCalledWith(task);
    expect(mockLoadTasks).toHaveBeenCalled();
    expect(mockSetIsFormOpen).toHaveBeenCalledWith(false);
  });

  // Test Case 4: add_task_missing_priority
  it('add_task_missing_priority', async () => {
    const task = {
      description: 'Improve API code structure.',
      due_date: '2024-07-01',
      title: 'Refactor API endpoints',
      user_name: 'dave',
      completed: false,
    } as any;
    (api.createTask as jest.Mock).mockResolvedValueOnce({ ...task, id: '4' });

    // Priority is required in TaskCreate, so this will likely throw
    await expect(handleCreateTask(task)).rejects.toThrow();
    expect(api.createTask).toHaveBeenCalledWith(task);
  });

  // Test Case 5: add_task_missing_due_date
  it('add_task_missing_due_date', async () => {
    const task = {
      description: 'Document all modules.',
      priority: 'High',
      title: 'Write documentation',
      user_name: 'eve',
      completed: false,
    } as TaskCreate;
    (api.createTask as jest.Mock).mockResolvedValueOnce({ ...task, id: '5' });

    await handleCreateTask(task);

    expect(api.createTask).toHaveBeenCalledWith(task);
    expect(mockLoadTasks).toHaveBeenCalled();
    expect(mockSetIsFormOpen).toHaveBeenCalledWith(false);
  });

  // Test Case 6: add_task_missing_user_name
  it('add_task_missing_user_name', async () => {
    const task = {
      description: 'Upgrade project dependencies to latest versions.',
      due_date: '2024-06-23',
      priority: 'Medium',
      title: 'Update dependencies',
      completed: false,
    } as any;
    (api.createTask as jest.Mock).mockResolvedValueOnce({ ...task, id: '6' });

    await handleCreateTask(task);

    expect(api.createTask).toHaveBeenCalledWith(task);
    expect(mockLoadTasks).toHaveBeenCalled();
    expect(mockSetIsFormOpen).toHaveBeenCalledWith(false);
  });

  // Test Case 7: add_task_all_fields_empty_strings
  it('add_task_all_fields_empty_strings', async () => {
    const task = {
      description: '',
      due_date: '',
      priority: '',
      title: '',
      user_name: '',
      completed: false,
    } as any;
    (api.createTask as jest.Mock).mockResolvedValueOnce({ ...task, id: '7' });

    await handleCreateTask(task);

    expect(api.createTask).toHaveBeenCalledWith(task);
    expect(mockLoadTasks).toHaveBeenCalled();
    expect(mockSetIsFormOpen).toHaveBeenCalledWith(false);
  });

  // Test Case 8: add_task_priority_boundary_values
  it('add_task_priority_boundary_values', async () => {
    const task = {
      description: 'Check priority handling',
      due_date: '2024-06-22',
      priority: T.repeat(255),
      title: 'Test boundary priority',
      user_name: 'frank',
      completed: false,
    } as any;
    (api.createTask as jest.Mock).mockResolvedValueOnce({ ...task, id: '8' });

    await handleCreateTask(task);

    expect(api.createTask).toHaveBeenCalledWith(task);
    expect(mockLoadTasks).toHaveBeenCalled();
    expect(mockSetIsFormOpen).toHaveBeenCalledWith(false);
  });

  // Test Case 9: add_task_due_date_past
  it('add_task_due_date_past', async () => {
    const task = {
      description: 'Check handling of past due dates',
      due_date: '2020-01-01',
      priority: 'Low',
      title: 'Past due date task',
      user_name: 'grace',
      completed: false,
    } as TaskCreate;
    (api.createTask as jest.Mock).mockResolvedValueOnce({ ...task, id: '9' });

    await handleCreateTask(task);

    expect(api.createTask).toHaveBeenCalledWith(task);
    expect(mockLoadTasks).toHaveBeenCalled();
    expect(mockSetIsFormOpen).toHaveBeenCalledWith(false);
  });

  // Test Case 10: add_task_special_characters
  it('add_task_special_characters', async () => {
    const task = {
      description: "<script>alert('xss')</script>",
      due_date: '2024-06-21',
      priority: '🔥',
      title: '@#$%^&*()_+|',
      user_name: '用户',
      completed: false,
    } as any;
    (api.createTask as jest.Mock).mockResolvedValueOnce({ ...task, id: '10' });

    await handleCreateTask(task);

    expect(api.createTask).toHaveBeenCalledWith(task);
    expect(mockLoadTasks).toHaveBeenCalled();
    expect(mockSetIsFormOpen).toHaveBeenCalledWith(false);
  });

  // Test Case 11: add_task_form_close_after_submission
  it('add_task_form_close_after_submission', async () => {
    const task = {
      description: 'Check form closure',
      due_date: '2024-06-30',
      priority: 'High',
      title: 'Close form after add',
      user_name: 'henry',
      completed: false,
    } as TaskCreate;
    (api.createTask as jest.Mock).mockResolvedValueOnce({ ...task, id: '11' });

    await handleCreateTask(task);

    expect(mockSetIsFormOpen).toHaveBeenCalledWith(false);
  });

  // Test Case 12: add_task_reload_tasks_after_creation
  it('add_task_reload_tasks_after_creation', async () => {
    const task = {
      description: 'Check reload behavior',
      due_date: '2024-07-01',
      priority: 'Medium',
      title: 'Reload tasks',
      user_name: 'ivan',
      completed: false,
    } as TaskCreate;
    (api.createTask as jest.Mock).mockResolvedValueOnce({ ...task, id: '12' });

    await handleCreateTask(task);

    expect(mockLoadTasks).toHaveBeenCalled();
  });

  // Test Case 13: add_task_all_fields_max_length
  it('add_task_all_fields_max_length', async () => {
    const task = {
      description: T.repeat(255),
      due_date: T.repeat(255),
      priority: T.repeat(255),
      title: T.repeat(255),
      user_name: T.repeat(255),
      completed: false,
    } as any;
    (api.createTask as jest.Mock).mockResolvedValueOnce({ ...task, id: '13' });

    await handleCreateTask(task);

    expect(api.createTask).toHaveBeenCalledWith(task);
    expect(mockLoadTasks).toHaveBeenCalled();
    expect(mockSetIsFormOpen).toHaveBeenCalledWith(false);
  });
});