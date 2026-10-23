import { create } from 'zustand';

export type FeedbackType = 'success' | 'error';

export interface FeedbackContent {
  title: string;
  description?: string;
}

export interface Feedback extends FeedbackContent {
  id: number;
  type: FeedbackType;
}

interface FeedbackState {
  items: Feedback[];
  notify: (type: FeedbackType, content: FeedbackContent) => void;
  dismiss: (id: number) => void;
}

let nextId = 1;

export const useFeedbackStore = create<FeedbackState>((set) => ({
  items: [],
  notify: (type, content) =>
    set((state) => ({
      items: [...state.items, { id: nextId++, type, ...content }],
    })),
  dismiss: (id) =>
    set((state) => ({ items: state.items.filter((item) => item.id !== id) })),
}));

export const notifySuccess = (content: FeedbackContent) =>
  useFeedbackStore.getState().notify('success', content);

export const notifyError = (content: FeedbackContent) =>
  useFeedbackStore.getState().notify('error', content);
