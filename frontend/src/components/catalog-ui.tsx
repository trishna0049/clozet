"use client";

import { useMemo, useState, type FormEvent } from "react";
import { useRouter } from "next/navigation";
import Image from "next/image";
import Link from "next/link";
import { Heart, Trash2 } from "lucide-react";
import { createClient as createSupabaseBrowserClient } from "@/lib/supabase/client";
import { formatCurrency } from "@/lib/catalog";
import { useStore } from "@/components/providers";
import type { PrintWithMeta, Product } from "@/types/catalog";

function MediaPanel({
  src,
  alt,
  label,
  className = "aspect-[4/5]"
}: {
  src?: string | null;
  alt: string;
  label: string;
  className?: string;
}) {
  return (
    <div className={`relative overflow-hidden bg-gradient-to-br from-sand via-cream to-white ${className}`}>
      {src ? (
        <Image 
          src={src} 
          alt={alt} 
          fill 
          sizes="(max-width: 768px) 100vw, (max-width: 1200px) 50vw, 33vw"
          unoptimized
          className="object-cover transition duration-500 group-hover:scale-105" 
        />
      ) : (
        <div className="flex h-full items-center justify-center p-6 text-center">
          <div>
            <p className="text-xs uppercase tracking-[0.35em] text-cocoa/45">Cloudinary ready</p>
            <p className="mt-3 font-display text-3xl text-cocoa">{label}</p>
            <p className="mt-2 text-sm leading-6 text-cocoa/60">Upload visuals later to bring this card to life.</p>
          </div>
        </div>
      )}
    </div>
  );
}

export function SectionHeader({
  eyebrow,
  title,
  description,
  actionLabel,
  actionHref,
  compact
}: {
  eyebrow: string;
  title: string;
  description: string;
  actionLabel?: string;
  actionHref?: string;
  compact?: boolean;
}) {
  const eyebrowClass = compact
    ? "text-[10px] uppercase tracking-[0.35em] text-cocoa/60"
    : "text-xs uppercase tracking-[0.45em] text-cocoa/60";

  const titleClass = compact
    ? "mt-2 font-display text-3xl leading-tight text-cocoa md:text-4xl"
    : "mt-3 font-display text-4xl leading-tight text-cocoa md:text-5xl";

  const descClass = compact
    ? "mt-2 text-sm leading-6 text-cocoa/72"
    : "mt-4 text-base leading-7 text-cocoa/72";

  const actionClass = compact
    ? "inline-flex w-fit rounded-full border border-cocoa/15 bg-white px-4 py-2 text-sm font-medium text-cocoa transition hover:-translate-y-0.5"
    : "inline-flex w-fit rounded-full border border-cocoa/15 bg-white px-5 py-3 text-sm font-medium text-cocoa transition hover:-translate-y-0.5";

  return (
    <div className="flex flex-col gap-3 md:flex-row md:items-end md:justify-between">
      <div className="max-w-2xl">
        <p className={eyebrowClass}>{eyebrow}</p>
        <h2 className={titleClass}>{title}</h2>
        <p className={descClass}>{description}</p>
      </div>

      {actionLabel && actionHref ? (
        <Link href={actionHref} className={actionClass}>
          {actionLabel}
        </Link>
      ) : null}
    </div>
  );
}

