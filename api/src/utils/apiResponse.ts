export interface SuccessResponse<T> {
  success: true;
  data: T;
}

export interface ErrorResponse {
  success: false;
  error: string;
}

export const successResponse = <T>(data: T): SuccessResponse<T> => ({
  success: true,
  data,
});

export const errorResponse = (error: string): ErrorResponse => ({
  success: false,
  error,
});
