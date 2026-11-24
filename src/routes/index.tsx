import { useEffect, useMemo, useState } from "react";
import { createFileRoute } from "@tanstack/react-router";
import {
  ArrowRight,
  ArrowUpRight,
  Clock3,
  Footprints,
  Gem,
  Glasses,
  Mail,
  Menu,
  Minus,
  Phone,
  Plus,
  Shirt,
  ShoppingBag,
  Sparkles,
  Trash2,
  X,
} from "lucide-react";
import type { LucideIcon } from "lucide-react";

import { Button } from "@/components/ui/button";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import {
  buildWhatsAppCheckoutUrl,
  getCartItems,
  getCartSubtotal,
  parseStoredCart,
  PRODUCTS,
  STORE_CONTACT,
  formatNaira,
  type CartLine,
  type ProductCategory,
  type StoreProduct,
} from "@/lib/storefront";
import heroImage from "@/assets/lizj-hero.png";

const CART_STORAGE_KEY = "liz-j-collections-cart";

const NAV_LINKS = [
  { label: "Home", href: "#home" },
  { label: "Shop", href: "#shop" },
  { label: "Categories", href: "#categories" },
  { label: "Our story", href: "#about" },
  { label: "Contact", href: "#contact" },
] as const;

const CATEGORY_CHOICES: Array<{
  label: string;
  value: "All" | ProductCategory;
  Icon: LucideIcon;
}> = [
  { label: "All pieces", value: "All", Icon: Sparkles },
  { label: "Jewelry", value: "Jewelry", Icon: Gem },
  { label: "Bags", value: "Bags", Icon: ShoppingBag },
  { label: "Shoes", value: "Shoes", Icon: Footprints },
  { label: "Shades", value: "Shades", Icon: Glasses },
  { label: "Watches", value: "Wristwatches", Icon: Clock3 },
  { label: "Perfumes", value: "Perfumes", Icon: Sparkles },
  { label: "Wears", value: "Wears", Icon: Shirt },
];

export const Route = createFileRoute("/")({
  head: () => ({
    meta: [
      { title: "LIZ J COLLECTIONS | Accessories for every look" },
      {
        name: "description",
        content:
          "Shop jewelry, bags, shoes, shades, watches, perfumes and wears from LIZ J COLLECTIONS. Build your cart and place your order on WhatsApp.",
      },
      { property: "og:title", content: "LIZ J COLLECTIONS | Accessories for every look" },
      {
        property: "og:description",
        content:
          "Discover jewelry, bags, shoes, shades, watches, perfumes and wears, then send your order directly on WhatsApp.",
      },
      { property: "og:type", content: "website" },
      { name: "twitter:card", content: "summary_large_image" },
    ],
  }),
  component: Index,
});