export function PrintCard({ item }: { item: PrintWithMeta }) {
  const { toggleWishlist, wishlist } = useStore();
  const printId = `print:${item.slug}`;
  const wishlisted = wishlist.includes(printId);

  return (
    <article className="overflow-hidden rounded-[2rem] border border-white/60 bg-white shadow-soft transition duration-300 hover:-translate-y-1 flex flex-col h-full">
      <Link
        href={`/prints/${encodeURIComponent(item.slug)}`}
        className="group block"
      >
        <MediaPanel
          src={item.image}
          alt={item.name}
          label={`${item.name} print artwork`}
          className="aspect-[4/5]"
        />
      </Link>

      <div className="flex-1 flex flex-col px-5 py-4 gap-3">
        <div className="flex items-start justify-between gap-2">
          <Link href={`/prints/${encodeURIComponent(item.slug)}`} className="flex-1 min-w-0">
            <div>
              <p className="text-xs uppercase tracking-[0.28em] text-cocoa/50 line-clamp-1">{item.category}</p>
              <h3 className="font-display text-2xl text-cocoa leading-tight line-clamp-1">{item.name}</h3>
              <p className="mt-1 text-xs text-cocoa/60 line-clamp-2">{item.description}</p>
            </div>
          </Link>
          <button
            type="button"
            onClick={() => toggleWishlist(printId)}
            className="rounded-full p-2 hover:bg-cream transition flex-shrink-0"
            aria-label={wishlisted ? "Remove print from wishlist" : "Add print to wishlist"}
          >
            <Heart
              size={22}
              className={wishlisted ? "fill-cocoa text-cocoa" : "text-cocoa/30"}
            />
          </button>
        </div>

        <div className="flex items-center justify-between mt-auto">
          <span className="text-base text-cocoa line-clamp-1">From {formatCurrency(item.startingPrice)}</span>
          <span className="rounded-full bg-sand px-2.5 py-1 text-xs uppercase tracking-[0.28em] text-cocoa whitespace-nowrap">
            {item.silhouettesCount} styles
          </span>
        </div>
      </div>
    </article>
  );
}

