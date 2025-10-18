export type ApiResponse<T> = {
  success: boolean;
  message?: string;
  data?: T;
  error?: any;
  statusCode?: number;
};
export function sendResponse<T>(
  res: any,
  {
    success = true,
    message = "",
    data,
    error,
    statusCode = 200,
  }: ApiResponse<T>
) {
  return res.status(statusCode).json({
    success,
    message,
    data,
    error,
  });
}
