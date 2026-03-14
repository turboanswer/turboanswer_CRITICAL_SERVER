import { QueryClient, QueryFunction } from "@tanstack/react-query";

async function throwIfResNotOk(res: Response) {
  if (!res.ok) {
    const text = (await res.text()) || res.statusText;
    throw new Error(`${res.status}: ${text}`);
  }
}

function getCsrfToken(): string {
  const match = document.cookie.match(/(^|;\s*)_csrf_token=([^;]*)/);
  return match ? decodeURIComponent(match[2]) : '';
}

let csrfInitPromise: Promise<void> | null = null;

async function initCsrfToken(): Promise<void> {
  if (getCsrfToken()) return;
  try {
    const res = await originalFetch('/api/csrf-token', { credentials: 'include' });
    if (res.ok) await res.json();
  } catch {}
}

function ensureCsrfInit(): Promise<void> {
  if (!csrfInitPromise) {
    csrfInitPromise = initCsrfToken();
  }
  return csrfInitPromise;
}

const MUTATING_METHODS = new Set(['POST', 'PUT', 'PATCH', 'DELETE']);
const originalFetch = window.fetch.bind(window);

window.fetch = async function(input: RequestInfo | URL, init?: RequestInit): Promise<Response> {
  const method = (init?.method || 'GET').toUpperCase();

  if (MUTATING_METHODS.has(method)) {
    const url = typeof input === 'string' ? input : input instanceof URL ? input.href : input.url;
    const isSameOrigin = url.startsWith('/') || url.startsWith(window.location.origin);

    if (isSameOrigin) {
      await ensureCsrfInit();
      const token = getCsrfToken();
      if (token) {
        const headers = new Headers(init?.headers);
        if (!headers.has('x-csrf-token')) {
          headers.set('x-csrf-token', token);
        }
        init = { ...init, headers };
      }
    }
  }

  return originalFetch(input, init);
};

export async function apiRequest(
  method: string,
  url: string,
  data?: unknown | undefined,
): Promise<Response> {
  const res = await fetch(url, {
    method,
    headers: data ? { "Content-Type": "application/json" } : {},
    body: data ? JSON.stringify(data) : undefined,
    credentials: "include",
  });

  await throwIfResNotOk(res);
  return res;
}

type UnauthorizedBehavior = "returnNull" | "throw";
export const getQueryFn: <T>(options: {
  on401: UnauthorizedBehavior;
}) => QueryFunction<T> =
  ({ on401: unauthorizedBehavior }) =>
  async ({ queryKey }) => {
    const res = await fetch(queryKey.join("/") as string, {
      credentials: "include",
    });

    if (unauthorizedBehavior === "returnNull" && res.status === 401) {
      return null;
    }

    await throwIfResNotOk(res);
    return await res.json();
  };

export const queryClient = new QueryClient({
  defaultOptions: {
    queries: {
      queryFn: getQueryFn({ on401: "throw" }),
      refetchInterval: false,
      refetchOnWindowFocus: false,
      staleTime: Infinity,
      retry: false,
    },
    mutations: {
      retry: false,
    },
  },
});