export function ProductCard({
  product,
  printName,
  compact = false
}: {
  product: Product;
  printName: string;
  compact?: boolean;
}) {
  console.count(`ProductCard ${product.slug}`);
  const { addToCart, toggleWishlist, wishlist } = useStore();
  const wishlisted = wishlist.includes(product.slug);
  const [selectedSize, setSelectedSize] = useState<string | null>(null);
  const [isAdded, setIsAdded] = useState(false);
  const [showSizeChart, setShowSizeChart] = useState(false);

  return (
    <article className={`overflow-hidden rounded-[1.8rem] border border-white/60 bg-white shadow-soft ${compact ? "max-h-[calc(100vh-8rem)]" : ""}`}>
      <div className="relative">
        <Link href={`/product/${encodeURIComponent(product.slug)}`} className="group block">
          <MediaPanel
            src={product.images[0] ?? null}
            alt={product.title}
            label={`${product.silhouette} image`}
            className={compact ? "aspect-[5/6]" : "aspect-[4/5]"}
          />
        </Link>
        <button
          type="button"
          onClick={() => setShowSizeChart(true)}
          className="absolute bottom-3 right-3 z-10 rounded-full border border-cocoa/15 bg-white/70 px-2 py-1 text-[10px] font-semibold uppercase tracking-[0.24em] text-cocoa shadow-sm backdrop-blur-sm transition hover:bg-white/90"
        >
          Size chart
        </button>
      </div>

      <div className={`flex flex-col h-full min-h-0 ${compact ? "space-y-2 px-4 py-4" : "space-y-3 px-5 py-5"}`}>
        <div className="flex items-start justify-between gap-3">
          <div className="flex-1 min-w-0">
            <p className="text-xs uppercase tracking-[0.35em] text-cocoa/50 line-clamp-1">{printName}</p>
            <Link href={`/product/${encodeURIComponent(product.slug)}`} className="mt-2 block">
              <h3 className={`font-display leading-none text-cocoa line-clamp-1 ${compact ? "text-2xl" : "text-3xl"}`}>{product.silhouette}</h3>
            </Link>
          </div>
          <button
            type="button"
            onClick={() => toggleWishlist(product.slug)}
            className="rounded-full p-2 hover:bg-cream transition flex-shrink-0"
            aria-label={wishlisted ? "Remove from wishlist" : "Add to wishlist"}
          >
            <Heart
              size={20}
              className={wishlisted ? "fill-cocoa text-cocoa" : "text-cocoa/30"}
            />
          </button>
        </div>

        {product.badge ? (
          <p className={`w-fit rounded-full bg-cream ${compact ? "px-2 py-0.5 text-[9px]" : "px-3 py-1 text-xs"} uppercase tracking-[0.28em] text-cocoa/80 line-clamp-1`}>
            {product.badge}
          </p>
        ) : null}

        <p className="text-sm leading-6 text-cocoa/70 line-clamp-2">
          {product.description ?? "Description coming soon."}
        </p>

        <div className="flex items-center justify-between text-sm text-cocoa">
          <span>{formatCurrency(product.price)}</span>
        </div>

        <div className="flex gap-2 flex-wrap">
          {(product.sizes.length ? product.sizes : ["XS", "S", "M", "L", "XL"]).map((size) => (
            <button
              key={size}
              type="button"
              onClick={() => setSelectedSize(size)}
              className={`rounded-full border ${compact ? "px-2.5 py-1 text-[9px]" : "px-3 py-1 text-xs"} uppercase tracking-[0.25em] transition ${
                selectedSize === size
                  ? "border-cocoa bg-cocoa text-cream"
                  : "border-cocoa/15 bg-transparent text-cocoa hover:border-cocoa/30"
              }`}
            >
              {size}
            </button>
          ))}
        </div>

        {showSizeChart && (
          <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/40 px-4 py-6">
            <div className="w-full max-w-2xl rounded-[1.5rem] bg-white p-6 shadow-soft">
              <div className="flex items-start justify-between gap-4 mb-6">
                <div>
                  <h2 className="text-2xl font-display text-cocoa">Size chart</h2>
                  <p className="text-sm text-cocoa/70">Find the right fit for your print.</p>
                </div>
                <button
                  type="button"
                  onClick={() => setShowSizeChart(false)}
                  className="rounded-full border border-cocoa/15 bg-white p-2 text-cocoa hover:bg-cocoa/5"
                  aria-label="Close size chart"
                >
                  ✕
                </button>
              </div>
              <div className="overflow-x-auto">
                <table className="w-full border-collapse text-sm text-cocoa">
                  <thead>
                    <tr className="bg-cream text-left text-xs uppercase tracking-[0.3em] text-cocoa/70">
                      <th className="border-b border-cocoa/10 px-3 py-3">Size</th>
                      <th className="border-b border-cocoa/10 px-3 py-3">Bust</th>
                      <th className="border-b border-cocoa/10 px-3 py-3">Waist</th>
                      <th className="border-b border-cocoa/10 px-3 py-3">Hip</th>
                    </tr>
                  </thead>
                  <tbody>
                    <tr className="border-b border-cocoa/10">
                      <td className="px-3 py-3 font-semibold">S</td>
                      <td className="px-3 py-3">34–35 in (86–89 cm)</td>
                      <td className="px-3 py-3">28–29 in (71–74 cm)</td>
                      <td className="px-3 py-3">37–38 in (94–97 cm)</td>
                    </tr>
                    <tr className="border-b border-cocoa/10 bg-cream/50">
                      <td className="px-3 py-3 font-semibold">M</td>
                      <td className="px-3 py-3">36–37 in (91–94 cm)</td>
                      <td className="px-3 py-3">30–31 in (76–79 cm)</td>
                      <td className="px-3 py-3">39–40 in (99–102 cm)</td>
                    </tr>
                    <tr>
                      <td className="px-3 py-3 font-semibold">L</td>
                      <td className="px-3 py-3">38–39 in (97–99 cm)</td>
                      <td className="px-3 py-3">32–33 in (81–84 cm)</td>
                      <td className="px-3 py-3">41–42 in (104–107 cm)</td>
                    </tr>
                  </tbody>
                </table>
              </div>
            </div>
          </div>
        )}

        {!compact && (
          <button
            type="button"
            onClick={() => {
              if (!selectedSize) {
                alert("Please select a size before adding to cart");
                return;
              }

              addToCart(product, printName, selectedSize);
              setIsAdded(true);
              setTimeout(() => setIsAdded(false), 2000);
            }}
            className={`w-full rounded-full px-5 py-3 text-sm font-medium transition hover:-translate-y-0.5 ${
              isAdded ? "bg-leaf text-cream" : "bg-cocoa text-cream"
            }`}
          >
            {isAdded ? "✓ Added to cart" : "Add to cart"}
          </button>
        )}
      </div>
    </article>
  );
}

