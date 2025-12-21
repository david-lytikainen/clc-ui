import axios, { AxiosInstance, AxiosError, AxiosResponse } from 'axios';

const getBaseUrl = (): string => {
  return window.localStorage.getItem('apiBaseUrl') || 'http://localhost:5001/api';
};

const api: AxiosInstance = axios.create({
  baseURL: getBaseUrl(),
  headers: {
    'Content-Type': 'application/json',
  },
});

api.interceptors.request.use(
  (config) => {
    const token = localStorage.getItem('authToken');
    if (token) {
      config.headers.Authorization = `Bearer ${token}`;
    }
    return config;
  },
  (error) => {
    return Promise.reject(error);
  }
);

api.interceptors.response.use(
  (response: AxiosResponse) => {
    return response;
  },
  (error: AxiosError) => {
    if (error.response?.status === 401) {
      localStorage.removeItem('authToken');
    }
    return Promise.reject(error);
  }
);

export interface CreateAccount {
  first_name: string;
  last_name: string;
  email: string;
  password: string;
}

interface AuthResponse {
  token: string;
  user: {
    id: number;
    role_id: number;
    email: string;
    first_name: string;
    last_name: string;
    created_at: string;
  };
}

export const createAccount = async (data: CreateAccount): Promise<AuthResponse> => {
  const response = await api.post<AuthResponse>('/create-account', data);
  if (response.data.token)
    localStorage.setItem('authToken', response.data.token);
  
  return response.data;
};

export const signIn = async (email: string, password: string): Promise<AuthResponse> => {
  const response = await api.post<AuthResponse>('/sign-in', { email, password });
  if (response.data.token)
    localStorage.setItem('authToken', response.data.token);
  
  return response.data;
};

export const getProducts = async (): Promise<any[]> => {
  const response = await api.get('/products');
  return response.data;
};
