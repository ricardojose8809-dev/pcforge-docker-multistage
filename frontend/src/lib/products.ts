import { apiGet } from "@/lib/api";

import type {
  PaginatedProducts,
  Product,
  ProductDetailResponse,
} from "@/types/product";

const productImageMap: Record<number, string> = {
  // Página 1: procesadores, gráficas y RAM
  1: "/images/products/amd-ryzen-5-7600x.jpg",
  2: "/images/products/intel-core-i5-14600k.jpg",
  3: "/images/products/amd-ryzen-7-7800x3d.jpg",
  4: "/images/products/nvidia-rtx-4060-8gb.jpg",
  5: "/images/products/nvidia-rtx-4070-super.jpg",
  6: "/images/products/amd-radeon-rx-7800-xt.jpg",
  7: "/images/products/corsair-vengeance-16gb-ddr5.jpg",
  8: "/images/products/gskill-trident-z5-32gb-ddr5.jpg",

  // Página 2: placas madre, almacenamiento,
  // fuentes de poder y gabinetes
  9: "/images/products/asus-tuf-b650-plus.jpg",
  10: "/images/products/msi-mag-z790-tomahawk.jpg",
  11: "/images/products/samsung-980-pro-1tb.jpg",
  12: "/images/products/wd-black-sn850x-2tb.jpg",
  13: "/images/products/corsair-rm750e-750w.jpg",
  14: "/images/products/seasonic-focus-gx-850.jpg",
  15: "/images/products/nzxt-h510-flow.jpg",
  16: "/images/products/lian-li-lancool-216.jpg",

  // Página 3: refrigeración y RAM
  17: "/images/products/noctua-nh-d15.jpg",
  18: "/images/products/arctic-liquid-freezer-iii-360.jpg",
  19: "/images/products/cooler-master-hyper-212.jpg",
  20: "/images/products/kingston-fury-16gb-ddr4.jpg",
};

function prepareProduct(product: Product): Product {
  const localImage = productImageMap[product.id];

  return {
    ...product,
    image_url: localImage ?? product.image_url,
  };
}

export async function getProducts(
  page: number = 1,
): Promise<PaginatedProducts> {
  const response = await apiGet<PaginatedProducts>(
    `/products?page=${page}`,
    60,
  );

  return {
    ...response,
    data: response.data.map(prepareProduct),
  };
}

export async function getProduct(
  id: number,
): Promise<Product> {
  const response = await apiGet<ProductDetailResponse>(
    `/products/${id}`,
    60,
  );

  const product =
    "data" in response ? response.data : response;

  return prepareProduct(product);
}