export function ProductPurchasePanel({
  product,
  printName
}: {
  product: Product;
  printName: string;
}) {
  const { addToCart, toggleWishlist, wishlist } = useStore();
  const [selectedSize, setSelectedSize] = useState<string | null>(null);
  const [isAdded, setIsAdded] = useState(false);
  const wishlisted = wishlist.includes(product.slug);

  return (
    <div className="rounded-[2rem] border border-white/70 bg-white p-6 shadow-soft">
      <div className="flex items-center justify-between gap-4">
        <div>
          <p className="text-xs uppercase tracking-[0.4em] text-cocoa/50">{printName}</p>
          <h1 className="mt-3 font-display text-5xl leading-none text-cocoa">{product.silhouette}</h1>
        </div>
        {product.badge ? (
          <span className="rounded-full bg-sand px-4 py-2 text-xs uppercase tracking-[0.28em] text-cocoa">
            {product.badge}
          </span>
        ) : null}
      </div>

      <p className="mt-5 text-2xl text-cocoa">{formatCurrency(product.price)}</p>
      <p className="mt-4 text-base leading-7 text-cocoa/72">
        {product.description ?? "Product story and fit notes will appear here."}
      </p>

      <div className="mt-6">
        <p className="text-sm font-semibold uppercase tracking-[0.25em] text-cocoa">Sizes</p>
        <div className="mt-3 flex flex-wrap gap-3">
          {(product.sizes.length ? product.sizes : ["XS", "S", "M", "L", "XL"]).map((size) => (
            <button
              key={size}
              type="button"
              onClick={() => setSelectedSize(size)}
              className={`rounded-full border px-4 py-2 text-sm transition ${
                selectedSize === size
                  ? "border-cocoa bg-cocoa text-cream"
                  : "border-cocoa/15 bg-transparent text-cocoa"
              }`}
            >
              {size}
            </button>
          ))}
        </div>
      </div>

      <div className="mt-6 grid gap-4 rounded-[1.5rem] bg-cream p-4 text-sm text-cocoa/75">
        <div className="flex justify-between">
          <span>Fabric</span>
          <span>{product.fabric ?? "To be added"}</span>
        </div>
        <div className="flex justify-between">
          <span>Fit</span>
          <span>{product.fit ?? "Fit notes coming soon"}</span>
        </div>
        <div className="flex justify-between">
          <span>Stock</span>
          <span>Only {product.inventory} left</span>
        </div>
      </div>

      <ul className="mt-6 space-y-2 text-sm leading-6 text-cocoa/72">
        {product.details.map((detail) => (
          <li key={detail}>• {detail}</li>
        ))}
      </ul>

      <div className="mt-8 grid gap-3 md:grid-cols-2">
        <button
          type="button"
          onClick={() => {
            if (!selectedSize) {
              alert("Please select a size before adding to cart");
              return;
            }
            addToCart(product, printName, selectedSize);
            setIsAdded(true);
            setTimeout(() => setIsAdded(false), 2000);
          }}
          className={`rounded-full px-5 py-3 text-sm font-medium transition hover:-translate-y-0.5 ${
            isAdded
              ? "bg-leaf text-cream"
              : "bg-cocoa text-cream"
          }`}
        >
          {isAdded ? "✓ Added to cart" : "Add to cart"}
        </button>
        <button
          type="button"
          onClick={() => toggleWishlist(product.slug)}
          className={`rounded-full border px-5 py-3 text-sm font-medium transition ${
            wishlisted
              ? "border-cocoa bg-cocoa text-cream"
              : "border-cocoa/15 bg-white text-cocoa hover:border-cocoa/30"
          }`}
        >
          {wishlisted ? "✓ Saved to wishlist" : "Save to wishlist"}
        </button>
      </div>
    </div>
  );
}

