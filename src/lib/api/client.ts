const API_BASE_URL = process.env.NEXT_PUBLIC_API_URL ?? "http://localhost:8081/api/v1";

function originFor(base: string) {
  if (/^https?:\/\//.test(base)) {
    return undefined;
  }
  return typeof window === "undefined" ? "http://localhost" : window.location.origin;
}

export interface ApiEnvelope<T> {
  success: boolean;
  data: T;
  message: string | null;
  timestamp: string;
}

export interface FieldViolation {
  field: string;
  message: string;
}

export interface PagedResult<T> {
  items: T[];
  page: number;
  size: number;
  totalElements: number;
  totalPages: number;
  first: boolean;
  last: boolean;
}

export class ApiError extends Error {
  readonly code: string;
  readonly status: number;
  readonly fieldErrors: FieldViolation[];

  constructor(status: number, code: string, message: string, fieldErrors: FieldViolation[] = []) {
    super(message);
    this.name = "ApiError";
    this.status = status;
    this.code = code;
    this.fieldErrors = fieldErrors;
  }

  get isUnauthenticated() {
    return this.status === 401;
  }
}

interface RequestOptions extends Omit<RequestInit, "body"> {
  body?: unknown;
  searchParams?: Record<string, string | number | boolean | undefined | null>;
}

const NON_REFRESHABLE_PATHS = ["/auth/login", "/auth/refresh", "/auth/logout", "/auth/activate"];

let inFlightRefresh: Promise<boolean> | null = null;

async function refreshSession(): Promise<boolean> {
  const response = await fetch(`${API_BASE_URL}/auth/refresh`, {
    method: "POST",
    credentials: "include",
  });
  return response.ok;
}

function refreshOnce(): Promise<boolean> {
  inFlightRefresh ??= refreshSession()
    .catch(() => false)
    .finally(() => {
      inFlightRefresh = null;
    });

  return inFlightRefresh;
}

async function request<T>(path: string, options: RequestOptions = {}): Promise<T> {
  const { body, searchParams, headers, ...rest } = options;

  const url = new URL(`${API_BASE_URL}${path}`, originFor(API_BASE_URL));
  if (searchParams) {
    for (const [key, value] of Object.entries(searchParams)) {
      if (value !== undefined && value !== null && value !== "") {
        url.searchParams.set(key, String(value));
      }
    }
  }

  const send = () =>
    fetch(url.toString(), {
      ...rest,
      credentials: "include",
      headers: {
        ...(body !== undefined ? { "Content-Type": "application/json" } : {}),
        ...headers,
      },
      body: body !== undefined ? JSON.stringify(body) : undefined,
    });

  let response = await send();

  if (response.status === 401 && !NON_REFRESHABLE_PATHS.some((prefix) => path.startsWith(prefix))) {
    if (await refreshOnce()) {
      response = await send();
    }
  }

  if (response.status === 204) {
    return undefined as T;
  }

  const payload = await response.json().catch(() => null);

  if (!response.ok) {
    const error = payload?.error;
    throw new ApiError(
      response.status,
      error?.code ?? "UNKNOWN",
      error?.message ?? "Something went wrong. Please try again.",
      error?.fieldErrors ?? [],
    );
  }

  return (payload as ApiEnvelope<T>).data;
}

async function uploadFile<T>(path: string, file: File, field = "file"): Promise<T> {
  const form = new FormData();
  form.append(field, file);

  const send = () =>
    fetch(`${API_BASE_URL}${path}`, { method: "POST", credentials: "include", body: form });

  let response = await send();

  if (response.status === 401 && (await refreshOnce())) {
    response = await send();
  }

  const payload = await response.json().catch(() => null);

  if (!response.ok) {
    const error = payload?.error;
    throw new ApiError(
      response.status,
      error?.code ?? "UNKNOWN",
      error?.message ?? "That upload failed. Please try again.",
      error?.fieldErrors ?? [],
    );
  }

  return (payload as ApiEnvelope<T>).data;
}

export const apiClient = {
  upload: uploadFile,
  get: <T>(path: string, options?: RequestOptions) =>
    request<T>(path, { ...options, method: "GET" }),
  post: <T>(path: string, body?: unknown, options?: RequestOptions) =>
    request<T>(path, { ...options, method: "POST", body }),
  put: <T>(path: string, body?: unknown, options?: RequestOptions) =>
    request<T>(path, { ...options, method: "PUT", body }),
  delete: <T>(path: string, options?: RequestOptions) =>
    request<T>(path, { ...options, method: "DELETE" }),
};
