const express = require("express");
const bcrypt = require("bcryptjs");
const { getDB } = require("./db");
const { createToken, requireAuth } = require("./auth");

function createApiRouter() {
  const router = express.Router();
  const supabase = getDB();

  router.get("/health", async (_req, res) => {
    try {
      const [printsRes, productsRes, usersRes, ordersRes] = await Promise.all([
        supabase.from("prints").select("id", { count: "exact", head: true }),
        supabase.from("products").select("id", { count: "exact", head: true }),
        supabase.from("users").select("id", { count: "exact", head: true }),
        supabase.from("orders").select("id", { count: "exact", head: true })
      ]);

      res.json({
        ok: true,
        counts: {
          prints: printsRes.count || 0,
          products: productsRes.count || 0,
          users: usersRes.count || 0,
          orders: ordersRes.count || 0
        }
      });
    } catch (error) {
      console.error("Health check error:", error);
      res.status(500).json({ message: "Health check failed." });
    }
  });

  router.get("/prints", async (req, res) => {
    try {
      let query = supabase.from("prints").select("*");

      if (req.query.category) {
        query = query.eq("category", req.query.category);
      }

      if (req.query.featured === "true") {
        query = query.eq("featured", true);
      }

      const { data: prints, error: printsError } = await query.order("featured", {
        ascending: false
      }).order("bestseller", { ascending: false }).order("name", { ascending: true });

      if (printsError) throw printsError;

      const { data: products, error: productsError } = await supabase
        .from("products")
        .select("*");

      if (productsError) throw productsError;

      const response = (prints || []).map((print) => {
        const relatedProducts = (products || []).filter((product) => product.print_id === print.id);
        return {
          ...print,
          silhouettesCount: relatedProducts.length,
          startingPrice:
            relatedProducts.length > 0
              ? Math.min(...relatedProducts.map((product) => product.price))
              : 0
        };
      });

      res.json(response);
    } catch (error) {
      console.error("Prints fetch error:", error);
      res.status(500).json({ message: "Failed to fetch prints." });
    }
  });

  router.get("/prints/:slug", async (req, res) => {
    try {
      const { data: print, error: printError } = await supabase
        .from("prints")
        .select("*")
        .eq("slug", req.params.slug)
        .single();

      if (printError || !print) {
        return res.status(404).json({ message: "Print not found." });
      }

      const { data: products, error: productsError } = await supabase
        .from("products")
        .select("*")
        .eq("print_id", print.id)
        .order("price", { ascending: true });

      if (productsError) throw productsError;

      return res.json({ ...print, products: products || [] });
    } catch (error) {
      console.error("Print details fetch error:", error);
      res.status(500).json({ message: "Failed to fetch print." });
    }
  });

  router.get("/products", async (req, res) => {
    try {
      let query = supabase.from("products").select("*, prints(*)");

      if (req.query.printId) {
        query = query.eq("print_id", req.query.printId);
      }

      if (req.query.silhouette) {
        query = query.eq("silhouette", req.query.silhouette);
      }

      const { data: products, error } = await query.order("created_at", { ascending: false });

      if (error) throw error;
      return res.json(products || []);
    } catch (error) {
      console.error("Products fetch error:", error);
      res.status(500).json({ message: "Failed to fetch products." });
    }
  });

  router.get("/products/recommendations/:slug", async (req, res) => {
    try {
      const { data: product, error: productError } = await supabase
        .from("products")
        .select("*")
        .eq("slug", req.params.slug)
        .single();

      if (productError || !product) {
        return res.status(404).json({ message: "Product not found." });
      }

      const { data: parentPrint, error: printError } = await supabase
        .from("prints")
        .select("*")
        .eq("id", product.print_id)
        .single();

      if (printError) throw printError;

      // Sibling products (same print, different variations)
      const { data: siblingProducts, error: siblingError } = await supabase
        .from("products")
        .select("*")
        .eq("print_id", product.print_id)
        .neq("slug", product.slug)
        .limit(4);

      if (siblingError) throw siblingError;

      // Related prints from same category
      const { data: matchingPrints, error: matchingPrintsError } = await supabase
        .from("prints")
        .select("id")
        .eq("category", parentPrint.category)
        .neq("id", parentPrint.id);

      if (matchingPrintsError) throw matchingPrintsError;

      const matchingPrintIds = (matchingPrints || []).map((item) => item.id);

      // Products from related prints
      let relatedQuery = supabase.from("products").select("*").neq("slug", product.slug);

      if (matchingPrintIds.length > 0) {
        relatedQuery = relatedQuery.in("print_id", matchingPrintIds);
      }

      const { data: relatedProducts, error: relatedError } = await relatedQuery.limit(4);

      if (relatedError) throw relatedError;

      return res.json([...(siblingProducts || []), ...(relatedProducts || [])].slice(0, 6));
    } catch (error) {
      console.error("Recommendations fetch error:", error);
      res.status(500).json({ message: "Failed to fetch recommendations." });
    }
  });

  router.get("/products/:slug", async (req, res) => {
    try {
      const { data: product, error: productError } = await supabase
        .from("products")
        .select("*, prints(*)")
        .eq("slug", req.params.slug)
        .single();

      if (productError || !product) {
        return res.status(404).json({ message: "Product not found." });
      }

      const { data: siblingProducts, error: siblingError } = await supabase
        .from("products")
        .select("*")
        .eq("print_id", product.print_id)
        .neq("slug", product.slug)
        .limit(6);

      if (siblingError) throw siblingError;

      return res.json({ ...product, siblingProducts: siblingProducts || [] });
    } catch (error) {
      console.error("Product details fetch error:", error);
      res.status(500).json({ message: "Failed to fetch product." });
    }
  });

  router.post("/auth/signup", async (req, res) => {
    try {
      const { name, email, password } = req.body;

      if (!name || !email || !password) {
        return res
          .status(400)
          .json({ message: "Name, email, and password are required." });
      }

      const { data: existingUser, error: existingError } = await supabase
        .from("users")
        .select("id")
        .eq("email", email)
        .maybeSingle();

      if (existingError) throw existingError;
      if (existingUser) {
        return res
          .status(409)
          .json({ message: "Account already exists for this email." });
      }

      const hashedPassword = await bcrypt.hash(password, 10);

      const { data: user, error: createError } = await supabase
        .from("users")
        .insert([
          {
            name,
            email,
            password: hashedPassword
          }
        ])
        .select()
        .single();

      if (createError) throw createError;

      return res.status(201).json({
        message: "Account created successfully.",
        token: createToken(user),
        user: {
          id: user.id,
          name: user.name,
          email: user.email
        }
      });
    } catch (error) {
      console.error("Signup error:", error);
      res.status(500).json({ message: "Failed to create account." });
    }
  });

  router.post("/auth/login", async (req, res) => {
    try {
      const { email, password } = req.body;

      if (!email || !password) {
        return res.status(400).json({ message: "Email and password are required." });
      }

      const { data: user, error: userError } = await supabase
        .from("users")
        .select("*")
        .eq("email", email)
        .maybeSingle();

      if (userError) throw userError;
      if (!user) {
        return res.status(401).json({ message: "Invalid email or password." });
      }

      const matches = await bcrypt.compare(password, user.password);
      if (!matches) {
        return res.status(401).json({ message: "Invalid email or password." });
      }

      return res.json({
        message: "Logged in successfully.",
        token: createToken(user),
        user: {
          id: user.id,
          name: user.name,
          email: user.email
        }
      });
    } catch (error) {
      console.error("Login error:", error);
      res.status(500).json({ message: "Failed to login." });
    }
  });

  router.get("/auth/me", requireAuth, async (req, res) => {
    try {
      const { data: user, error } = await supabase
        .from("users")
        .select("*")
        .eq("id", req.user.id)
        .single();

      if (error || !user) {
        return res.status(404).json({ message: "User not found." });
      }

      return res.json({
        id: user.id,
        name: user.name,
        email: user.email,
        wishlist: user.wishlist || [],
        savedAddresses: user.saved_addresses || []
      });
    } catch (error) {
      console.error("Auth/me error:", error);
      res.status(500).json({ message: "Failed to fetch user." });
    }
  });

  router.get("/orders", requireAuth, async (req, res) => {
    try {
      const { data: orders, error } = await supabase
        .from("orders")
        .select("*")
        .eq("user_id", req.user.id)
        .order("created_at", { ascending: false });

      if (error) throw error;
      return res.json(orders || []);
    } catch (error) {
      console.error("Orders fetch error:", error);
      res.status(500).json({ message: "Failed to fetch orders." });
    }
  });

  router.post("/orders", async (req, res) => {
    try {
      const { items = [], shippingAddress, paymentMethod = "Cash on Delivery" } = req.body;

      if (!items.length) {
        return res.status(400).json({ message: "At least one order item is required." });
      }

      const productIds = items.map((item) => item.productId);

      const { data: products, error: productsError } = await supabase
        .from("products")
        .select("*, prints(*)")
        .in("id", productIds);

      if (productsError) throw productsError;

      const normalizedItems = items.map((item) => {
        const product = (products || []).find((entry) => entry.id === item.productId);
        return {
          product_id: product?.id,
          product_title: product?.title,
          silhouette: product?.silhouette,
          print_name: product?.prints?.name,
          image: product?.images?.[0],
          size: item.size,
          quantity: item.quantity,
          price: product?.price
        };
      });

      const total = normalizedItems.reduce((sum, item) => sum + (item.price || 0) * item.quantity, 0);

      const { data: order, error: orderError } = await supabase
        .from("orders")
        .insert([
          {
            user_id: req.body.userId || null,
            items: normalizedItems,
            shipping_address: shippingAddress,
            total,
            payment_method: paymentMethod,
            payment_status: paymentMethod === "Cash on Delivery" ? "pending" : "paid"
          }
        ])
        .select()
        .single();

      if (orderError) throw orderError;

      return res.status(201).json({
        message: "Order created successfully.",
        order
      });
    } catch (error) {
      console.error("Order creation error:", error);
      res.status(500).json({ message: "Failed to create order." });
    }
  });

  return router;
}

module.exports = {
  createApiRouter
};

