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
  product_type_name?: string;
  dimensions: string;
  color: string;
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

export const requestForgotPasswordCode = async (email: string): Promise<void> => {
  await api.post('/forgot-password', { email: email.trim().toLowerCase() });
};

export const verifyResetCode = async (email: string, code: string): Promise<void> => {
  await api.post('/verify-reset-code', { email: email.trim().toLowerCase(), code: code.trim() });
};

export const resetPassword = async (
  email: string,
  code: string,
  newPassword: string
): Promise<AuthResponse> => {
  const response = await api.post<AuthResponse>('/reset-password', {
    email: email.trim().toLowerCase(),
    code: code.trim(),
    new_password: newPassword,
  });
  if (response.data.token)
    localStorage.setItem('authToken', response.data.token);
  return response.data;
};

export const verifyEmail = async (token: string): Promise<void> => {
  await api.post('/verify-email', { token: token.trim() });
};

export const getCurrentUser = async (): Promise<{
  id: number;
  role_id: number;
  email: string;
  first_name: string;
  last_name: string;
  phone?: string | null;
  allergic_to_cinnamon?: boolean | null;
  created_at?: string;
}> => {
  const response = await api.get('/me');
  return response.data;
};

export const updateAllergicToCinnamon = async (allergic: boolean): Promise<void> => {
  await api.patch('/me', { allergic_to_cinnamon: allergic });
};

export const getProducts = async (): Promise<ProductCard[]> => {
  const response = await api.get<ProductCard[]>('/products');
  return response.data;
};

export const getProductTypes = async (): Promise<ProductType[]> => {
  const response = await api.get<ProductType[]>('/product-types');
  return response.data;
};

export interface ProductWithImages {
  id: number;
  product_type_id: number;
  title: string;
  description: string;
  price: number;
  dimensions: string;
  color: string;
  stripe_price_id: string;
  created_at: string;
  image_urls: string[];
  image_ids?: number[];
}

export const getProductById = async (productId: number): Promise<ProductWithImages> => {
  const response = await api.get(`/product/${productId}`);
  return response.data;
};

export const updateProduct = async (
  productId: number,
  data: { title?: string; description?: string; price?: number; dimensions?: string; color?: string }
): Promise<ProductWithImages> => {
  const response = await api.patch<ProductWithImages>(`/product/${productId}`, data);
  return response.data;
};

export const addProductImage = async (productId: number, file: File): Promise<ProductWithImages> => {
  const baseURL = window.localStorage.getItem('apiBaseUrl') || 'http://localhost:5001/api';
  const token = localStorage.getItem('authToken');
  const fd = new FormData();
  fd.append('image', file);
  const res = await fetch(`${baseURL}/product/${productId}/images`, {
    method: 'POST',
    headers: token ? { Authorization: `Bearer ${token}` } : {},
    body: fd,
  });
  if (!res.ok) {
    const err = await res.json().catch(() => ({}));
    throw new Error((err as any).error || 'Failed to add image');
  }
  return res.json();
};

export const reorderProductImages = async (productId: number, order: number[]): Promise<ProductWithImages> => {
  const response = await api.put<ProductWithImages>(`/product/${productId}/images/order`, { order });
  return response.data;
};

export const deleteProductImage = async (productId: number, imageId: number): Promise<ProductWithImages> => {
  const response = await api.delete<ProductWithImages>(`/product/${productId}/images/${imageId}`);
  return response.data;
};

export interface CheckoutSession {
  id: string;
  url: string;
  price_id: string;
  error?: string;
}

export const createCheckoutSession = async (
  priceId: string,
  quantity = 1,
  allergicToCinnamon?: boolean
): Promise<CheckoutSession> => {
  const response = await api.post(`/create-checkout-session/${priceId}`, {
    quantity,
    ...(allergicToCinnamon !== undefined && { allergic_to_cinnamon: allergicToCinnamon }),
  });
  return response.data;
};

export const createCartCheckoutSession = async (
  items: { product_id: number; quantity: number }[],
  allergicToCinnamon?: boolean
): Promise<{ id: string; url: string }> => {
  const response = await api.post('/create-cart-checkout-session', {
    items,
    ...(allergicToCinnamon !== undefined && { allergic_to_cinnamon: allergicToCinnamon }),
  });
  return response.data;
};

export const syncCart = async (items: any[]): Promise<any> => {
  const response = await api.post('/sync-cart', { items });
  return response.data;
};

export const getCart = async (): Promise<{ items: any[] }> => {
  const response = await api.get('/cart');
  return response.data;
};

export interface Order {
  id: number;
  user_id: number;
  product_id: number;
  session_id: string;
  order_number?: string;
  amount_cents: number;
  quantity: number;
  paid: boolean;
  status: string;
  created_at: string;
  product_title: string;
  image_url: string;
  tracking_url?: string | null;
  comments?: string[];  // notes as array from API
  customer_email?: string | null;
  user_first_name?: string | null;
  user_last_name?: string | null;
  user_email?: string | null;
}

export const getOrders = async (): Promise<Order[]> => {
  const response = await api.get<Order[]>('/orders');
  return response.data;
};

export interface OrderDetailResponse {
  order_number: string;
  orders: Order[];
}

export const getOrderByNumber = async (orderNumber: string): Promise<OrderDetailResponse> => {
  const response = await api.get<OrderDetailResponse>(`/orders/${orderNumber}`);
  return response.data;
};

export interface AdminOrderListResponse {
  orders_by_number: Record<string, Order[]>;
  total: number;
  page: number;
  per_page: number;
}

export const getAdminOrders = async (page = 1, perPage = 10): Promise<AdminOrderListResponse> => {
  const response = await api.get<AdminOrderListResponse>('/admin/orders', { params: { page, per_page: perPage } });
  return response.data;
};

export const getAdminOrderByNumber = async (orderNumber: string): Promise<OrderDetailResponse> => {
  const response = await api.get<OrderDetailResponse>(`/admin/orders/${orderNumber}`);
  return response.data;
};

export const updateAdminOrder = async (
  orderNumber: string,
  data: { status?: string; tracking_url?: string; comments?: string[] }
): Promise<OrderDetailResponse> => {
  const response = await api.patch<OrderDetailResponse>(`/admin/orders/${orderNumber}`, data);
  return response.data;
};

export type BannerBackgroundColor = 'primary' | 'primary_dark' | 'secondary' | 'secondary_dark';

export interface Banner {
  id: number;
  is_active: boolean;
  text: string;
  background_color: BannerBackgroundColor;
  created_at: string;
}

export interface BannerResponse {
  banner: Banner | null;
}

export const getBanner = async (): Promise<BannerResponse> => {
  const response = await api.get<BannerResponse>('/banner');
  return response.data;
};

export const createBanner = async (data: {
  is_active: boolean;
  text: string;
  background_color: BannerBackgroundColor;
}): Promise<Banner> => {
  const response = await api.post<Banner>('/admin/banner', data);
  return response.data;
};
