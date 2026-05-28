require("dotenv").config();

const path = require("path");
const bcrypt = require("bcryptjs");
const { getDB } = require("./db");

const catalog = require(path.resolve(__dirname, "../../shared/catalog.json"));

async function seedDatabase() {
  const supabase = getDB();
  const printMap = new Map();

  // Seed prints
  for (const print of catalog.prints) {
    const { data: existingPrint, error: selectError } = await supabase
      .from("prints")
      .select("*")
      .eq("slug", print.slug)
      .maybeSingle();

    if (selectError) throw selectError;

    let savedPrint;
    if (existingPrint) {
      const { data, error } = await supabase
        .from("prints")
        .update(print)
        .eq("slug", print.slug)
        .select()
        .single();
      if (error) throw error;
      savedPrint = data;
    } else {
      const { data, error } = await supabase
        .from("prints")
        .insert([print])
        .select()
        .single();
      if (error) throw error;
      savedPrint = data;
    }

    printMap.set(print.id, savedPrint);
  }

  // Seed products
  for (const product of catalog.products) {
    const parentPrint = printMap.get(product.printId);

    const productData = {
      ...product,
      print_id: parentPrint.id
    };

    const { data: existingProduct, error: selectError } = await supabase
      .from("products")
      .select("*")
      .eq("slug", product.slug)
      .maybeSingle();

    if (selectError) throw selectError;

    if (existingProduct) {
      const { error } = await supabase
        .from("products")
        .update(productData)
        .eq("slug", product.slug);
      if (error) throw error;
    } else {
      const { error } = await supabase.from("products").insert([productData]);
      if (error) throw error;
    }
  }

  // Seed demo user
  const hashedPassword = await bcrypt.hash("password123", 10);
  const { data: existingUser, error: selectUserError } = await supabase
    .from("users")
    .select("*")
    .eq("email", "demo@aakaar.in")
    .maybeSingle();

  if (selectUserError) throw selectUserError;

  const demoUserData = {
    name: "Demo Shopper",
    email: "demo@aakaar.in",
    password: hashedPassword,
    saved_addresses: [
      {
        label: "Home Studio",
        fullName: "Demo Shopper",
        phone: "9999999999",
        line1: "12/7 Green Park Extension",
        city: "New Delhi",
        state: "Delhi",
        pincode: "110016"
      }
    ]
  };

  let demoUser;
  if (existingUser) {
    const { data, error } = await supabase
      .from("users")
      .update(demoUserData)
      .eq("email", "demo@aakaar.in")
      .select()
      .single();
    if (error) throw error;
    demoUser = data;
  } else {
    const { data, error } = await supabase
      .from("users")
      .insert([demoUserData])
      .select()
      .single();
    if (error) throw error;
    demoUser = data;
  }

  // Seed sample order
  const { data: sampleProduct, error: sampleProductError } = await supabase
    .from("products")
    .select("*, prints(*)")
    .eq("slug", "floral-garden-midi-dress")
    .single();

  if (!sampleProductError && sampleProduct) {
    const { data: existingOrder, error: selectOrderError } = await supabase
      .from("orders")
      .select("*")
      .eq("user_id", demoUser.id)
      .maybeSingle();

    if (selectOrderError) throw selectOrderError;

    const orderData = {
      user_id: demoUser.id,
      items: [
        {
          product_id: sampleProduct.id,
          product_title: sampleProduct.title,
          silhouette: sampleProduct.silhouette,
          print_name: sampleProduct.prints?.name,
          image: sampleProduct.images?.[0],
          size: "M",
          quantity: 1,
          price: sampleProduct.price
        }
      ],
      shipping_address: {
        fullName: "Demo Shopper",
        phone: "9999999999",
        line1: "12/7 Green Park Extension",
        city: "New Delhi",
        state: "Delhi",
        pincode: "110016"
      },
      total: sampleProduct.price,
      status: "delivered",
      payment_method: "Cash on Delivery",
      payment_status: "paid"
    };

    if (!existingOrder) {
      const { error } = await supabase.from("orders").insert([orderData]);
      if (error) throw error;
    }
  }
}

async function runSeed() {
  try {
    getDB();
    await seedDatabase();
    console.log("Aakaar catalog seeded successfully.");
  } catch (error) {
    console.error(error);
    process.exit(1);
  }
}

if (require.main === module) {
  runSeed();
}

module.exports = {
  seedDatabase
};

