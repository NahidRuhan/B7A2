export type TResponse<T> = {
  statusCode: number;
  success: boolean;
  message?: string;
  data?: T;
  errors?: unknown;
};

export const USER_ROLE = {
  maintainer : "maintainer",
  contributor : "contributor"
} as const

export type Roles = keyof typeof USER_ROLE