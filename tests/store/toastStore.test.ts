import { describe, it, expect, beforeEach } from 'vitest';
import { useToastStore } from '../../src/store/toastStore';
import type { Toast } from '../../src/types/toast';

describe('Toast Store', () => {
  beforeEach(() => {
    // Reset store state before each test
    useToastStore.setState({ toasts: [] });
  });

  it('should initialize with empty toasts array', () => {
    const { toasts } = useToastStore.getState();
    expect(toasts).toEqual([]);
  });

  it('should add a toast with generated id and defaults', () => {
    const { addToast, toasts } = useToastStore.getState();
    
    addToast({
      message: 'Test message',
      type: 'info',
    });

    const state = useToastStore.getState();
    expect(state.toasts).toHaveLength(1);
    expect(state.toasts[0]).toMatchObject({
      message: 'Test message',
      type: 'info',
      duration: 5000,
      dismissible: true,
    });
    expect(state.toasts[0].id).toMatch(/^toast-\d+-[a-z0-9]+$/);
  });

  it('should add multiple toasts', () => {
    const { addToast } = useToastStore.getState();
    
    addToast({ message: 'First toast', type: 'success' });
    addToast({ message: 'Second toast', type: 'error' });

    const state = useToastStore.getState();
    expect(state.toasts).toHaveLength(2);
    expect(state.toasts[0].message).toBe('First toast');
    expect(state.toasts[1].message).toBe('Second toast');
  });

  it('should remove a toast by id', () => {
    const { addToast, removeToast } = useToastStore.getState();
    
    addToast({ message: 'Toast to remove', type: 'warning' });
    const { toasts } = useToastStore.getState();
    const toastId = toasts[0].id;

    removeToast(toastId);

    const finalState = useToastStore.getState();
    expect(finalState.toasts).toHaveLength(0);
  });

  it('should not remove toast with non-existent id', () => {
    const { addToast, removeToast } = useToastStore.getState();
    
    addToast({ message: 'Test toast', type: 'info' });
    removeToast('non-existent-id');

    const state = useToastStore.getState();
    expect(state.toasts).toHaveLength(1);
  });

  it('should clear all toasts', () => {
    const { addToast, clearToasts } = useToastStore.getState();
    
    addToast({ message: 'Toast 1', type: 'success' });
    addToast({ message: 'Toast 2', type: 'error' });
    addToast({ message: 'Toast 3', type: 'warning' });

    clearToasts();

    const state = useToastStore.getState();
    expect(state.toasts).toHaveLength(0);
  });

  it('should override default values with provided options', () => {
    const { addToast } = useToastStore.getState();
    
    addToast({
      message: 'Custom toast',
      type: 'error',
      duration: 10000,
      dismissible: false,
    });

    const state = useToastStore.getState();
    expect(state.toasts[0]).toMatchObject({
      message: 'Custom toast',
      type: 'error',
      duration: 10000,
      dismissible: false,
    });
  });

  it('should generate unique ids for each toast', () => {
    const { addToast } = useToastStore.getState();
    
    addToast({ message: 'Toast 1', type: 'info' });
    addToast({ message: 'Toast 2', type: 'info' });
    addToast({ message: 'Toast 3', type: 'info' });

    const state = useToastStore.getState();
    const ids = state.toasts.map(toast => toast.id);
    const uniqueIds = new Set(ids);
    
    expect(uniqueIds.size).toBe(3);
  });
});