// Storage utilities will be added in Prompt 8
export const storage = {
  set: (key: string, value: unknown) => {
    localStorage.setItem(key, JSON.stringify(value));
  },
  get: (key: string) => {
    const value = localStorage.getItem(key);
    return value ? JSON.parse(value) : null;
  },
  remove: (key: string) => {
    localStorage.removeItem(key);
  },
};