function Index() {
  const [cart, setCart] = useState<CartLine[]>([]);
  const [cartReady, setCartReady] = useState(false);
  const [cartOpen, setCartOpen] = useState(false);
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);
  const [activeCategory, setActiveCategory] = useState<"All" | ProductCategory>("All");
  const [addedProductId, setAddedProductId] = useState<string | null>(null);

  useEffect(() => {
    try {
      setCart(parseStoredCart(window.localStorage.getItem(CART_STORAGE_KEY)));
    } catch {
      setCart([]);
    }
    setCartReady(true);
  }, []);

  useEffect(() => {
    if (!cartReady) return;
    try {
      window.localStorage.setItem(CART_STORAGE_KEY, JSON.stringify(cart));
    } catch {
      // The cart remains usable for this visit when browser storage is unavailable.
    }
  }, [cart, cartReady]);

  const visibleProducts = useMemo(
    () =>
      activeCategory === "All"
        ? PRODUCTS
        : PRODUCTS.filter((product) => product.category === activeCategory),
    [activeCategory],
  );
  const cartItems = useMemo(() => getCartItems(cart), [cart]);
  const cartCount = cartItems.reduce((count, item) => count + item.quantity, 0);
  const cartSubtotal = getCartSubtotal(cart);
  const checkoutUrl = buildWhatsAppCheckoutUrl(cart, STORE_CONTACT.phoneDigits);

  function addToCart(productId: string) {
    setCart((current) => {
      const existing = current.find((item) => item.productId === productId);
      if (existing) {
        if (existing.quantity >= 99) return current;
        return current.map((item) =>
          item.productId === productId ? { ...item, quantity: item.quantity + 1 } : item,
        );
      }
      return [...current, { productId, quantity: 1 }];
    });
    setAddedProductId(productId);
    window.setTimeout(() => setAddedProductId(null), 1100);
  }

  function changeQuantity(productId: string, amount: number) {
    setCart((current) =>
      current.flatMap((item) => {
        if (item.productId !== productId) return [item];
        const quantity = item.quantity + amount;
        return quantity < 1 ? [] : [{ ...item, quantity: Math.min(quantity, 99) }];
      }),
    );
  }

  function removeFromCart(productId: string) {
    setCart((current) => current.filter((item) => item.productId !== productId));
  }

  function selectCategory(category: "All" | ProductCategory) {
    setActiveCategory(category);
    setMobileMenuOpen(false);
  }

  return (
    <div className="min-h-screen bg-background text-foreground">
      <div className="top-ribbon">
        Thoughtful details. A look that feels like you.
      </div>

      <header className="site-header">
        <div className="store-container header-row">
          <a className="brand-mark" href="#home" aria-label="LIZ J COLLECTIONS home">
            <span className="brand-name">LIZ J</span>
            <span className="brand-subtitle">COLLECTIONS</span>
          </a>

          <nav className="desktop-nav" aria-label="Main navigation">
            {NAV_LINKS.map((link) => (
              <Button key={link.href} asChild variant="ghost" size="sm" className="nav-button">
                <a href={link.href}>{link.label}</a>
              </Button>
            ))}
          </nav>

          <div className="header-actions">
            <Button
              type="button"
              variant="outline"
              size="icon"
              className="header-cart-button"
              onClick={() => setCartOpen(true)}
              aria-label={`Open bag, ${cartCount} ${cartCount === 1 ? "item" : "items"}`}
              title="Open shopping bag"
            >
              <ShoppingBag aria-hidden="true" />
              <span className="bag-count" aria-hidden="true">
                {cartCount}
              </span>
            </Button>
            <Button
              type="button"
              variant="ghost"
              size="icon"
              className="mobile-menu-button"
              onClick={() => setMobileMenuOpen((open) => !open)}
              aria-label={mobileMenuOpen ? "Close menu" : "Open menu"}
              aria-expanded={mobileMenuOpen}
              title={mobileMenuOpen ? "Close menu" : "Open menu"}
            >
              {mobileMenuOpen ? <X aria-hidden="true" /> : <Menu aria-hidden="true" />}
            </Button>
          </div>
        </div>

        {mobileMenuOpen ? (
          <nav className="mobile-nav" aria-label="Mobile navigation">
            {NAV_LINKS.map((link) => (
              <Button
                key={link.href}
                asChild
                variant="ghost"
                className="mobile-nav-link"
                onClick={() => setMobileMenuOpen(false)}
              >
                <a href={link.href}>{link.label}</a>
              </Button>
            ))}
          </nav>
        ) : null}
      </header>

      <main>
        <section id="home" className="hero-section">
          <div className="hero-copy">
            <p className="hero-eyebrow">THE LIZ J EDIT</p>
            <h1 className="hero-title">
              Style that feels <em>like you.</em>
            </h1>
            <p className="hero-description">
              Jewelry, bags, shoes and thoughtful finishing touches for every day.
            </p>
            <div className="hero-actions">
              <Button asChild variant="secondary" size="lg" className="hero-shop-button">
                <a href="#shop">
                  Shop the collection <ArrowRight aria-hidden="true" />
                </a>
              </Button>
              <a
                className="hero-contact-link"
                href={`https://wa.me/${STORE_CONTACT.phoneDigits}`}
                target="_blank"
                rel="noreferrer"
              >
                Talk to us <ArrowUpRight aria-hidden="true" />
              </a>
            </div>
          </div>
          <div className="hero-image-wrap">
            <img
              className="hero-image"
              src={heroImage}
              alt="Model in a cream blouse and statement accessories"
              fetchPriority="high"
            />
          </div>
        </section>

        <section id="categories" className="store-container category-section">
          <div className="section-heading category-heading">
            <div>
              <p className="eyebrow">SHOP BY CATEGORY</p>
              <h2 className="section-title">Find your finishing touch</h2>
            </div>
            <p className="section-note">A little something for every look.</p>
          </div>
          <div className="category-rail" aria-label="Choose a product category">
            {CATEGORY_CHOICES.map(({ label, value, Icon }) => (
              <Button
                key={value}
                type="button"
                variant="ghost"
                className={`category-tile${activeCategory === value ? " is-active" : ""}`}
                onClick={() => selectCategory(value)}
                aria-pressed={activeCategory === value}
              >
                <span className="category-icon">
                  <Icon aria-hidden="true" />
                </span>
                <span>{label}</span>
              </Button>
            ))}
          </div>
        </section>

        <section id="shop" className="store-container shop-section">
          <div className="section-heading shop-heading">
            <div>
              <p className="eyebrow">A FEW FAVOURITES</p>
              <h2 className="section-title">
                {activeCategory === "All" ? "Pieces to keep in rotation" : `${activeCategory} to love`}
              </h2>
            </div>
            <p className="product-count">
              {visibleProducts.length} {visibleProducts.length === 1 ? "piece" : "pieces"}
            </p>
          </div>

          <div className="product-grid">
            {visibleProducts.map((product) => (
              <ProductCard
                key={product.id}
                product={product}
                added={addedProductId === product.id}
                onAdd={() => addToCart(product.id)}
              />
            ))}
          </div>
        </section>

        <section id="about" className="store-container editorial-section">
          <div className="editorial-image-wrap">
            <img src={heroImage} alt="A polished everyday look with a handbag and accessories" loading="lazy" />
          </div>
          <div className="editorial-copy">
            <p className="eyebrow">THE FINAL DETAIL</p>
            <h2 className="editorial-title">
              Little details.<br />
              <em>Big difference.</em>
            </h2>
            <p>
              From the first piece you put on to the last detail you add, find accessories that make
              your style your own.
            </p>
            <Button asChild variant="outline" className="editorial-button">
              <a href="#shop">
                Explore the collection <ArrowRight aria-hidden="true" />
              </a>
            </Button>
          </div>
        </section>

        <section className="store-container service-strip" aria-label="Shopping with LIZ J COLLECTIONS">
          <div className="service-note">
            <ShoppingBag aria-hidden="true" />
            <div>
              <h3>Easy ordering</h3>
              <p>Send your bag straight to WhatsApp.</p>
            </div>
          </div>
          <div className="service-note">
            <Gem aria-hidden="true" />
            <div>
              <h3>Curated finds</h3>
              <p>Jewelry, bags, shoes and more.</p>
            </div>
          </div>
          <div className="service-note">
            <Phone aria-hidden="true" />
            <div>
              <h3>Here to help</h3>
              <p>Call or message us with questions.</p>
            </div>
          </div>
        </section>
      </main>

      <footer id="contact" className="site-footer">
        <div className="store-container footer-content">
          <div className="footer-brand-block">
            <a className="brand-mark footer-brand" href="#home" aria-label="LIZ J COLLECTIONS home">
              <span className="brand-name">LIZ J</span>
              <span className="brand-subtitle">COLLECTIONS</span>
            </a>
            <p>Find the pieces that make the look yours.</p>
          </div>
          <div className="footer-links">
            <h2>Get in touch</h2>
            <a href={`tel:${STORE_CONTACT.phoneDigits}`}>
              <Phone aria-hidden="true" /> {STORE_CONTACT.phoneDisplay}
            </a>
            <a href={`mailto:${STORE_CONTACT.email}`}>
              <Mail aria-hidden="true" /> {STORE_CONTACT.email}
            </a>
            <a href={`https://wa.me/${STORE_CONTACT.phoneDigits}`} target="_blank" rel="noreferrer">
              <ShoppingBag aria-hidden="true" /> WhatsApp orders
            </a>
          </div>
          <div className="footer-cta">
            <p className="eyebrow">YOUR NEXT FAVOURITE IS HERE</p>
            <Button asChild variant="secondary" className="footer-shop-button">
              <a href="#shop">
                Shop now <ArrowRight aria-hidden="true" />
              </a>
            </Button>
          </div>
        </div>
        <div className="store-container footer-bottom">
          <p>© {new Date().getFullYear()} LIZ J COLLECTIONS</p>
          <a href="#home">Back to top <ArrowUpRight aria-hidden="true" /></a>
        </div>
      </footer>

      <Dialog open={cartOpen} onOpenChange={setCartOpen}>
        <DialogContent className="cart-panel">
          <div className="cart-panel-heading">
            <DialogHeader>
              <DialogTitle className="cart-title">Your bag</DialogTitle>
              <DialogDescription>
                {cartCount === 0
                  ? "A few lovely things could be right here."
                  : `${cartCount} ${cartCount === 1 ? "item" : "items"} in your bag`}
              </DialogDescription>
            </DialogHeader>
          </div>

          {cartItems.length > 0 ? (
            <div className="cart-lines">
              {cartItems.map(({ product, quantity }) => (
                <CartItem
                  key={product.id}
                  product={product}
                  quantity={quantity}
                  onIncrease={() => changeQuantity(product.id, 1)}
                  onDecrease={() => changeQuantity(product.id, -1)}
                  onRemove={() => removeFromCart(product.id)}
                />
              ))}
            </div>
          ) : (
            <div className="cart-empty">
              <span className="empty-bag-icon"><ShoppingBag aria-hidden="true" /></span>
              <p>Your bag is waiting for a little something.</p>
              <Button type="button" variant="outline" onClick={() => setCartOpen(false)}>
                Keep browsing
              </Button>
            </div>
          )}

          <div className="cart-panel-footer">
            <div className="cart-total-row">
              <span>Order total</span>
              <strong>{formatNaira(cartSubtotal)}</strong>
            </div>
            <p className="cart-checkout-note">
              You’ll confirm your order with LIZ J COLLECTIONS on WhatsApp.
            </p>
            {checkoutUrl ? (
              <Button asChild className="checkout-button">
                <a href={checkoutUrl} target="_blank" rel="noreferrer">
                  Checkout on WhatsApp <ArrowRight aria-hidden="true" />
                </a>
              </Button>
            ) : (
              <Button type="button" className="checkout-button" disabled>
                Checkout on WhatsApp <ArrowRight aria-hidden="true" />
              </Button>
            )}
          </div>
        </DialogContent>
      </Dialog>
    </div>
  );
}

