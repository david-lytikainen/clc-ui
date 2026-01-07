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

export interface ProductType {
  id: number;
  name: string;
}

export interface ProductCard {
  id: number;
  title: string;
  price: number;
  description: string;
  product_type_id: number;
  dimensions: string;
  color: string;
  note_of_cinnamon: string;
  created_at: string;
  image_url : string;
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

export const getCurrentUser = async (): Promise<{
  id: number;
  role_id: number;
  email: string;
  first_name: string;
  last_name: string;
  created_at?: string;
}> => {
  const response = await api.get('/me');
  return response.data;
};

export const getProducts = async (productType: string): Promise<any[]> => {
  const response = await api.get(`/products/${productType}`);
  return response.data;
};

export const getProductTypes = async (): Promise<ProductType[]> => {
  const response = await api.get<ProductType[]>('/product-types');
  return response.data;
};
