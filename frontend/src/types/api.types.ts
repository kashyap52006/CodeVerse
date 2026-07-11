// API types will be added in Prompt 10
export interface ApiResponse<T> {
  data: T;
  success: boolean;
  error?: string;
}
