import axios from 'axios';

export const API_PREFIX = '/api/v1';

export const api = axios.create({
  baseURL: `${process.env.NEXT_PUBLIC_API_URL ?? ''}${API_PREFIX}`,
  headers: { 'Content-Type': 'application/json' },
});
