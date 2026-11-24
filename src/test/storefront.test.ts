import { describe, expect, it } from "vitest";

import {
  buildWhatsAppCheckoutUrl,
  formatNaira,
  getCartSubtotal,
  parseStoredCart,
} from "@/lib/storefront";

describe("LIZ J COLLECTIONS ordering", () => {
  it("displays sample prices in Nigerian naira", () => {
    expect(formatNaira(48_000)).toBe("₦48,000");
  });

  it("calculates cart totals from product prices and quantities", () => {
    expect(
      getCartSubtotal([
        { productId: "burgundy-mini-bag", quantity: 2 },
        { productId: "twisted-gold-hoops", quantity: 1 },
      ]),
    ).toBe(114_500);
  });

  it("prepares the order summary for the supplied WhatsApp number", () => {
    const checkoutUrl = buildWhatsAppCheckoutUrl([
      { productId: "burgundy-mini-bag", quantity: 2 },
    ]);
    const checkout = new URL(checkoutUrl);

    expect(checkout.host).toBe("wa.me");
    expect(checkout.pathname).toBe("/2348141259734");
    expect(checkout.searchParams.get("text")).toContain("Burgundy Mini Top-Handle Bag × 2");
    expect(checkout.searchParams.get("text")).toContain("Order total: ₦96,000");
  });

  it("rejects invalid items and quantities from saved cart data", () => {
    expect(parseStoredCart(JSON.stringify([{ productId: "unknown", quantity: 2 }]))).toEqual([]);
    expect(parseStoredCart(JSON.stringify([{ productId: "burgundy-mini-bag", quantity: 0 }]))).toEqual(
      [],
    );
  });
});