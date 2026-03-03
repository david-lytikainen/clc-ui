import { useEffect, useState } from 'react';
import { getProducts, ProductCard } from '../services/api';

export const useProducts = () => {
  const [products, setProducts] = useState<ProductCard[]>([]);
  const [loading, setLoading] = useState<boolean>(false);
  const [error, setError] = useState<Error | null>(null);

  useEffect(() => {
    let mounted = true;
    const fetch = async () => {
      setLoading(true);
      setError(null);
      try {
        const res = await getProducts();
        if (!mounted) return;
        setProducts(res || []);
      } catch (err) {
        if (!mounted) return;
        setError(err as Error);
      } finally {
        if (!mounted) return;
        setLoading(false);
      }
    };

    fetch();
    return () => {
      mounted = false;
    };
  }, []);

  return { products, setProducts, loading, error } as const;
};

export default useProducts;
