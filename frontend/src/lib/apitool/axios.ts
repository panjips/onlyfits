import axios, {
  type AxiosError,
  type AxiosInstance,
  type AxiosRequestConfig,
  type InternalAxiosRequestConfig,
} from "axios";
import { env } from "@/env";
import Cookies from "js-cookie";
import { ENDPOINTS } from "./endpoints";

const API_URL = env.VITE_BASE_API_URL;

type ApiInstance = AxiosInstance & {
  multipart: AxiosInstance;
};

const createConfig = (contentType: string): AxiosRequestConfig => ({
  baseURL: API_URL,
  headers: {
    "Content-Type": contentType,
  },
  withCredentials: true,
});

const api = axios.create(createConfig("application/json")) as ApiInstance;
const multipartInstance = axios.create(createConfig("multipart/form-data"));

let isRefreshing = false;

interface FailedQueueItem {
  resolve: (value?: unknown) => void;
  reject: (reason?: any) => void;
}

let failedQueue: FailedQueueItem[] = [];

const processQueue = (error: any, token: string | null = null) => {
  failedQueue.forEach((prom) => {
    if (error) {
      prom.reject(error);
    } else {
      prom.resolve(token);
    }
  });

  failedQueue = [];
};

const setupInterceptors = (instance: AxiosInstance) => {
  instance.interceptors.request.use(
    (config: InternalAxiosRequestConfig): InternalAxiosRequestConfig => {
      const token = Cookies.get("token");

      if (token) {
        config.headers.Authorization = `Bearer ${token}`;
      }
      return config;
    },
    (error: AxiosError) => Promise.reject(error),
  );

  instance.interceptors.response.use(
    (response) => response,
    async (error: AxiosError) => {
      const originalRequest = error.config as AxiosRequestConfig & {
        _retry?: boolean;
      };

      if (
        error.response?.status === 401 &&
        !originalRequest._retry &&
        originalRequest.url !== ENDPOINTS.REFRESH_TOKEN
      ) {
        if (isRefreshing) {
          return new Promise((resolve, reject) => {
            failedQueue.push({ resolve, reject });
          })
            .then(() => {
              return instance(originalRequest);
            })
            .catch((err) => {
              return Promise.reject(err);
            });
        }

        originalRequest._retry = true;
        isRefreshing = true;

        try {
          const {data} = await api.post(ENDPOINTS.REFRESH_TOKEN, undefined, {
            withCredentials: true,
          });

          const { accessToken } = data.data;
          Cookies.set("token", accessToken);

          processQueue(null);
          return instance(originalRequest);
        } catch (refreshError) {
          processQueue(refreshError, null);
          window.location.href = "/login";
          return Promise.reject(refreshError);
        } finally {
          isRefreshing = false;
        }
      }

      return Promise.reject(error);
    },
  );
};

setupInterceptors(api);
setupInterceptors(multipartInstance);

api.multipart = multipartInstance;

export { multipartInstance as axiosMultipartInstance };
export default api;