export function ReviewCard({
  name,
  city,
  quote,
  rating
}: {
  name: string;
  city: string;
  quote: string;
  rating: number;
}) {
  return (
    <article className="rounded-[1.8rem] border border-white/60 bg-white p-6 shadow-soft">
      <p className="text-sm uppercase tracking-[0.28em] text-cocoa/50">
        {"★".repeat(rating)} <span className="ml-2">{city}</span>
      </p>
      <p className="mt-4 text-lg leading-8 text-cocoa/75">“{quote}”</p>
      <p className="mt-5 font-display text-3xl text-cocoa">{name}</p>
    </article>
  );
}

export function GalleryCard({ image, caption }: { image: string; caption: string }) {
  return (
    <div className="group overflow-hidden rounded-[1.8rem] bg-white shadow-soft">
      <MediaPanel src={image || null} alt={caption} label={caption} className="aspect-[4/5]" />
      <div className="px-4 py-4 text-sm uppercase tracking-[0.28em] text-cocoa/70">{caption}</div>
    </div>
  );
}

export function CartExperience({
  suggestedProducts,
  printNames
}: {
  suggestedProducts: Product[];
  printNames: Record<string, string>;
}) {
  const router = useRouter();
  const { cart, removeFromCart, subtotal, updateQuantity } = useStore();

  return (
    <div className="space-y-10">
      <section className="grid gap-6 lg:grid-cols-[1.35fr_0.65fr]">
        <div className="space-y-4">
          {cart.length === 0 ? (
            <div className="rounded-[2rem] border border-dashed border-cocoa/20 bg-white p-8 text-cocoa/70">
              Your cart is empty. Start with a print, then choose the silhouette that fits your mood.
            </div>
          ) : (
            cart.map((item) => (
              <div
                key={`${item.slug}-${item.size}`}
                onClick={() => router.push(`/product/${encodeURIComponent(item.slug)}`)}
                className="grid gap-4 rounded-[2rem] border border-white/60 bg-white p-4 shadow-soft md:grid-cols-[140px_1fr] transition hover:shadow-md hover:border-white/80 cursor-pointer"
              >
                <MediaPanel
                  src={item.image || null}
                  alt={item.title}
                  label={`${item.silhouette} preview`}
                  className="aspect-square rounded-[1.5rem]"
                />
                <div className="space-y-3 flex flex-col">
                  <div className="flex flex-wrap items-start justify-between gap-4">
                    <div>
                      <p className="text-xs uppercase tracking-[0.35em] text-cocoa/50">
                        {item.printName}
                      </p>
                      <h2 className="mt-2 font-display text-3xl text-cocoa">{item.silhouette}</h2>
                      <p className="text-sm text-cocoa/65">Size {item.size}</p>
                    </div>
                    <p className="text-lg text-cocoa">{formatCurrency(item.price)}</p>
                  </div>

                  <div className="flex items-center justify-between mt-auto" onClick={(e) => e.stopPropagation()}>
                    <div className="flex items-center gap-3">
                      <button
                        type="button"
                        onClick={(e) => {
                          e.stopPropagation();
                          if (item.quantity === 1) {
                            removeFromCart(item.slug, item.size);
                          } else {
                            updateQuantity(item.slug, item.size, item.quantity - 1);
                          }
                        }}
                        className="h-10 w-10 rounded-full border border-cocoa/15 text-cocoa"
                      >
                        -
                      </button>
                      <span className="w-8 text-center text-cocoa">{item.quantity}</span>
                      <button
                        type="button"
                        onClick={(e) => {
                          e.stopPropagation();
                          updateQuantity(item.slug, item.size, item.quantity + 1);
                        }}
                        className="h-10 w-10 rounded-full border border-cocoa/15 text-cocoa"
                      >
                        +
                      </button>
                    </div>
                    <button
                      type="button"
                      onClick={(e) => {
                        e.stopPropagation();
                        removeFromCart(item.slug, item.size);
                      }}
                      className="text-cocoa/40 hover:text-cocoa transition"
                      title="Remove from cart"
                    >
                      <Trash2 size={20} />
                    </button>
                  </div>
                </div>
              </div>
            ))
          )}
        </div>

        <aside className="h-fit rounded-[2rem] border border-white/70 bg-white p-6 shadow-soft">
          <p className="text-xs uppercase tracking-[0.4em] text-cocoa/50">Order Summary</p>
          <div className="mt-6 space-y-4 text-sm text-cocoa/75">
            <div className="flex justify-between">
              <span>Subtotal</span>
              <span>{formatCurrency(subtotal)}</span>
            </div>
            <div className="flex justify-between">
              <span>Shipping</span>
              <span>{cart.length ? "Free" : "Calculated later"}</span>
            </div>
            <div className="flex justify-between">
              <span>Limited print handling</span>
              <span>{cart.length ? "Included" : "-"}</span>
            </div>
          </div>
          <Link
            href="/checkout"
            className="mt-8 block rounded-full bg-cocoa px-5 py-3 text-center text-sm font-medium text-cream"
          >
            Continue to checkout
          </Link>
        </aside>
      </section>

      <section className="space-y-6">
        <SectionHeader
          eyebrow="Keep the print story going"
          title="More silhouettes to pair with your cart"
          description="Since Clozet is print-first, the smartest cross-sell is often another form in the same print family."
        />
        <div className="grid gap-6 md:grid-cols-2 xl:grid-cols-4">
          {suggestedProducts.map((product) => (
            <ProductCard
              key={product.slug}
              product={product}
              printName={printNames[product.printId] ?? "Clozet Print"}
            />
          ))}
        </div>
      </section>
    </div>
  );
}

