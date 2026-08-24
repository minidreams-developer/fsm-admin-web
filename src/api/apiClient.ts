import { api } from "./axios";

export const apiClient = {
  get: async (url: string, params?: Record<string, unknown>) => {
    const { data } = await api.get(url, { params });
    return data;
  },

  post: async (url: string, payload?: unknown) => {
    const { data } = await api.post(url, payload);
    return data;
  },

  put: async (url: string, payload?: unknown) => {
    const { data } = await api.put(url, payload);
    return data;
  },

  delete: async (url: string) => {
    const { data } = await api.delete(url);
    return data;
  },
};
