/**
 * API Client
 * Centralized HTTP client for all API requests with error handling and interceptors
 */

interface ApiResponse<T = any> {
  data?: T;
  error?: string;
  message?: string;
  status: number;
}

interface ApiRequestConfig {
  method?: 'GET' | 'POST' | 'PUT' | 'DELETE' | 'PATCH';
  headers?: Record<string, string>;
  body?: any;
  params?: Record<string, any>;
}

class ApiClient {
  private baseUrl: string;
  private defaultHeaders: Record<string, string>;

  constructor(baseUrl: string = '/api') {
    this.baseUrl = baseUrl;
    this.defaultHeaders = {
      'Content-Type': 'application/json',
    };
  }

  private buildUrl(path: string, params?: Record<string, any>): string {
    const url = new URL(`${this.baseUrl}${path}`, typeof window !== 'undefined' ? window.location.origin : 'http://localhost');
    
    if (params) {
      Object.entries(params).forEach(([key, value]) => {
        if (value !== null && value !== undefined) {
          url.searchParams.append(key, String(value));
        }
      });
    }

    return url.toString();
  }

  private async handleResponse<T>(response: Response): Promise<ApiResponse<T>> {
    const contentType = response.headers.get('content-type');
    let data: any;

    if (contentType?.includes('application/json')) {
      data = await response.json();
    } else {
      data = await response.text();
    }

    return {
      data: data?.data || data,
      error: data?.error,
      message: data?.message,
      status: response.status,
    };
  }

  async request<T = any>(
    path: string,
    config: ApiRequestConfig = {}
  ): Promise<ApiResponse<T>> {
    const {
      method = 'GET',
      headers = {},
      body,
      params,
    } = config;

    const url = this.buildUrl(path, params);
    const requestHeaders = {
      ...this.defaultHeaders,
      ...headers,
    };

    // Add auth token if available
    const token = typeof window !== 'undefined' ? 
      localStorage.getItem('authToken') : null;
    if (token) {
      requestHeaders['Authorization'] = `Bearer ${token}`;
    }

    try {
      const response = await fetch(url, {
        method,
        headers: requestHeaders,
        body: body ? JSON.stringify(body) : undefined,
      });

      const result = await this.handleResponse<T>(response);

      if (!response.ok) {
        throw new Error(result.error || result.message || 'Request failed');
      }

      return result;
    } catch (error) {
      console.error(`API Error [${method} ${path}]:`, error);
      return {
        status: 500,
        error: error instanceof Error ? error.message : 'Unknown error',
      };
    }
  }

  get<T = any>(path: string, params?: Record<string, any>) {
    return this.request<T>(path, { method: 'GET', params });
  }

  post<T = any>(path: string, body: any, params?: Record<string, any>) {
    return this.request<T>(path, { method: 'POST', body, params });
  }

  put<T = any>(path: string, body: any, params?: Record<string, any>) {
    return this.request<T>(path, { method: 'PUT', body, params });
  }

  patch<T = any>(path: string, body: any, params?: Record<string, any>) {
    return this.request<T>(path, { method: 'PATCH', body, params });
  }

  delete<T = any>(path: string, params?: Record<string, any>) {
    return this.request<T>(path, { method: 'DELETE', params });
  }
}

export const apiClient = new ApiClient('/api');
export default ApiClient;