export function CheckoutExperience() {
  const { cart, subtotal, clearCart } = useStore();
  const [placed, setPlaced] = useState(false);

  return (
    <div className="grid gap-6 lg:grid-cols-[1.15fr_0.85fr]">
      <form
        className="rounded-[2rem] border border-white/70 bg-white p-6 shadow-soft"
        onSubmit={(event) => {
          event.preventDefault();
          setPlaced(true);
          clearCart();
        }}
      >
        <p className="text-xs uppercase tracking-[0.4em] text-cocoa/50">Shipping & Payment</p>
        <div className="mt-6 grid gap-4 md:grid-cols-2">
          <input className="input-field" placeholder="Full name" required />
          <input className="input-field" placeholder="Phone number" required />
          <input className="input-field md:col-span-2" placeholder="Street address" required />
          <input className="input-field" placeholder="City" required />
          <input className="input-field" placeholder="Pincode" required />
          <input className="input-field" placeholder="State" required />
          <select className="input-field">
            <option>Cash on Delivery</option>
            <option>UPI / Card placeholder</option>
          </select>
        </div>

        <div className="mt-8 rounded-[1.5rem] bg-cream p-4 text-sm leading-7 text-cocoa/75">
          Next integration step: create an order in Supabase and then attach payment confirmation to it.
        </div>

        <button
          type="submit"
          disabled={cart.length === 0}
          className="mt-8 rounded-full bg-cocoa px-5 py-3 text-sm font-medium text-cream disabled:cursor-not-allowed disabled:opacity-50"
        >
          {cart.length ? "Place order" : "Cart is empty"}
        </button>

        {placed ? (
          <p className="mt-4 text-sm text-leaf">
            Demo checkout completed. Persist this into the `orders` and `order_items` tables next.
          </p>
        ) : null}
      </form>

      <aside className="rounded-[2rem] border border-white/70 bg-white p-6 shadow-soft">
        <p className="text-xs uppercase tracking-[0.4em] text-cocoa/50">Order Summary</p>
        <div className="mt-6 space-y-4">
          {cart.map((item) => (
            <div key={`${item.slug}-${item.size}`} className="flex justify-between gap-4 text-sm text-cocoa/72">
              <div>
                <p>{item.silhouette}</p>
                <p className="text-cocoa/50">
                  {item.printName} · {item.size} · Qty {item.quantity}
                </p>
              </div>
              <span>{formatCurrency(item.price * item.quantity)}</span>
            </div>
          ))}
        </div>
        <div className="mt-8 border-t border-cocoa/10 pt-4 text-sm text-cocoa/75">
          <div className="flex justify-between">
            <span>Total</span>
            <span>{formatCurrency(subtotal)}</span>
          </div>
        </div>
      </aside>
    </div>
  );
}

