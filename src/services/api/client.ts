/**
 * API Client - 网络请求封装
 *
 * 基于 axios 或原生 fetch 实现。
 */

import axios, {AxiosInstance, AxiosRequestConfig, AxiosResponse} from 'axios';

// TODO: 根据实际 API 地址配置
const BASE_URL = 'https://api.example.com/v1';

/**
 * 请求配置
 */
export interface RequestConfig extends AxiosRequestConfig {
  /** 是否需要 token */
  auth?: boolean;
  /** 是否显示加载 */
  loading?: boolean;
  /** 缓存配置 */
  cache?: boolean;
}

/**
 * 响应数据包装
 */
export interface ApiResponse<T = any> {
  code: number;
  message: string;
  data: T;
}

/**
 * API Client
 */
class ApiClient {
  private client: AxiosInstance;
  private token: string | null = null;

  constructor() {
    this.client = axios.create({
      baseURL: BASE_URL,
      timeout: 30000,
      headers: {
        'Content-Type': 'application/json',
        'Accept': 'application/json',
      },
    });

    // 请求拦截器
    this.client.interceptors.request.use(
      (config) => {
        // 添加 token
        if (this.token && config.headers) {
          config.headers.Authorization = `Bearer ${this.token}`;
        }
        return config;
      },
      (error) => {
        return Promise.reject(error);
      },
    );

    // 响应拦截器
    this.client.interceptors.response.use(
      (response) => {
        return response.data;
      },
      (error) => {
        // 统一错误处理
        if (error.response) {
          // 根据状态码处理
          const {status} = error.response;
          switch (status) {
            case 401:
              // 未授权，清除 token
              this.token = null;
              break;
            case 403:
              // 禁止访问
              break;
            case 404:
              // 资源不存在
              break;
            case 500:
              // 服务器错误
              break;
          }
        }
        return Promise.reject(error);
      },
    );
  }

  /**
   * 设置 token
   */
  setToken(token: string | null) {
    this.token = token;
  }

  /**
   * GET 请求
   */
  get<T = any>(url: string, config?: RequestConfig): Promise<ApiResponse<T>> {
    return this.client.get(url, config);
  }

  /**
   * POST 请求
   */
  post<T = any>(url: string, data?: any, config?: RequestConfig): Promise<ApiResponse<T>> {
    return this.client.post(url, data, config);
  }

  /**
   * PUT 请求
   */
  put<T = any>(url: string, data?: any, config?: RequestConfig): Promise<ApiResponse<T>> {
    return this.client.put(url, data, config);
  }

  /**
   * DELETE 请求
   */
  delete<T = any>(url: string, config?: RequestConfig): Promise<ApiResponse<T>> {
    return this.client.delete(url, config);
  }

  /**
   * PATCH 请求
   */
  patch<T = any>(url: string, data?: any, config?: RequestConfig): Promise<ApiResponse<T>> {
    return this.client.patch(url, data, config);
  }
}

export const apiClient = new ApiClient();