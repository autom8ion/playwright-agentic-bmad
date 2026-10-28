import { expect, type APIRequestContext } from '@playwright/test';
import type { User } from '@factories/user.factory';

export interface Product {
  id: string;
  name: string;
  price: number;
  in_stock: boolean;
}

export interface Page<T> {
  current_page: number;
  data: T[];
  total: number;
}

/** Thin typed client for https://api.practicesoftwaretesting.com. Request context must carry the API baseURL. */
export class ToolshopApi {
  constructor(private readonly request: APIRequestContext) {}

  async register(user: User): Promise<{ id: string }> {
    const res = await this.request.post('/users/register', { data: user });
    await expect(res, await res.text()).toBeOK();
    return res.json();
  }

  async login(email: string, password: string): Promise<string> {
    const res = await this.request.post('/users/login', { data: { email, password } });
    await expect(res, await res.text()).toBeOK();
    return (await res.json()).access_token;
  }

  async searchProducts(q: string): Promise<Page<Product>> {
    const res = await this.request.get('/products/search', { params: { q } });
    await expect(res).toBeOK();
    return res.json();
  }

  async firstInStockProduct(): Promise<Product> {
    const res = await this.request.get('/products', { params: { page: 1 } });
    await expect(res).toBeOK();
    const { data } = (await res.json()) as Page<Product>;
    const product = data.find((p) => p.in_stock);
    if (!product) throw new Error('No in-stock product on page 1');
    return product;
  }
}
