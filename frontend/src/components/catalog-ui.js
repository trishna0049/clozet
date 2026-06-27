"use client";
"use strict";
var __awaiter = (this && this.__awaiter) || function (thisArg, _arguments, P, generator) {
    function adopt(value) { return value instanceof P ? value : new P(function (resolve) { resolve(value); }); }
    return new (P || (P = Promise))(function (resolve, reject) {
        function fulfilled(value) { try { step(generator.next(value)); } catch (e) { reject(e); } }
        function rejected(value) { try { step(generator["throw"](value)); } catch (e) { reject(e); } }
        function step(result) { result.done ? resolve(result.value) : adopt(result.value).then(fulfilled, rejected); }
        step((generator = generator.apply(thisArg, _arguments || [])).next());
    });
};
var __generator = (this && this.__generator) || function (thisArg, body) {
    var _ = { label: 0, sent: function() { if (t[0] & 1) throw t[1]; return t[1]; }, trys: [], ops: [] }, f, y, t, g = Object.create((typeof Iterator === "function" ? Iterator : Object).prototype);
    return g.next = verb(0), g["throw"] = verb(1), g["return"] = verb(2), typeof Symbol === "function" && (g[Symbol.iterator] = function() { return this; }), g;
    function verb(n) { return function (v) { return step([n, v]); }; }
    function step(op) {
        if (f) throw new TypeError("Generator is already executing.");
        while (g && (g = 0, op[0] && (_ = 0)), _) try {
            if (f = 1, y && (t = op[0] & 2 ? y["return"] : op[0] ? y["throw"] || ((t = y["return"]) && t.call(y), 0) : y.next) && !(t = t.call(y, op[1])).done) return t;
            if (y = 0, t) op = [op[0] & 2, t.value];
            switch (op[0]) {
                case 0: case 1: t = op; break;
                case 4: _.label++; return { value: op[1], done: false };
                case 5: _.label++; y = op[1]; op = [0]; continue;
                case 7: op = _.ops.pop(); _.trys.pop(); continue;
                default:
                    if (!(t = _.trys, t = t.length > 0 && t[t.length - 1]) && (op[0] === 6 || op[0] === 2)) { _ = 0; continue; }
                    if (op[0] === 3 && (!t || (op[1] > t[0] && op[1] < t[3]))) { _.label = op[1]; break; }
                    if (op[0] === 6 && _.label < t[1]) { _.label = t[1]; t = op; break; }
                    if (t && _.label < t[2]) { _.label = t[2]; _.ops.push(op); break; }
                    if (t[2]) _.ops.pop();
                    _.trys.pop(); continue;
            }
            op = body.call(thisArg, _);
        } catch (e) { op = [6, e]; y = 0; } finally { f = t = 0; }
        if (op[0] & 5) throw op[1]; return { value: op[0] ? op[1] : void 0, done: true };
    }
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.SectionHeader = SectionHeader;
exports.PrintCard = PrintCard;
exports.ProductCard = ProductCard;
exports.ProductPurchasePanel = ProductPurchasePanel;
exports.ReviewCard = ReviewCard;
exports.GalleryCard = GalleryCard;
exports.CartExperience = CartExperience;
exports.CheckoutExperience = CheckoutExperience;
exports.AccountExperience = AccountExperience;
var react_1 = require("react");
var navigation_1 = require("next/navigation");
var image_1 = require("next/image");
var link_1 = require("next/link");
var lucide_react_1 = require("lucide-react");
var client_1 = require("@/lib/supabase/client");
var catalog_1 = require("@/lib/catalog");
var providers_1 = require("@/components/providers");
function MediaPanel(_a) {
    var src = _a.src, alt = _a.alt, label = _a.label, _b = _a.className, className = _b === void 0 ? "aspect-[4/5]" : _b;
    return (<div className={"relative overflow-hidden bg-gradient-to-br from-sand via-cream to-white ".concat(className)}>
      {src ? (<image_1.default src={src} alt={alt} fill sizes="(max-width: 768px) 100vw, (max-width: 1200px) 50vw, 33vw" unoptimized className="object-cover transition duration-500 group-hover:scale-105"/>) : (<div className="flex h-full items-center justify-center p-6 text-center">
          <div>
            <p className="text-xs uppercase tracking-[0.35em] text-cocoa/45">Cloudinary ready</p>
            <p className="mt-3 font-display text-3xl text-cocoa">{label}</p>
            <p className="mt-2 text-sm leading-6 text-cocoa/60">Upload visuals later to bring this card to life.</p>
          </div>
        </div>)}
    </div>);
}
function SectionHeader(_a) {
    var eyebrow = _a.eyebrow, title = _a.title, description = _a.description, actionLabel = _a.actionLabel, actionHref = _a.actionHref, compact = _a.compact;
    var eyebrowClass = compact
        ? "text-[10px] uppercase tracking-[0.35em] text-cocoa/60"
        : "text-xs uppercase tracking-[0.45em] text-cocoa/60";
    var titleClass = compact
        ? "mt-2 font-display text-3xl leading-tight text-cocoa md:text-4xl"
        : "mt-3 font-display text-4xl leading-tight text-cocoa md:text-5xl";
    var descClass = compact
        ? "mt-2 text-sm leading-6 text-cocoa/72"
        : "mt-4 text-base leading-7 text-cocoa/72";
    var actionClass = compact
        ? "inline-flex w-fit rounded-full border border-cocoa/15 bg-white px-4 py-2 text-sm font-medium text-cocoa transition hover:-translate-y-0.5"
        : "inline-flex w-fit rounded-full border border-cocoa/15 bg-white px-5 py-3 text-sm font-medium text-cocoa transition hover:-translate-y-0.5";
    return (<div className="flex flex-col gap-3 md:flex-row md:items-end md:justify-between">
      <div className="max-w-2xl">
        <p className={eyebrowClass}>{eyebrow}</p>
        <h2 className={titleClass}>{title}</h2>
        <p className={descClass}>{description}</p>
      </div>

      {actionLabel && actionHref ? (<link_1.default href={actionHref} className={actionClass}>
          {actionLabel}
        </link_1.default>) : null}
    </div>);
}
function PrintCard(_a) {
    var item = _a.item;
    var _b = (0, providers_1.useStore)(), toggleWishlist = _b.toggleWishlist, wishlist = _b.wishlist;
    var printId = "print:".concat(item.slug);
    var wishlisted = wishlist.includes(printId);
    return (<article className="overflow-hidden rounded-[2rem] border border-white/60 bg-white shadow-soft transition duration-300 hover:-translate-y-1 flex flex-col h-full">
      <link_1.default href={"/prints/".concat(encodeURIComponent(item.slug))} className="group block">
        <MediaPanel src={item.image} alt={item.name} label={"".concat(item.name, " print artwork")} className="aspect-[4/5]"/>
      </link_1.default>

      <div className="flex-1 flex flex-col px-5 py-4 gap-3">
        <div className="flex items-start justify-between gap-2">
          <link_1.default href={"/prints/".concat(encodeURIComponent(item.slug))} className="flex-1 min-w-0">
            <div>
              <p className="text-xs uppercase tracking-[0.28em] text-cocoa/50 line-clamp-1">{item.category}</p>
              <h3 className="font-display text-2xl text-cocoa leading-tight line-clamp-1">{item.name}</h3>
              <p className="mt-1 text-xs text-cocoa/60 line-clamp-2">{item.description}</p>
            </div>
          </link_1.default>
          <button type="button" onClick={function () { return toggleWishlist(printId); }} className="rounded-full p-2 hover:bg-cream transition flex-shrink-0" aria-label={wishlisted ? "Remove print from wishlist" : "Add print to wishlist"}>
            <lucide_react_1.Heart size={22} className={wishlisted ? "fill-cocoa text-cocoa" : "text-cocoa/30"}/>
          </button>
        </div>

        <div className="flex items-center justify-between mt-auto">
          <span className="text-base text-cocoa line-clamp-1">From {(0, catalog_1.formatCurrency)(item.startingPrice)}</span>
          <span className="rounded-full bg-sand px-2.5 py-1 text-xs uppercase tracking-[0.28em] text-cocoa whitespace-nowrap">
            {item.silhouettesCount} styles
          </span>
        </div>
      </div>
    </article>);
}
function ProductCard(_a) {
    var _b, _c;
    var product = _a.product, printName = _a.printName;
    console.count("ProductCard ".concat(product.slug));
    var _d = (0, providers_1.useStore)(), addToCart = _d.addToCart, toggleWishlist = _d.toggleWishlist, wishlist = _d.wishlist;
    var wishlisted = wishlist.includes(product.slug);
    var _e = (0, react_1.useState)(null), selectedSize = _e[0], setSelectedSize = _e[1];
    var _f = (0, react_1.useState)(false), isAdded = _f[0], setIsAdded = _f[1];
    var _g = (0, react_1.useState)(false), showSizeChart = _g[0], setShowSizeChart = _g[1];
    return (<article className="overflow-hidden rounded-[1.8rem] border border-white/60 bg-white shadow-soft">
      <link_1.default href={"/product/".concat(encodeURIComponent(product.slug))} className="group block">
        <MediaPanel src={(_b = product.images[0]) !== null && _b !== void 0 ? _b : null} alt={product.title} label={"".concat(product.silhouette, " image")} className="aspect-[4/5]"/>
      </link_1.default>

      <div className="space-y-3 px-5 py-5 flex flex-col h-full">
        <div className="flex items-start justify-between gap-3">
          <div className="flex-1 min-w-0">
            <p className="text-xs uppercase tracking-[0.35em] text-cocoa/50 line-clamp-1">{printName}</p>
            <link_1.default href={"/product/".concat(encodeURIComponent(product.slug))} className="mt-2 block">
              <h3 className="font-display text-3xl leading-none text-cocoa line-clamp-1">{product.silhouette}</h3>
            </link_1.default>
          </div>
          <button type="button" onClick={function () { return toggleWishlist(product.slug); }} className="rounded-full p-2 hover:bg-cream transition flex-shrink-0" aria-label={wishlisted ? "Remove from wishlist" : "Add to wishlist"}>
            <lucide_react_1.Heart size={20} className={wishlisted ? "fill-cocoa text-cocoa" : "text-cocoa/30"}/>
          </button>
        </div>

        {product.badge ? (<p className="w-fit rounded-full bg-cream px-3 py-1 text-xs uppercase tracking-[0.28em] text-cocoa/80 line-clamp-1">
            {product.badge}
          </p>) : null}

        <div className="flex items-center justify-between text-sm text-cocoa">
          <span>{(0, catalog_1.formatCurrency)(product.price)}</span>
        </div>

        <div className="flex gap-2 flex-wrap">
          {(product.sizes.length ? product.sizes : ["XS", "S", "M", "L", "XL"]).map(function (size) { return (<button key={size} type="button" onClick={function () { return setSelectedSize(size); }} className={"rounded-full border px-3 py-1 text-xs uppercase tracking-[0.25em] transition ".concat(selectedSize === size
                ? "border-cocoa bg-cocoa text-cream"
                : "border-cocoa/15 bg-transparent text-cocoa hover:border-cocoa/30")}>
              {size}
            </button>); })}
        </div>

        <button type="button" onClick={function () { return setShowSizeChart(true); }} className="w-full rounded-full border border-cocoa/15 bg-white px-5 py-3 text-sm font-medium text-cocoa transition hover:bg-cocoa/5">
          Size chart
        </button>

        {showSizeChart && (<div className="fixed inset-0 z-50 flex items-center justify-center bg-black/40 px-4 py-6">
            <div className="w-full max-w-2xl rounded-[1.5rem] bg-white p-6 shadow-soft">
              <div className="flex items-start justify-between gap-4 mb-6">
                <div>
                  <h2 className="text-2xl font-display text-cocoa">Size chart</h2>
                  <p className="text-sm text-cocoa/70">Find the right fit for your print.</p>
                </div>
                <button type="button" onClick={function () { return setShowSizeChart(false); }} className="rounded-full border border-cocoa/15 bg-white p-2 text-cocoa hover:bg-cocoa/5" aria-label="Close size chart">
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
          </div>)}

        <button type="button" onClick={function () {
            if (!selectedSize) {
                alert("Please select a size before adding to cart");
                return;
            }
            addToCart(product, printName, selectedSize);
            setIsAdded(true);
            setTimeout(function () { return setIsAdded(false); }, 2000);
        }} className={"w-full rounded-full px-5 py-3 text-sm font-medium transition hover:-translate-y-0.5 ".concat(isAdded ? "bg-leaf text-cream" : "bg-cocoa text-cream")}>
          {isAdded ? "✓ Added to cart" : "Add to cart"}
        </button>
      </div>
    </article>);
}
function ProductPurchasePanel(_a) {
    var _b, _c, _d;
    var product = _a.product, printName = _a.printName;
    var _e = (0, providers_1.useStore)(), addToCart = _e.addToCart, toggleWishlist = _e.toggleWishlist, wishlist = _e.wishlist;
    var _f = (0, react_1.useState)(null), selectedSize = _f[0], setSelectedSize = _f[1];
    var _g = (0, react_1.useState)(false), isAdded = _g[0], setIsAdded = _g[1];
    var wishlisted = wishlist.includes(product.slug);
    return (<div className="rounded-[2rem] border border-white/70 bg-white p-6 shadow-soft">
      <div className="flex items-center justify-between gap-4">
        <div>
          <p className="text-xs uppercase tracking-[0.4em] text-cocoa/50">{printName}</p>
          <h1 className="mt-3 font-display text-5xl leading-none text-cocoa">{product.silhouette}</h1>
        </div>
        {product.badge ? (<span className="rounded-full bg-sand px-4 py-2 text-xs uppercase tracking-[0.28em] text-cocoa">
            {product.badge}
          </span>) : null}
      </div>

      <p className="mt-5 text-2xl text-cocoa">{(0, catalog_1.formatCurrency)(product.price)}</p>
      <p className="mt-4 text-base leading-7 text-cocoa/72">
        {(_b = product.description) !== null && _b !== void 0 ? _b : "Product story and fit notes will appear here."}
      </p>

      <div className="mt-6">
        <p className="text-sm font-semibold uppercase tracking-[0.25em] text-cocoa">Sizes</p>
        <div className="mt-3 flex flex-wrap gap-3">
          {(product.sizes.length ? product.sizes : ["XS", "S", "M", "L", "XL"]).map(function (size) { return (<button key={size} type="button" onClick={function () { return setSelectedSize(size); }} className={"rounded-full border px-4 py-2 text-sm transition ".concat(selectedSize === size
                ? "border-cocoa bg-cocoa text-cream"
                : "border-cocoa/15 bg-transparent text-cocoa")}>
              {size}
            </button>); })}
        </div>
      </div>

      <div className="mt-6 grid gap-4 rounded-[1.5rem] bg-cream p-4 text-sm text-cocoa/75">
        <div className="flex justify-between">
          <span>Fabric</span>
          <span>{(_c = product.fabric) !== null && _c !== void 0 ? _c : "To be added"}</span>
        </div>
        <div className="flex justify-between">
          <span>Fit</span>
          <span>{(_d = product.fit) !== null && _d !== void 0 ? _d : "Fit notes coming soon"}</span>
        </div>
        <div className="flex justify-between">
          <span>Stock</span>
          <span>Only {product.inventory} left</span>
        </div>
      </div>

      <ul className="mt-6 space-y-2 text-sm leading-6 text-cocoa/72">
        {product.details.map(function (detail) { return (<li key={detail}>• {detail}</li>); })}
      </ul>

      <div className="mt-8 grid gap-3 md:grid-cols-2">
        <button type="button" onClick={function () {
            if (!selectedSize) {
                alert("Please select a size before adding to cart");
                return;
            }
            addToCart(product, printName, selectedSize);
            setIsAdded(true);
            setTimeout(function () { return setIsAdded(false); }, 2000);
        }} className={"rounded-full px-5 py-3 text-sm font-medium transition hover:-translate-y-0.5 ".concat(isAdded
            ? "bg-leaf text-cream"
            : "bg-cocoa text-cream")}>
          {isAdded ? "✓ Added to cart" : "Add to cart"}
        </button>
        <button type="button" onClick={function () { return toggleWishlist(product.slug); }} className={"rounded-full border px-5 py-3 text-sm font-medium transition ".concat(wishlisted
            ? "border-cocoa bg-cocoa text-cream"
            : "border-cocoa/15 bg-white text-cocoa hover:border-cocoa/30")}>
          {wishlisted ? "✓ Saved to wishlist" : "Save to wishlist"}
        </button>
      </div>
    </div>);
}
function ReviewCard(_a) {
    var name = _a.name, city = _a.city, quote = _a.quote, rating = _a.rating;
    return (<article className="rounded-[1.8rem] border border-white/60 bg-white p-6 shadow-soft">
      <p className="text-sm uppercase tracking-[0.28em] text-cocoa/50">
        {"★".repeat(rating)} <span className="ml-2">{city}</span>
      </p>
      <p className="mt-4 text-lg leading-8 text-cocoa/75">“{quote}”</p>
      <p className="mt-5 font-display text-3xl text-cocoa">{name}</p>
    </article>);
}
function GalleryCard(_a) {
    var image = _a.image, caption = _a.caption;
    return (<div className="group overflow-hidden rounded-[1.8rem] bg-white shadow-soft">
      <MediaPanel src={image || null} alt={caption} label={caption} className="aspect-[4/5]"/>
      <div className="px-4 py-4 text-sm uppercase tracking-[0.28em] text-cocoa/70">{caption}</div>
    </div>);
}
function CartExperience(_a) {
    var suggestedProducts = _a.suggestedProducts, printNames = _a.printNames;
    var router = (0, navigation_1.useRouter)();
    var _b = (0, providers_1.useStore)(), cart = _b.cart, removeFromCart = _b.removeFromCart, subtotal = _b.subtotal, updateQuantity = _b.updateQuantity;
    return (<div className="space-y-10">
      <section className="grid gap-6 lg:grid-cols-[1.35fr_0.65fr]">
        <div className="space-y-4">
          {cart.length === 0 ? (<div className="rounded-[2rem] border border-dashed border-cocoa/20 bg-white p-8 text-cocoa/70">
              Your cart is empty. Start with a print, then choose the silhouette that fits your mood.
            </div>) : (cart.map(function (item) { return (<div key={"".concat(item.slug, "-").concat(item.size)} onClick={function () { return router.push("/product/".concat(encodeURIComponent(item.slug))); }} className="grid gap-4 rounded-[2rem] border border-white/60 bg-white p-4 shadow-soft md:grid-cols-[140px_1fr] transition hover:shadow-md hover:border-white/80 cursor-pointer">
                <MediaPanel src={item.image || null} alt={item.title} label={"".concat(item.silhouette, " preview")} className="aspect-square rounded-[1.5rem]"/>
                <div className="space-y-3 flex flex-col">
                  <div className="flex flex-wrap items-start justify-between gap-4">
                    <div>
                      <p className="text-xs uppercase tracking-[0.35em] text-cocoa/50">
                        {item.printName}
                      </p>
                      <h2 className="mt-2 font-display text-3xl text-cocoa">{item.silhouette}</h2>
                      <p className="text-sm text-cocoa/65">Size {item.size}</p>
                    </div>
                    <p className="text-lg text-cocoa">{(0, catalog_1.formatCurrency)(item.price)}</p>
                  </div>

                  <div className="flex items-center justify-between mt-auto" onClick={function (e) { return e.stopPropagation(); }}>
                    <div className="flex items-center gap-3">
                      <button type="button" onClick={function (e) {
                e.stopPropagation();
                if (item.quantity === 1) {
                    removeFromCart(item.slug, item.size);
                }
                else {
                    updateQuantity(item.slug, item.size, item.quantity - 1);
                }
            }} className="h-10 w-10 rounded-full border border-cocoa/15 text-cocoa">
                        -
                      </button>
                      <span className="w-8 text-center text-cocoa">{item.quantity}</span>
                      <button type="button" onClick={function (e) {
                e.stopPropagation();
                updateQuantity(item.slug, item.size, item.quantity + 1);
            }} className="h-10 w-10 rounded-full border border-cocoa/15 text-cocoa">
                        +
                      </button>
                    </div>
                    <button type="button" onClick={function (e) {
                e.stopPropagation();
                removeFromCart(item.slug, item.size);
            }} className="text-cocoa/40 hover:text-cocoa transition" title="Remove from cart">
                      <lucide_react_1.Trash2 size={20}/>
                    </button>
                  </div>
                </div>
              </div>); }))}
        </div>

        <aside className="h-fit rounded-[2rem] border border-white/70 bg-white p-6 shadow-soft">
          <p className="text-xs uppercase tracking-[0.4em] text-cocoa/50">Order Summary</p>
          <div className="mt-6 space-y-4 text-sm text-cocoa/75">
            <div className="flex justify-between">
              <span>Subtotal</span>
              <span>{(0, catalog_1.formatCurrency)(subtotal)}</span>
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
          <link_1.default href="/checkout" className="mt-8 block rounded-full bg-cocoa px-5 py-3 text-center text-sm font-medium text-cream">
            Continue to checkout
          </link_1.default>
        </aside>
      </section>

      <section className="space-y-6">
        <SectionHeader eyebrow="Keep the print story going" title="More silhouettes to pair with your cart" description="Since Clozet is print-first, the smartest cross-sell is often another form in the same print family."/>
        <div className="grid gap-6 md:grid-cols-2 xl:grid-cols-4">
          {suggestedProducts.map(function (product) {
            var _a;
            return (<ProductCard key={product.slug} product={product} printName={(_a = printNames[product.printId]) !== null && _a !== void 0 ? _a : "Clozet Print"}/>);
        })}
        </div>
      </section>
    </div>);
}
function CheckoutExperience() {
    var _a = (0, providers_1.useStore)(), cart = _a.cart, subtotal = _a.subtotal, clearCart = _a.clearCart;
    var _b = (0, react_1.useState)(false), placed = _b[0], setPlaced = _b[1];
    return (<div className="grid gap-6 lg:grid-cols-[1.15fr_0.85fr]">
      <form className="rounded-[2rem] border border-white/70 bg-white p-6 shadow-soft" onSubmit={function (event) {
            event.preventDefault();
            setPlaced(true);
            clearCart();
        }}>
        <p className="text-xs uppercase tracking-[0.4em] text-cocoa/50">Shipping & Payment</p>
        <div className="mt-6 grid gap-4 md:grid-cols-2">
          <input className="input-field" placeholder="Full name" required/>
          <input className="input-field" placeholder="Phone number" required/>
          <input className="input-field md:col-span-2" placeholder="Street address" required/>
          <input className="input-field" placeholder="City" required/>
          <input className="input-field" placeholder="Pincode" required/>
          <input className="input-field" placeholder="State" required/>
          <select className="input-field">
            <option>Cash on Delivery</option>
            <option>UPI / Card placeholder</option>
          </select>
        </div>

        <div className="mt-8 rounded-[1.5rem] bg-cream p-4 text-sm leading-7 text-cocoa/75">
          Next integration step: create an order in Supabase and then attach payment confirmation to it.
        </div>

        <button type="submit" disabled={cart.length === 0} className="mt-8 rounded-full bg-cocoa px-5 py-3 text-sm font-medium text-cream disabled:cursor-not-allowed disabled:opacity-50">
          {cart.length ? "Place order" : "Cart is empty"}
        </button>

        {placed ? (<p className="mt-4 text-sm text-leaf">
            Demo checkout completed. Persist this into the `orders` and `order_items` tables next.
          </p>) : null}
      </form>

      <aside className="rounded-[2rem] border border-white/70 bg-white p-6 shadow-soft">
        <p className="text-xs uppercase tracking-[0.4em] text-cocoa/50">Order Summary</p>
        <div className="mt-6 space-y-4">
          {cart.map(function (item) { return (<div key={"".concat(item.slug, "-").concat(item.size)} className="flex justify-between gap-4 text-sm text-cocoa/72">
              <div>
                <p>{item.silhouette}</p>
                <p className="text-cocoa/50">
                  {item.printName} · {item.size} · Qty {item.quantity}
                </p>
              </div>
              <span>{(0, catalog_1.formatCurrency)(item.price * item.quantity)}</span>
            </div>); })}
        </div>
        <div className="mt-8 border-t border-cocoa/10 pt-4 text-sm text-cocoa/75">
          <div className="flex justify-between">
            <span>Total</span>
            <span>{(0, catalog_1.formatCurrency)(subtotal)}</span>
          </div>
        </div>
      </aside>
    </div>);
}
function AccountExperience() {
    var wishlist = (0, providers_1.useStore)().wishlist;
    var _a = (0, react_1.useState)("login"), mode = _a[0], setMode = _a[1];
    var _b = (0, react_1.useState)(""), message = _b[0], setMessage = _b[1];
    var _c = (0, react_1.useState)(false), isSuccess = _c[0], setIsSuccess = _c[1];
    function handleAuth(event) {
        return __awaiter(this, void 0, void 0, function () {
            var supabase, formData, email, password, name_1, error_1, error;
            var _a, _b, _c;
            return __generator(this, function (_d) {
                switch (_d.label) {
                    case 0:
                        event.preventDefault();
                        supabase = (0, client_1.createClient)();
                        formData = new FormData(event.currentTarget);
                        email = String((_a = formData.get("email")) !== null && _a !== void 0 ? _a : "");
                        password = String((_b = formData.get("password")) !== null && _b !== void 0 ? _b : "");
                        if (!(mode === "signup")) return [3 /*break*/, 2];
                        name_1 = String((_c = formData.get("name")) !== null && _c !== void 0 ? _c : "");
                        return [4 /*yield*/, supabase.auth.signUp({
                                email: email,
                                password: password,
                                options: {
                                    data: {
                                        full_name: name_1
                                    }
                                }
                            })];
                    case 1:
                        error_1 = (_d.sent()).error;
                        if (error_1) {
                            setMessage(error_1.message);
                            setIsSuccess(false);
                        }
                        else {
                            setMessage("✓ Account created successfully! Check your email to verify.");
                            setIsSuccess(true);
                            setTimeout(function () {
                                window.location.href = "/account";
                            }, 2000);
                        }
                        return [2 /*return*/];
                    case 2: return [4 /*yield*/, supabase.auth.signInWithPassword({
                            email: email,
                            password: password
                        })];
                    case 3:
                        error = (_d.sent()).error;
                        if (error) {
                            setMessage(error.message);
                            setIsSuccess(false);
                        }
                        else {
                            setMessage("✓ You are now logged in!");
                            setIsSuccess(true);
                            setTimeout(function () {
                                window.location.href = "/account";
                            }, 1500);
                        }
                        return [2 /*return*/];
                }
            });
        });
    }
    return (<div className="grid gap-6 xl:grid-cols-[0.9fr_1.1fr]">
      <section className="rounded-[2rem] border border-white/70 bg-white p-6 shadow-soft">
        <div className="flex gap-3">
          {["login", "signup"].map(function (item) { return (<button key={item} type="button" onClick={function () { return setMode(item); }} className={"rounded-full px-4 py-2 text-sm uppercase tracking-[0.25em] ".concat(mode === item ? "bg-cocoa text-cream" : "bg-cream text-cocoa")}>
              {item}
            </button>); })}
        </div>

        <form className="mt-6 space-y-4" onSubmit={handleAuth}>
          {mode === "signup" ? <input name="name" className="input-field" placeholder="Name"/> : null}
          <input name="email" type="email" className="input-field" placeholder="Email" required/>
          <input name="password" type="password" className="input-field" placeholder="Password" required/>
          <button type="submit" className="rounded-full bg-cocoa px-5 py-3 text-sm font-medium text-cream">
            {mode === "signup" ? "Create account" : "Login"}
          </button>
        </form>

        {message ? (<p className={"mt-4 text-sm ".concat(isSuccess ? "text-green-600" : "text-red-600")}>{message}</p>) : null}

        <div className="mt-8 rounded-[1.5rem] bg-cream p-4 text-sm leading-7 text-cocoa/72">
          Use the <link_1.default href="/login" className="font-medium text-cocoa underline">dedicated login page</link_1.default> for Google/Apple authentication and password recovery.
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
    </div>);
}