function ProductCard({
  product,
  added,
  onAdd,
}: {
  product: StoreProduct;
  added: boolean;
  onAdd: () => void;
}) {
  return (
    <article className="product-card">
      <div className="product-media">
        <img className="product-photo" src={product.image} alt={product.name} loading="lazy" />
        <span className="product-category-tag">{product.category}</span>
      </div>
      <div className="product-details">
        <div className="product-title-row">
          <h3>{product.name}</h3>
          <p>{formatNaira(product.price)}</p>
        </div>
        <Button
          type="button"
          variant="outline"
          size="sm"
          className="add-to-bag-button"
          onClick={onAdd}
          aria-label={`Add ${product.name} to bag`}
        >
          <ShoppingBag aria-hidden="true" /> {added ? "Added to bag" : "Add to bag"}
        </Button>
      </div>
    </article>
  );
}

function CartItem({
  product,
  quantity,
  onIncrease,
  onDecrease,
  onRemove,
}: {
  product: StoreProduct;
  quantity: number;
  onIncrease: () => void;
  onDecrease: () => void;
  onRemove: () => void;
}) {
  return (
    <article className="cart-line">
      <img src={product.image} alt="" className="cart-line-image" />
      <div className="cart-line-info">
        <p className="cart-line-category">{product.category}</p>
        <h3>{product.name}</h3>
        <p className="cart-line-price">{formatNaira(product.price)}</p>
        <div className="quantity-control" aria-label={`Quantity for ${product.name}`}>
          <Button
            type="button"
            variant="ghost"
            size="icon"
            className="quantity-button"
            onClick={onDecrease}
            aria-label={`Decrease ${product.name}`}
            title={`Decrease ${product.name}`}
          >
            <Minus aria-hidden="true" />
          </Button>
          <span aria-live="polite">{quantity}</span>
          <Button
            type="button"
            variant="ghost"
            size="icon"
            className="quantity-button"
            onClick={onIncrease}
            aria-label={`Increase ${product.name}`}
            title={`Increase ${product.name}`}
          >
            <Plus aria-hidden="true" />
          </Button>
        </div>
      </div>
      <Button
        type="button"
        variant="ghost"
        size="icon"
        className="remove-item-button"
        onClick={onRemove}
        aria-label={`Remove ${product.name}`}
        title={`Remove ${product.name}`}
      >
        <Trash2 aria-hidden="true" />
      </Button>
    </article>
  );
}
