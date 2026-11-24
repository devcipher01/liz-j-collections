import { z } from "zod";

import heroImage from "@/assets/lizj-hero.png";
import jewelryImage from "@/assets/lizj-jewelry.png";
import bagImage from "@/assets/lizj-mini-bag.png";
import perfumeImage from "@/assets/lizj-perfume.png";
import shoesImage from "@/assets/lizj-shoes.png";
import watchImage from "@/assets/lizj-watch.png";

export const STORE_CONTACT = {
  name: "LIZ J COLLECTIONS",
  phoneDisplay: "+234 814 125 9734",
  phoneDigits: "2348141259734",
  email: "lizzyounce45@gmail.com",
} as const;

export type ProductCategory =
  | "Jewelry"
  | "Bags"
  | "Shoes"
  | "Shades"
  | "Wristwatches"
  | "Perfumes"
  | "Wears";

export interface StoreProduct {
  id: string;
  name: string;
  category: ProductCategory;
  price: number;
  image: string;
}

export interface CartLine {
  productId: string;
  quantity: number;
}

export const PRODUCTS: StoreProduct[] = [
  {
    id: "twisted-gold-hoops",
    name: "Twisted Gold Hoop Earrings",
    category: "Jewelry",
    price: 18500,
    image: jewelryImage,
  },
  {
    id: "burgundy-mini-bag",
    name: "Burgundy Mini Top-Handle Bag",
    category: "Bags",
    price: 48000,
    image: bagImage,
  },
  {
    id: "classic-gold-watch",
    name: "The Classic Gold Watch",
    category: "Wristwatches",
    price: 62000,
    image: watchImage,
  },
  {
    id: "amber-glow-perfume",
    name: "Amber Glow Eau de Parfum",
    category: "Perfumes",
    price: 32000,
    image: perfumeImage,
  },
  {
    id: "black-slingback-heels",
    name: "Black Slingback Heels",
    category: "Shoes",
    price: 74000,
    image: shoesImage,
  },
  {
    id: "atelier-cat-eye-shades",
    name: "Atelier Cat-Eye Shades",
    category: "Shades",
    price: 22000,
    image: heroImage,
  },
  {
    id: "satin-wrap-blouse",
    name: "Satin Wrap Blouse",
    category: "Wears",
    price: 36000,
    image: heroImage,
  },
  {
    id: "pearl-layer-necklace",
    name: "Pearl Layer Necklace",
    category: "Jewelry",
    price: 24500,
    image: jewelryImage,
  },
];

const cartLineSchema = z.object({
  productId: z.string().trim().min(1).max(80),
  quantity: z.number().int().min(1).max(99),
});

const storedCartSchema = z.array(cartLineSchema).max(50);
const checkoutPhoneSchema = z.string().regex(/^\d{10,15}$/);

export function parseStoredCart(serialized: string | null): CartLine[] {
  if (!serialized) return [];

  try {
    const parsed = storedCartSchema.safeParse(JSON.parse(serialized));
    if (!parsed.success) return [];
    const validIds = new Set(PRODUCTS.map((product) => product.id));
    return parsed.data.filter((item) => validIds.has(item.productId));
  } catch {
    return [];
  }
}

export function getCartItems(cart: CartLine[]) {
  const quantities = new Map<string, number>();
  const validIds = new Set(PRODUCTS.map((product) => product.id));

  for (const line of cart) {
    const parsed = cartLineSchema.safeParse(line);
    if (!parsed.success || !validIds.has(parsed.data.productId)) continue;
    const previous = quantities.get(parsed.data.productId) ?? 0;
    quantities.set(parsed.data.productId, Math.min(99, previous + parsed.data.quantity));
  }

  return PRODUCTS.flatMap((product) => {
    const quantity = quantities.get(product.id);
    return quantity ? [{ product, quantity }] : [];
  });
}

export function getCartSubtotal(cart: CartLine[]): number {
  return getCartItems(cart).reduce((total, item) => total + item.product.price * item.quantity, 0);
}

export function formatNaira(amount: number): string {
  return new Intl.NumberFormat("en-NG", {
    style: "currency",
    currency: "NGN",
    maximumFractionDigits: 0,
  }).format(amount);
}

export function buildWhatsAppCheckoutUrl(
  cart: CartLine[],
  phoneNumber: string = STORE_CONTACT.phoneDigits,
): string {
  const phoneDigits = phoneNumber.replace(/\D/g, "");
  if (!checkoutPhoneSchema.safeParse(phoneDigits).success) return "";

  const items = getCartItems(cart);
  if (items.length === 0) return "";

  const itemLines = items.map(
    ({ product, quantity }) =>
      `• ${product.name} × ${quantity} — ${formatNaira(product.price * quantity)}`,
  );
  const message = [
    `Hello ${STORE_CONTACT.name},`,
    "I'd like to place an order:",
    "",
    ...itemLines,
    "",
    `Order total: ${formatNaira(getCartSubtotal(cart))}`,
    "",
    "Please let me know the next steps. Thank you!",
  ].join("\n");

  return `https://wa.me/${phoneDigits}?text=${encodeURIComponent(message)}`;
}