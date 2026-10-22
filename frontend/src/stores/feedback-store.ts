import { create } from 'zustand';

export type FeedbackType = 'success' | 'error';

export interface Feedback {
  id: number;
  type: FeedbackType;
  message: string;
}

interface FeedbackState {
  items: Feedback[];
  notify: (type: FeedbackType, message: string) => void;
  dismiss: (id: number) => void;
}

let nextId = 1;

export const useFeedbackStore = create<FeedbackState>((set) => ({
  items: [],
  notify: (type, message) =>
    set((state) => ({
      items: [...state.items, { id: nextId++, type, message }],
    })),
  dismiss: (id) =>
    set((state) => ({ items: state.items.filter((item) => item.id !== id) })),
}));

export const notifySuccess = (message: string) =>
  useFeedbackStore.getState().notify('success', message);

export const notifyError = (message: string) =>
  useFeedbackStore.getState().notify('error', message);