export function AccountExperience() {
  const { wishlist } = useStore();
  const [mode, setMode] = useState<"login" | "signup">("login");
  const [message, setMessage] = useState("");
  const [isSuccess, setIsSuccess] = useState(false);

  async function handleAuth(event: FormEvent<HTMLFormElement>) {
    event.preventDefault();
    const supabase = createSupabaseBrowserClient();
    const formData = new FormData(event.currentTarget);
    const email = String(formData.get("email") ?? "");
    const password = String(formData.get("password") ?? "");

    if (mode === "signup") {
      const name = String(formData.get("name") ?? "");
      const { error } = await supabase.auth.signUp({
        email,
        password,
        options: {
          data: {
            full_name: name
          }
        }
      });
      if (error) {
        setMessage(error.message);
        setIsSuccess(false);
      } else {
        setMessage("✓ Account created successfully! Check your email to verify.");
        setIsSuccess(true);
        setTimeout(() => {
          window.location.href = "/account";
        }, 2000);
      }
      return;
    }

    const { error } = await supabase.auth.signInWithPassword({
      email,
      password
    });

    if (error) {
      setMessage(error.message);
      setIsSuccess(false);
    } else {
      setMessage("✓ You are now logged in!");
      setIsSuccess(true);
      setTimeout(() => {
        window.location.href = "/account";
      }, 1500);
    }
  }

  return (
    <div className="grid gap-6 xl:grid-cols-[0.9fr_1.1fr]">
      <section className="rounded-[2rem] border border-white/70 bg-white p-6 shadow-soft">
        <div className="flex gap-3">
          {(["login", "signup"] as const).map((item) => (
            <button
              key={item}
              type="button"
              onClick={() => setMode(item)}
              className={`rounded-full px-4 py-2 text-sm uppercase tracking-[0.25em] ${
                mode === item ? "bg-cocoa text-cream" : "bg-cream text-cocoa"
              }`}
            >
              {item}
            </button>
          ))}
        </div>

        <form className="mt-6 space-y-4" onSubmit={handleAuth}>
          {mode === "signup" ? <input name="name" className="input-field" placeholder="Name" /> : null}
          <input name="email" type="email" className="input-field" placeholder="Email" required />
          <input
            name="password"
            type="password"
            className="input-field"
            placeholder="Password"
            required
          />
          <button
            type="submit"
            className="rounded-full bg-cocoa px-5 py-3 text-sm font-medium text-cream"
          >
            {mode === "signup" ? "Create account" : "Login"}
          </button>
        </form>

        {message ? (
          <p className={`mt-4 text-sm ${isSuccess ? "text-green-600" : "text-red-600"}`}>{message}</p>
        ) : null}

        <div className="mt-8 rounded-[1.5rem] bg-cream p-4 text-sm leading-7 text-cocoa/72">
          Use the <Link href="/login" className="font-medium text-cocoa underline">dedicated login page</Link> for Google/Apple authentication and password recovery.
        </div>
      </section>

      <section className="space-y-6">
        <div className="rounded-[2rem] border border-white/70 bg-white p-6 shadow-soft">
          <p className="text-xs uppercase tracking-[0.4em] text-cocoa/50 font-medium">Recent Orders</p>
          <div className="mt-6 text-center py-8">
            <p className="text-cocoa/50 text-sm">No orders yet</p>
            <p className="text-cocoa/40 text-xs mt-1">Your orders will appear here once you place your first order</p>
          </div>
        </div>

        <div className="rounded-[2rem] border border-white/70 bg-white p-6 shadow-soft">
          <p className="text-xs uppercase tracking-[0.4em] text-cocoa/50 font-medium">Saved Addresses</p>
          <div className="mt-6 text-center py-8">
            <p className="text-cocoa/50 text-sm">No saved addresses</p>
            <p className="text-cocoa/40 text-xs mt-1">Add addresses during checkout for faster ordering</p>
          </div>
        </div>
      </section>
    </div>
  );
}
