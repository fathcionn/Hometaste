import http from "node:http";
import { readFile, writeFile, mkdir } from "node:fs/promises";
import { existsSync } from "node:fs";
import path from "node:path";
import crypto from "node:crypto";
import { fileURLToPath } from "node:url";

const __dirname = path.dirname(fileURLToPath(import.meta.url));
const publicDir = path.join(__dirname, "public");
const dataDir = path.join(__dirname, "data");
const dbPath = path.join(dataDir, "db.json");
const port = Number(process.env.PORT || 4173);
const envPath = path.join(__dirname, ".env");

if (existsSync(envPath)) {
  const envText = await readFile(envPath, "utf8");
  for (const line of envText.split(/\r?\n/)) {
    const match = line.match(/^\s*([A-Z0-9_]+)\s*=\s*(.*)\s*$/);
    if (match && !process.env[match[1]]) process.env[match[1]] = match[2].replace(/^["']|["']$/g, "");
  }
}

const supabaseUrl = process.env.SUPABASE_URL?.replace(/\/$/, "");
const supabaseKey = process.env.SUPABASE_SECRET_KEY || process.env.SUPABASE_SERVICE_ROLE_KEY;
const useSupabase = Boolean(supabaseUrl && supabaseKey);

const json = (res, status, body) => {
  res.writeHead(status, {
    "content-type": "application/json; charset=utf-8",
    "cache-control": "no-store"
  });
  res.end(JSON.stringify(body));
};

const hashPassword = (password, salt = crypto.randomBytes(16).toString("hex")) => {
  const hash = crypto.scryptSync(password, salt, 64).toString("hex");
  return `${salt}:${hash}`;
};

const verifyPassword = (password, stored) => {
  const [salt, hash] = stored.split(":");
  const test = crypto.scryptSync(password, salt, 64).toString("hex");
  return crypto.timingSafeEqual(Buffer.from(hash, "hex"), Buffer.from(test, "hex"));
};

const id = (prefix) => `${prefix}_${crypto.randomBytes(8).toString("hex")}`;

const now = () => new Date().toISOString();

const seedDb = () => ({
  users: [
    {
      id: "usr_owner",
      name: "Shewharth",
      email: "shewharth@hometaste.local",
      passwordHash: hashPassword("Shewharth2026!"),
      role: "admin",
      city: "Istanbul",
      phone: "+90 555 000 0000",
      createdAt: now()
    },
    {
      id: "usr_cook_1",
      name: "Mona Hassan",
      email: "mona@hometaste.local",
      passwordHash: hashPassword("Cook2026!"),
      role: "cook",
      city: "Istanbul",
      phone: "+90 555 123 4567",
      createdAt: now()
    },
    {
      id: "usr_customer_1",
      name: "Alex Johnson",
      email: "customer@hometaste.local",
      passwordHash: hashPassword("Customer2026!"),
      role: "customer",
      city: "Istanbul",
      phone: "+90 555 111 2222",
      createdAt: now()
    }
  ],
  cooks: [
    {
      id: "cook_1",
      userId: "usr_cook_1",
      name: "Mona Hassan",
      cuisine: "Egyptian Home Kitchen",
      city: "Istanbul",
      bio: "Family recipes, daily batches, warm portions.",
      status: "approved",
      availability: "Today 6 PM to 10 PM",
      prepTime: "~35 min",
      phone: "+90 555 123 4567",
      responseTime: "Usually replies in 5 minutes",
      createdAt: now()
    },
    {
      id: "cook_2",
      userId: null,
      name: "Aylin Demir",
      cuisine: "Turkish Classics",
      city: "Kadikoy",
      bio: "Stuffed vegetables, soups, and trays for families.",
      status: "approved",
      availability: "Weekdays 12 PM to 8 PM",
      prepTime: "~45 min",
      phone: "+90 555 444 1212",
      responseTime: "Usually replies in 12 minutes",
      createdAt: now()
    },
    {
      id: "cook_3",
      userId: null,
      name: "Ravi Patel",
      cuisine: "Indian Comfort Food",
      city: "Besiktas",
      bio: "Fresh curries, biryani, dal, and homemade chutneys.",
      status: "approved",
      availability: "Fri to Sun 5 PM to 11 PM",
      prepTime: "~50 min",
      phone: "+90 555 888 3434",
      responseTime: "Usually replies in 18 minutes",
      createdAt: now()
    }
  ],
  dishes: [
    {
      id: "dish_1",
      cookId: "cook_1",
      name: "Koshari Bowl",
      description: "Rice, lentils, chickpeas, crispy onions, tomato sauce.",
      price: 200,
      prepMinutes: 35,
      image: "https://images.unsplash.com/photo-1544025162-d76694265947?w=900&q=80",
      tags: ["vegan", "filling"],
      available: true,
    },
    {
      id: "dish_2",
      cookId: "cook_2",
      name: "Dolma Plate",
      description: "Stuffed peppers and vine leaves with yogurt.",
      price: 240,
      prepMinutes: 45,
      image: "https://images.unsplash.com/photo-1559847844-5315695dadae?w=900&q=80",
      tags: ["turkish", "family"],
      available: true,
    },
    {
      id: "dish_3",
      cookId: "cook_3",
      name: "Chicken Biryani",
      description: "Layered rice, spices, chicken, raita, and chutney.",
      price: 285,
      prepMinutes: 50,
      image: "https://images.unsplash.com/photo-1563379091339-03246963d7d3?w=900&q=80",
      tags: ["spicy", "halal"],
      available: true,
    }
  ],
  orders: [
    {
      id: "ord_1",
      customerId: "usr_customer_1",
      cookId: "cook_1",
      items: [{ dishId: "dish_1", name: "Koshari Bowl", qty: 1, price: 200 }],
      subtotal: 200,
      deliveryFee: 30,
      serviceFee: 15,
      total: 245,
      status: "preparing",
      statusHistory: [
        { status: "placed", byUserId: "usr_customer_1", at: now(), note: "Seed order placed." },
        { status: "preparing", byUserId: "usr_cook_1", at: now(), note: "Seed cook started preparing." }
      ],
      paymentMethod: "cash",
      deliveryAddress: "Nisantasi, Istanbul",
      notes: "Medium spicy",
      createdAt: now(),
      updatedAt: now()
    }
  ],
  messages: [
    {
      id: "msg_1",
      orderId: "ord_1",
      fromUserId: "usr_customer_1",
      toCookId: "cook_1",
      text: "Can you make it medium spicy?",
      createdAt: now()
    },
    {
      id: "msg_2",
      orderId: "ord_1",
      fromUserId: "usr_cook_1",
      toUserId: "usr_customer_1",
      text: "Yes, medium spicy is perfect.",
      createdAt: now()
    }
  ],
  notifications: [],
  sessions: {}
});

async function loadDb() {
  if (useSupabase) return loadSupabaseDb();
  if (!existsSync(dbPath)) {
    await mkdir(dataDir, { recursive: true });
    await saveDb(normalizeDb(seedDb()));
  }
  return normalizeDb(JSON.parse(await readFile(dbPath, "utf8")));
}

async function saveDb(db) {
  if (useSupabase) return saveSupabaseDb(db);
  await mkdir(dataDir, { recursive: true });
  const tmp = path.join(dataDir, "db.tmp");
  await writeFile(tmp, JSON.stringify(db, null, 2));
  await writeFile(dbPath, JSON.stringify(db, null, 2));
}

async function supabaseRequest(table, { method = "GET", query = "", body: payload, prefer = "return=representation" } = {}) {
  const url = `${supabaseUrl}/rest/v1/${table}${query}`;
  const res = await fetch(url, {
    method,
    headers: {
      apikey: supabaseKey,
      authorization: `Bearer ${supabaseKey}`,
      "content-type": "application/json",
      prefer
    },
    body: payload === undefined ? undefined : JSON.stringify(payload)
  });
  const text = await res.text();
  const data = text ? JSON.parse(text) : null;
  if (!res.ok) throw new Error(`Supabase ${method} ${table} failed: ${data?.message || text}`);
  return data;
}

const toUser = (row) => ({
  id: row.id,
  name: row.name,
  email: row.email,
  passwordHash: row.password_hash,
  role: row.role,
  city: row.city,
  phone: row.phone,
  createdAt: row.created_at
});

const fromUser = (user) => ({
  id: user.id,
  name: user.name,
  email: user.email,
  password_hash: user.passwordHash,
  role: user.role,
  city: user.city || "",
  phone: user.phone || "",
  created_at: user.createdAt || now()
});

const toCook = (row) => ({
  id: row.id,
  userId: row.user_id,
  name: row.name,
  cuisine: row.cuisine,
  city: row.city,
  bio: row.bio,
  verified: row.verified,
  status: row.status,
  rating: Number(row.rating || 0),
  reviews: Number(row.reviews || 0),
  availability: row.availability,
  prepTime: row.prep_time,
  phone: row.phone,
  responseTime: row.response_time,
  repeatCustomers: Number(row.repeat_customers || 0),
  ratingFood: Number(row.rating_food || row.rating || 0),
  ratingSpeed: Number(row.rating_speed || row.rating || 0),
  ratingPackaging: Number(row.rating_packaging || row.rating || 0),
  ratingCommunication: Number(row.rating_communication || row.rating || 0),
  createdAt: row.created_at
});

const fromCook = (cook) => ({
  id: cook.id,
  user_id: cook.userId,
  name: cook.name,
  cuisine: cook.cuisine,
  city: cook.city,
  bio: cook.bio,
  verified: Boolean(cook.verified),
  status: cook.status,
  rating: cook.rating || 0,
  reviews: cook.reviews || 0,
  availability: cook.availability || "",
  prep_time: cook.prepTime || "",
  phone: cook.phone || "",
  response_time: cook.responseTime || "",
  repeat_customers: cook.repeatCustomers || 0,
  rating_food: cook.ratingFood || cook.rating || 0,
  rating_speed: cook.ratingSpeed || cook.rating || 0,
  rating_packaging: cook.ratingPackaging || cook.rating || 0,
  rating_communication: cook.ratingCommunication || cook.rating || 0,
  created_at: cook.createdAt || now()
});

const toDish = (row) => ({
  id: row.id,
  cookId: row.cook_id,
  name: row.name,
  description: row.description,
  price: Number(row.price || 0),
  prepMinutes: Number(row.prep_minutes || 0),
  image: row.image,
  tags: row.tags || [],
  available: row.available,
  featured: row.featured,
  verified: Boolean(row.verified)
});

const fromDish = (dish) => ({
  id: dish.id,
  cook_id: dish.cookId,
  name: dish.name,
  description: dish.description || "",
  price: dish.price || 0,
  prep_minutes: dish.prepMinutes || 30,
  image: dish.image || "",
  tags: dish.tags || [],
  available: Boolean(dish.available),
  featured: Boolean(dish.featured),
  verified: Boolean(dish.verified)
});

const toOrder = (row) => ({
  id: row.id,
  customerId: row.customer_id,
  cookId: row.cook_id,
  items: row.items || [],
  subtotal: Number(row.subtotal || 0),
  deliveryFee: Number(row.delivery_fee || 0),
  serviceFee: Number(row.service_fee || 0),
  total: Number(row.total || 0),
  status: row.status,
  statusHistory: row.status_history || [],
  paymentMethod: row.payment_method,
  deliveryAddress: row.delivery_address,
  notes: row.notes,
  createdAt: row.created_at,
  updatedAt: row.updated_at
});

const fromOrder = (order) => ({
  id: order.id,
  customer_id: order.customerId,
  cook_id: order.cookId,
  items: order.items || [],
  subtotal: order.subtotal || 0,
  delivery_fee: order.deliveryFee || 0,
  service_fee: order.serviceFee || 0,
  total: order.total || 0,
  status: order.status,
  status_history: order.statusHistory || [],
  payment_method: order.paymentMethod || "cash",
  delivery_address: order.deliveryAddress || "",
  notes: order.notes || "",
  created_at: order.createdAt || now(),
  updated_at: order.updatedAt || now()
});

const toMessage = (row) => ({
  id: row.id,
  orderId: row.order_id,
  fromUserId: row.from_user_id,
  toCookId: row.to_cook_id,
  toUserId: row.to_user_id,
  text: row.text,
  createdAt: row.created_at
});

const fromMessage = (message) => ({
  id: message.id,
  order_id: message.orderId,
  from_user_id: message.fromUserId,
  to_cook_id: message.toCookId,
  to_user_id: message.toUserId,
  text: message.text,
  created_at: message.createdAt || now()
});

const toNotification = (row) => ({
  id: row.id,
  userId: row.user_id,
  text: row.text,
  createdAt: row.created_at,
  read: row.read
});

const fromNotification = (note) => ({
  id: note.id,
  user_id: note.userId,
  text: note.text,
  created_at: note.createdAt || now(),
  read: Boolean(note.read)
});

async function loadSupabaseDb() {
  const [users, cooks, dishes, orders, messages, notifications, sessions] = await Promise.all([
    supabaseRequest("app_users", { query: "?select=*&order=created_at.asc" }),
    supabaseRequest("cook_profiles", { query: "?select=*&order=created_at.asc" }),
    supabaseRequest("dishes", { query: "?select=*" }),
    supabaseRequest("orders", { query: "?select=*&order=created_at.desc" }),
    supabaseRequest("messages", { query: "?select=*&order=created_at.asc" }),
    supabaseRequest("notifications", { query: "?select=*&order=created_at.desc" }),
    supabaseRequest("app_sessions", { query: "?select=*" })
  ]);

  if (!users.length) {
    const seeded = seedDb();
    await saveSupabaseDb(seeded);
    return seeded;
  }

  return {
    users: users.map(toUser),
    cooks: cooks.map(toCook),
    dishes: dishes.map(toDish),
    orders: orders.map(toOrder),
    messages: messages.map(toMessage),
    notifications: notifications.map(toNotification),
    sessions: Object.fromEntries(sessions.map((session) => [session.token, { userId: session.user_id, createdAt: session.created_at }]))
  };
}

async function upsert(table, rows, conflict = "id") {
  if (!rows.length) return [];
  return supabaseRequest(table, {
    method: "POST",
    query: `?on_conflict=${conflict}`,
    body: rows,
    prefer: "resolution=merge-duplicates,return=representation"
  });
}

async function saveSupabaseDb(db) {
  await upsert("app_users", db.users.map(fromUser));
  await upsert("cook_profiles", db.cooks.map(fromCook));
  await upsert("dishes", db.dishes.map(fromDish));
  await upsert("orders", db.orders.map(fromOrder));
  await upsert("messages", db.messages.map(fromMessage));
  await upsert("notifications", db.notifications.map(fromNotification));
  await supabaseRequest("app_sessions", {
    method: "DELETE",
    query: "?token=neq.__never_match__",
    prefer: "return=minimal"
  });
  const sessionRows = Object.entries(db.sessions || {}).map(([token, session]) => ({
    token,
    user_id: session.userId,
    created_at: session.createdAt || now()
  }));
  await upsert("app_sessions", sessionRows, "token");
}

async function body(req) {
  const chunks = [];
  for await (const chunk of req) chunks.push(chunk);
  const raw = Buffer.concat(chunks).toString("utf8");
  return raw ? JSON.parse(raw) : {};
}

function safeUser(user) {
  if (!user) return null;
  const { passwordHash, ...rest } = user;
  return rest;
}

function getToken(req) {
  const auth = req.headers.authorization || "";
  return auth.startsWith("Bearer ") ? auth.slice(7) : null;
}

function requireUser(db, req) {
  const token = getToken(req);
  const session = token ? db.sessions[token] : null;
  if (!session) return null;
  return db.users.find((u) => u.id === session.userId) || null;
}

function cookForUser(db, userId) {
  return db.cooks.find((cook) => cook.userId === userId) || null;
}

function isAdmin(user) {
  return user?.role === "admin" || user?.role === "owner";
}

function visibleOrders(db, user) {
  if (isAdmin(user)) return db.orders;
  if (user.role === "cook") {
    const cook = cookForUser(db, user.id);
    return cook ? db.orders.filter((order) => order.cookId === cook.id) : [];
  }
  return db.orders.filter((order) => order.customerId === user.id);
}

function normalizeDb(db) {
  db.users ||= [];
  db.cooks ||= [];
  db.dishes ||= [];
  db.orders ||= [];
  db.messages ||= [];
  db.reviews ||= [];
  db.cookApplications ||= [];
  db.reports ||= [];
  db.settings ||= [];
  db.notifications ||= [];
  db.sessions ||= {};

  for (const user of db.users) {
    user.role = user.role === "owner" ? "admin" : user.role;
    user.country ||= "Turkey";
    user.currency ||= user.country === "Germany" ? "EUR" : "TRY";
    user.avatar ||= "";
    user.addresses ||= [];
  }

  for (const cook of db.cooks) {
    cook.country ||= "Turkey";
    cook.cuisineSpecialty ||= cook.cuisine || "Home Kitchen";
    cook.approved ??= cook.status === "approved";
    cook.verificationStatus ||= cook.status === "approved" ? "approved" : cook.status || "pending";
    cook.status ||= cook.approved ? "approved" : "pending";
    cook.avatar ||= "";
    delete cook.rating;
    delete cook.reviews;
    delete cook.verified;
  }

  for (const dish of db.dishes) {
    const cook = db.cooks.find((item) => item.id === dish.cookId);
    dish.cuisine ||= dish.tag || cook?.cuisineSpecialty || "Home Kitchen";
    dish.city ||= cook?.city || "Istanbul";
    dish.country ||= cook?.country || "Turkey";
    dish.currency ||= "TRY";
    dish.prepTime ||= dish.prepMinutes ? `${dish.prepMinutes} min` : "Not provided";
    dish.availability ||= cook?.availability || "Not provided";
    dish.ingredients ||= [];
    dish.allergens ||= [];
    dish.sauces ||= [];
    dish.drinks ||= [];
    dish.cameraVerified = Boolean(dish.cameraVerified);
    dish.status ||= dish.available === false ? "rejected" : "approved";
    dish.createdAt ||= now();
    delete dish.verified;
    delete dish.featured;
  }

  for (const order of db.orders) {
    order.items = (order.items || []).map((item) => ({
      dishId: item.dishId,
      quantity: Number(item.quantity || item.qty || 1),
      name: item.name,
      unitPrice: Number(item.unitPrice || item.price || 0),
      extras: item.extras || []
    }));
    order.currency ||= "TRY";
    order.fulfillmentType ||= "delivery";
    order.address ||= order.deliveryAddress || "";
    order.phone ||= db.users.find((user) => user.id === order.customerId)?.phone || "";
    order.paymentStatus ||= "unpaid";
    order.orderStatus ||= ({ placed: "pending_cook_acceptance", ready: "ready_for_pickup", out_for_delivery: "on_the_way" }[order.status] || order.status || "pending_cook_acceptance");
    order.updatedAt ||= order.createdAt || now();
  }

  for (const message of db.messages) {
    message.conversationId ||= message.orderId ? `order_${message.orderId}` : `direct_${message.senderId || message.fromUserId}_${message.receiverId || message.toUserId || message.toCookId}`;
    message.senderId ||= message.fromUserId;
    if (!message.receiverId && message.toCookId) message.receiverId = db.cooks.find((cook) => cook.id === message.toCookId)?.userId || "";
    message.createdAt ||= now();
    message.read = Boolean(message.read);
  }

  for (const user of db.users) {
    if (!db.settings.some((setting) => setting.userId === user.id)) {
      db.settings.push({
        userId: user.id,
        language: "en",
        city: user.city || "Istanbul",
        country: user.country || "Turkey",
        currency: user.currency || "TRY",
        darkMode: false,
        notifications: true,
        phone: user.phone || "",
        addresses: user.addresses || []
      });
    }
  }

  return db;
}

function reviewStats(db, { dishId, cookId } = {}) {
  const reviews = db.reviews.filter((review) => (!dishId || review.dishId === dishId) && (!cookId || review.cookId === cookId));
  if (!reviews.length) return { rating: null, reviewCount: 0 };
  const rating = reviews.reduce((sum, review) => sum + Number(review.rating || 0), 0) / reviews.length;
  return { rating: Number(rating.toFixed(1)), reviewCount: reviews.length };
}

function completedOrderCount(db, { dishId, cookId } = {}) {
  return db.orders.filter((order) => {
    if (order.orderStatus !== "delivered") return false;
    if (cookId && order.cookId !== cookId) return false;
    if (dishId && !order.items.some((item) => item.dishId === dishId)) return false;
    return true;
  }).length;
}

function publicCook(db, cook) {
  const stats = reviewStats(db, { cookId: cook.id });
  return {
    ...cook,
    verifiedCook: cook.approved === true && cook.verificationStatus === "approved",
    rating: stats.rating,
    reviewCount: stats.reviewCount,
    completedOrderCount: completedOrderCount(db, { cookId: cook.id })
  };
}

function publicDish(db, dish) {
  const cook = db.cooks.find((item) => item.id === dish.cookId);
  const stats = reviewStats(db, { dishId: dish.id });
  return {
    ...dish,
    cook: cook ? publicCook(db, cook) : null,
    rating: stats.rating,
    reviewCount: stats.reviewCount,
    completedOrderCount: completedOrderCount(db, { dishId: dish.id })
  };
}

function publicState(db, user = null) {
  normalizeDb(db);
  const cooks = isAdmin(user)
    ? db.cooks
    : db.cooks.filter((cook) => cook.approved || cook.status === "approved" || cook.userId === user?.id);
  const cookIds = new Set(cooks.map((cook) => cook.id));
  return {
    user: safeUser(user),
    cooks: cooks.map((cook) => publicCook(db, cook)),
    dishes: db.dishes.filter((dish) => cookIds.has(dish.cookId)).map((dish) => publicDish(db, dish)),
    orders: user ? visibleOrders(db, user) : [],
    messages: user
      ? db.messages.filter((message) => {
          const order = db.orders.find((item) => item.id === message.orderId);
          return order && visibleOrders(db, user).some((item) => item.id === order.id);
        })
      : [],
    users: isAdmin(user) ? db.users.map(safeUser) : [],
    notifications: user ? db.notifications.filter((note) => note.userId === user.id || isAdmin(user)) : [],
    stats: isAdmin(user)
      ? {
          users: db.users.length,
          cooks: db.cooks.length,
          pendingCooks: db.cookApplications.filter((app) => app.status === "pending").length,
          orders: db.orders.length,
          revenue: db.orders.reduce((sum, order) => sum + order.total, 0)
        }
      : null
  };
}

async function api(req, res, pathname) {
  const db = await loadDb();

  if (req.method === "POST" && pathname === "/api/auth/signup") {
    const input = await body(req);
    const email = String(input.email || "").trim().toLowerCase();
    const password = String(input.password || "");
    const name = String(input.name || "").trim();
    if (!name || !email || password.length < 8) return json(res, 400, { error: "Name, email, and an 8 character password are required." });
    if (db.users.some((user) => user.email === email)) return json(res, 409, { error: "That email already exists." });
    const role = input.role === "cook" ? "cook" : "customer";
    const user = {
      id: id("usr"),
      name,
      email,
      passwordHash: hashPassword(password),
      role,
      city: String(input.city || "Istanbul").trim(),
      phone: String(input.phone || "").trim(),
      createdAt: now()
    };
    db.users.push(user);
    if (role === "cook") {
      db.cooks.push({
        id: id("cook"),
        userId: user.id,
        name,
        cuisine: String(input.cuisine || input.countryOrigin || "Home Kitchen").trim(),
        city: user.city,
        bio: String(input.bio || "Fresh home cooking.").trim(),
        verified: Boolean(input.photoVerified),
        status: "approved",
        rating: 5,
        availability: String(input.availability || "Mon-Sat 12pm-8pm").trim(),
        prepTime: String(input.prepTime || "45 min").trim(),
        phone: user.phone,
        responseTime: "New cook",
        ratingFood: 5,
        ratingSpeed: 5,
        ratingPackaging: 5,
        ratingCommunication: 5,
        createdAt: now()
      });
    }
    const token = id("ses");
    db.sessions[token] = { userId: user.id, createdAt: now() };
    await saveDb(db);
    return json(res, 201, { token, state: publicState(db, user) });
  }

  if (req.method === "POST" && pathname === "/api/auth/login") {
    const input = await body(req);
    const email = String(input.email || "").trim().toLowerCase();
    const user = db.users.find((item) => item.email === email);
    if (!user || !verifyPassword(String(input.password || ""), user.passwordHash)) {
      return json(res, 401, { error: "Invalid email or password." });
    }
    const token = id("ses");
    db.sessions[token] = { userId: user.id, createdAt: now() };
    await saveDb(db);
    return json(res, 200, { token, state: publicState(db, user) });
  }

  if (req.method === "POST" && pathname === "/api/auth/logout") {
    const token = getToken(req);
    if (token) delete db.sessions[token];
    await saveDb(db);
    return json(res, 200, { ok: true });
  }

  const user = requireUser(db, req);
  if (!user) return json(res, 401, { error: "Please sign in first." });

  const requestUrl = new URL(req.url, `http://${req.headers.host || "localhost"}`);

  if (req.method === "GET" && pathname === "/api/me") {
    return json(res, 200, { user: safeUser(user) });
  }

  if (req.method === "PATCH" && pathname === "/api/me") {
    const input = await body(req);
    if (input.name) user.name = String(input.name).trim();
    if (input.phone !== undefined) user.phone = String(input.phone).trim();
    if (input.city) user.city = String(input.city).trim();
    if (input.country) user.country = String(input.country).trim();
    if (input.currency) user.currency = String(input.currency).trim();
    await saveDb(db);
    return json(res, 200, { user: safeUser(user) });
  }

  if (req.method === "GET" && pathname === "/api/dishes") {
    const search = String(requestUrl.searchParams.get("search") || "").trim().toLowerCase();
    const cuisine = String(requestUrl.searchParams.get("cuisine") || "").trim().toLowerCase();
    const city = String(requestUrl.searchParams.get("city") || "").trim().toLowerCase();
    const dishes = db.dishes
      .filter((dish) => dish.status === "approved")
      .filter((dish) => {
        const cook = db.cooks.find((item) => item.id === dish.cookId);
        if (!cook || !(cook.approved || cook.status === "approved")) return false;
        const haystack = [dish.name, dish.description, dish.cuisine, dish.city, dish.country, cook.name, cook.cuisineSpecialty, ...(dish.ingredients || [])].join(" ").toLowerCase();
        const searchOk = !search || haystack.includes(search);
        const cuisineOk = !cuisine || cuisine === "all" || dish.cuisine.toLowerCase().includes(cuisine);
        const cityOk = !city || city.includes("select") || `${dish.city}, ${dish.country}`.toLowerCase().includes(city) || dish.city.toLowerCase().includes(city.split(",")[0]?.trim() || city);
        return searchOk && cuisineOk && cityOk;
      })
      .map((dish) => publicDish(db, dish));
    return json(res, 200, { dishes, total: dishes.length });
  }

  if (req.method === "GET" && pathname.startsWith("/api/dishes/")) {
    const dish = db.dishes.find((item) => item.id === pathname.split("/").pop());
    if (!dish || dish.status !== "approved") return json(res, 404, { error: "Dish not found." });
    return json(res, 200, { dish: publicDish(db, dish) });
  }

  if (req.method === "GET" && pathname === "/api/cooks") {
    const search = String(requestUrl.searchParams.get("search") || "").trim().toLowerCase();
    const city = String(requestUrl.searchParams.get("city") || "").trim().toLowerCase();
    const cooks = db.cooks
      .filter((cook) => cook.approved || cook.status === "approved")
      .filter((cook) => {
        const haystack = [cook.name, cook.city, cook.country, cook.cuisineSpecialty, cook.bio].join(" ").toLowerCase();
        const searchOk = !search || haystack.includes(search);
        const cityOk = !city || city.includes("select") || `${cook.city}, ${cook.country}`.toLowerCase().includes(city) || cook.city.toLowerCase().includes(city.split(",")[0]?.trim() || city);
        return searchOk && cityOk;
      })
      .map((cook) => publicCook(db, cook));
    return json(res, 200, { cooks, total: cooks.length });
  }

  if (req.method === "GET" && pathname.startsWith("/api/cooks/") && pathname.endsWith("/dishes")) {
    const cookId = pathname.split("/").at(-2);
    const cook = db.cooks.find((item) => item.id === cookId);
    if (!cook || !(cook.approved || cook.status === "approved")) return json(res, 404, { error: "Cook not found." });
    const dishes = db.dishes.filter((dish) => dish.cookId === cook.id && dish.status === "approved").map((dish) => publicDish(db, dish));
    return json(res, 200, { dishes, total: dishes.length });
  }

  if (req.method === "GET" && pathname.startsWith("/api/cooks/")) {
    const cook = db.cooks.find((item) => item.id === pathname.split("/").pop());
    if (!cook || !(cook.approved || cook.status === "approved")) return json(res, 404, { error: "Cook not found." });
    return json(res, 200, { cook: publicCook(db, cook) });
  }

  if (req.method === "GET" && pathname === "/api/reviews") {
    const dishId = requestUrl.searchParams.get("dishId");
    const cookId = requestUrl.searchParams.get("cookId");
    const reviews = db.reviews.filter((review) => (!dishId || review.dishId === dishId) && (!cookId || review.cookId === cookId));
    return json(res, 200, { reviews, total: reviews.length });
  }

  if (req.method === "GET" && pathname === "/api/settings") {
    const setting = db.settings.find((item) => item.userId === user.id) || {
      userId: user.id,
      language: "en",
      city: user.city || "Istanbul",
      country: user.country || "Turkey",
      currency: user.currency || "TRY",
      darkMode: false,
      notifications: true,
      phone: user.phone || "",
      addresses: user.addresses || []
    };
    return json(res, 200, { settings: setting });
  }

  if (req.method === "GET" && pathname === "/api/orders") {
    return json(res, 200, { orders: visibleOrders(db, user) });
  }

  if (req.method === "GET" && pathname.startsWith("/api/orders/")) {
    const order = visibleOrders(db, user).find((item) => item.id === pathname.split("/").pop());
    if (!order) return json(res, 404, { error: "Order not found." });
    return json(res, 200, { order });
  }

  if (req.method === "PATCH" && pathname === "/api/settings") {
    const input = await body(req);
    let setting = db.settings.find((item) => item.userId === user.id);
    if (!setting) {
      setting = { userId: user.id, language: "en", city: user.city || "Istanbul", country: user.country || "Turkey", currency: user.currency || "TRY", darkMode: false, notifications: true, phone: user.phone || "", addresses: user.addresses || [] };
      db.settings.push(setting);
    }
    for (const key of ["language", "city", "country", "currency", "phone"]) {
      if (input[key] !== undefined) setting[key] = String(input[key]).trim();
    }
    if (input.darkMode !== undefined) setting.darkMode = Boolean(input.darkMode);
    if (input.notifications !== undefined) setting.notifications = Boolean(input.notifications);
    if (Array.isArray(input.addresses)) setting.addresses = input.addresses;
    user.city = setting.city || user.city;
    user.country = setting.country || user.country;
    user.currency = setting.currency || user.currency;
    user.phone = setting.phone || user.phone;
    await saveDb(db);
    return json(res, 200, { settings: setting });
  }

  if (req.method === "GET" && pathname === "/api/state") return json(res, 200, publicState(db, user));

  if (req.method === "POST" && pathname === "/api/cooks/apply") {
    const input = await body(req);
    if (db.cookApplications.some((app) => app.userId === user.id && app.status === "pending")) {
      return json(res, 409, { error: "You already have a pending cook application." });
    }
    if (cookForUser(db, user.id)) return json(res, 409, { error: "You already have a cook profile." });
    const application = {
      id: id("app"),
      userId: user.id,
      name: String(input.name || user.name).trim(),
      cuisine: String(input.cuisine || "Home Kitchen").trim(),
      city: String(input.city || user.city || "Istanbul").trim(),
      country: String(input.country || user.country || "Turkey").trim(),
      phone: String(input.phone || user.phone || "").trim(),
      bio: String(input.bio || "Fresh home cooking.").trim(),
      status: "pending",
      availability: String(input.availability || "Today").trim(),
      createdAt: now()
    };
    db.cookApplications.push(application);
    const admins = db.users.filter((item) => isAdmin(item));
    for (const admin of admins) db.notifications.push({ id: id("not"), userId: admin.id, text: `${application.name} applied to become a cook.`, createdAt: now(), read: false });
    await saveDb(db);
    return json(res, 201, { application });
  }

  if (req.method === "POST" && pathname === "/api/dishes") {
    const cook = cookForUser(db, user.id);
    if (!cook && !isAdmin(user)) return json(res, 403, { error: "Only approved cooks can add dishes." });
    if (cook && !(cook.approved && cook.verificationStatus === "approved")) return json(res, 403, { error: "Your cook profile must be approved before adding dishes." });
    const input = await body(req);
    const chosenCookId = input.cookId && isAdmin(user) ? input.cookId : cook.id;
    const chosenCook = db.cooks.find((item) => item.id === chosenCookId);
    if (!chosenCook) return json(res, 400, { error: "Cook profile not found." });
    const dish = {
      id: id("dish"),
      cookId: chosenCook.id,
      name: String(input.name || "").trim(),
      cuisine: String(input.cuisine || chosenCook.cuisineSpecialty || "Home Kitchen").trim(),
      city: String(input.city || chosenCook.city || "Istanbul").trim(),
      country: String(input.country || chosenCook.country || "Turkey").trim(),
      description: String(input.description || "").trim(),
      price: Number(input.price || 0),
      currency: String(input.currency || "TRY").trim(),
      prepTime: String(input.prepTime || (input.prepMinutes ? `${Number(input.prepMinutes)} min` : "")).trim(),
      availability: String(input.availability || chosenCook.availability || "").trim(),
      image: String(input.image || "").trim(),
      ingredients: Array.isArray(input.ingredients) ? input.ingredients : String(input.ingredients || "").split(",").map((item) => item.trim()).filter(Boolean),
      allergens: Array.isArray(input.allergens) ? input.allergens : String(input.allergens || "").split(",").map((item) => item.trim()).filter(Boolean),
      sauces: Array.isArray(input.sauces) ? input.sauces : [],
      drinks: Array.isArray(input.drinks) ? input.drinks : [],
      cameraVerified: Boolean(input.cameraVerified && input.cameraCapture === true),
      status: isAdmin(user) ? String(input.status || "approved") : "pending",
      createdAt: now()
    };
    if (!dish.name || dish.price <= 0) return json(res, 400, { error: "Dish name and price are required." });
    db.dishes.push(dish);
    await saveDb(db);
    return json(res, 201, { dish: publicDish(db, dish) });
  }

  if (req.method === "PATCH" && pathname.startsWith("/api/dishes/")) {
    const dish = db.dishes.find((item) => item.id === pathname.split("/").pop());
    if (!dish) return json(res, 404, { error: "Dish not found." });
    const cook = cookForUser(db, user.id);
    if (!isAdmin(user) && cook?.id !== dish.cookId) return json(res, 403, { error: "No access to this dish." });
    const input = await body(req);
    if ("status" in input && isAdmin(user) && ["pending", "approved", "rejected"].includes(input.status)) dish.status = input.status;
    if (input.name) dish.name = String(input.name).trim();
    if (input.price) dish.price = Number(input.price);
    await saveDb(db);
    return json(res, 200, { dish: publicDish(db, dish) });
  }

  if (req.method === "POST" && pathname === "/api/orders") {
    const input = await body(req);
    const items = Array.isArray(input.items) ? input.items : [];
    if (!items.length) return json(res, 400, { error: "Cart is empty." });
    const normalized = items.map((item) => {
      const dish = db.dishes.find((d) => d.id === item.dishId && d.status === "approved");
      if (!dish) throw new Error("A dish in your cart is unavailable.");
      return { dishId: dish.id, name: dish.name, quantity: Math.max(1, Number(item.quantity || item.qty || 1)), unitPrice: dish.price, extras: item.extras || [] };
    });
    const firstDish = db.dishes.find((dish) => dish.id === normalized[0].dishId);
    const sameCook = normalized.every((item) => db.dishes.find((dish) => dish.id === item.dishId)?.cookId === firstDish.cookId);
    if (!sameCook) return json(res, 400, { error: "Please order from one cook at a time." });
    const fulfillmentType = input.fulfillmentType === "pickup" ? "pickup" : "delivery";
    const address = String(input.address || input.deliveryAddress || "").trim();
    if (fulfillmentType === "delivery" && !address) return json(res, 400, { error: "Delivery address is required." });
    const phone = String(input.phone || user.phone || "").trim();
    if (!phone) return json(res, 400, { error: "Phone number is required." });
    const allowedPayments = ["cash_on_delivery", "pay_on_pickup", "manual_bank_transfer"];
    const paymentMethod = String(input.paymentMethod || (fulfillmentType === "pickup" ? "pay_on_pickup" : "cash_on_delivery"));
    if (!allowedPayments.includes(paymentMethod)) return json(res, 400, { error: "Online payment is coming soon. Choose cash, pickup, or manual bank transfer." });
    const subtotal = normalized.reduce((sum, item) => sum + item.quantity * item.unitPrice, 0);
    const deliveryFee = fulfillmentType === "delivery" ? 30 : 0;
    const order = {
      id: id("ord"),
      customerId: user.id,
      cookId: firstDish.cookId,
      items: normalized,
      subtotal,
      deliveryFee,
      total: subtotal + deliveryFee,
      currency: firstDish.currency || "TRY",
      fulfillmentType,
      address,
      phone,
      paymentMethod,
      paymentStatus: paymentMethod === "manual_bank_transfer" ? "pending_confirmation" : "unpaid",
      orderStatus: "pending_cook_acceptance",
      notes: String(input.notes || "").trim(),
      createdAt: now(),
      updatedAt: now()
    };
    db.orders.unshift(order);
    const cook = db.cooks.find((item) => item.id === order.cookId);
    if (cook?.userId) db.notifications.push({ id: id("not"), userId: cook.userId, text: `New order ${order.id} received.`, createdAt: now(), read: false });
    await saveDb(db);
    return json(res, 201, { order });
  }

  if (req.method === "PATCH" && pathname.startsWith("/api/orders/")) {
    const order = db.orders.find((item) => item.id === pathname.split("/").pop());
    if (!order) return json(res, 404, { error: "Order not found." });
    const cook = cookForUser(db, user.id);
    const input = await body(req);
    const allowed = ["pending_cook_acceptance", "accepted", "rejected", "preparing", "ready_for_pickup", "picked_up", "on_the_way", "delivered", "cancelled"];
    if (!allowed.includes(input.status)) return json(res, 400, { error: "Invalid status." });
    const isOrderCook = cook?.id === order.cookId;
    const isOrderCustomer = user.id === order.customerId;
    const customerCanReceive = isOrderCustomer && input.status === "delivered" && ["ready_for_pickup", "on_the_way"].includes(order.orderStatus);
    if (!isAdmin(user) && !isOrderCook && !customerCanReceive) {
      return json(res, 403, { error: "Only the cook, customer receiver, or owner can update this order." });
    }
    if (isOrderCook && !["accepted", "rejected", "preparing", "ready_for_pickup", "cancelled"].includes(input.status)) {
      return json(res, 403, { error: "Cook can accept, prepare, mark finished, or cancel." });
    }
    order.orderStatus = input.status;
    order.updatedAt = now();
    db.notifications.push({ id: id("not"), userId: order.customerId, text: `Order ${order.id} is now ${order.orderStatus.replaceAll("_", " ")}.`, createdAt: now(), read: false });
    await saveDb(db);
    return json(res, 200, { order });
  }

  if (req.method === "POST" && pathname === "/api/messages") {
    const input = await body(req);
    const order = input.orderId ? db.orders.find((item) => item.id === input.orderId) : null;
    const cook = input.cookId ? db.cooks.find((item) => item.id === input.cookId) : null;
    if (input.orderId && !order) return json(res, 404, { error: "Order not found." });
    if (input.cookId && !cook) return json(res, 404, { error: "Cook not found." });
    const myCook = cookForUser(db, user.id);
    if (order && !isAdmin(user) && user.id !== order.customerId && myCook?.id !== order.cookId) return json(res, 403, { error: "No access to this chat." });
    const receiverId = order
      ? (user.id === order.customerId ? db.cooks.find((item) => item.id === order.cookId)?.userId : order.customerId)
      : cook?.userId;
    if (!receiverId) return json(res, 400, { error: "Message recipient is not available yet." });
    const msg = {
      id: id("msg"),
      conversationId: order ? `order_${order.id}` : `direct_${user.id}_${receiverId}`,
      senderId: user.id,
      receiverId,
      orderId: order?.id || null,
      cookId: cook?.id || order?.cookId || null,
      text: String(input.text || "").trim(),
      createdAt: now(),
      read: false
    };
    if (!msg.text) return json(res, 400, { error: "Message cannot be empty." });
    db.messages.push(msg);
    await saveDb(db);
    return json(res, 201, { message: msg });
  }

  if (req.method === "POST" && pathname === "/api/reports") {
    const input = await body(req);
    const targetType = String(input.targetType || "").trim();
    const targetId = String(input.targetId || "").trim();
    const reason = String(input.reason || "").trim();
    const details = String(input.details || "").trim();
    if (!["dish", "cook"].includes(targetType)) return json(res, 400, { error: "Report target must be dish or cook." });
    if (!targetId) return json(res, 400, { error: "Report target is required." });
    if (!reason) return json(res, 400, { error: "Please choose a report reason." });
    if (targetType === "dish" && !db.dishes.some((dish) => dish.id === targetId)) return json(res, 404, { error: "Dish not found." });
    if (targetType === "cook" && !db.cooks.some((cook) => cook.id === targetId)) return json(res, 404, { error: "Cook not found." });
    const report = {
      id: id("rep"),
      targetType,
      targetId,
      reason,
      details,
      reporterId: user.id,
      status: "open",
      createdAt: now()
    };
    db.reports.push(report);
    await saveDb(db);
    return json(res, 201, { report });
  }

  if (req.method === "POST" && pathname === "/api/reviews") {
    const input = await body(req);
    const order = db.orders.find((item) => item.id === input.orderId);
    if (!order) return json(res, 404, { error: "Order not found." });
    if (order.customerId !== user.id && !isAdmin(user)) return json(res, 403, { error: "Only the ordering customer can review this order." });
    if (order.orderStatus !== "delivered") return json(res, 403, { error: "Reviews are available after delivery." });
    if (db.reviews.some((review) => review.orderId === order.id && review.customerId === user.id)) return json(res, 409, { error: "This order already has a review." });
    const dishId = String(input.dishId || order.items[0]?.dishId || "");
    const rating = Number(input.rating || 0);
    if (!dishId || rating < 1 || rating > 5) return json(res, 400, { error: "A valid dish and rating from 1 to 5 are required." });
    const review = {
      id: id("rev"),
      orderId: order.id,
      dishId,
      cookId: order.cookId,
      customerId: user.id,
      rating,
      comment: String(input.comment || "").trim(),
      createdAt: now()
    };
    db.reviews.push(review);
    await saveDb(db);
    return json(res, 201, { review });
  }

  if (isAdmin(user) && req.method === "PATCH" && pathname.startsWith("/api/admin/cooks/")) {
    const cook = db.cooks.find((item) => item.id === pathname.split("/").pop());
    if (!cook) return json(res, 404, { error: "Cook not found." });
    const input = await body(req);
    if (["approved", "pending", "rejected", "suspended"].includes(input.status)) {
      cook.status = input.status;
      cook.approved = input.status === "approved";
      cook.verificationStatus = input.status;
    }
    await saveDb(db);
    return json(res, 200, publicState(db, user));
  }

  if (isAdmin(user) && req.method === "PATCH" && pathname.startsWith("/api/admin/users/")) {
    const target = db.users.find((item) => item.id === pathname.split("/").pop());
    if (!target) return json(res, 404, { error: "User not found." });
    const input = await body(req);
    if (["customer", "cook", "admin", "owner"].includes(input.role)) target.role = input.role === "owner" ? "admin" : input.role;
    await saveDb(db);
    return json(res, 200, publicState(db, user));
  }

  return json(res, 404, { error: "Route not found." });
}

async function staticFile(req, res, pathname) {
  const clean = pathname === "/" ? "/index.html" : pathname;
  const filePath = path.normalize(path.join(publicDir, clean));
  if (!filePath.startsWith(publicDir)) {
    res.writeHead(403);
    return res.end("Forbidden");
  }
  try {
    const ext = path.extname(filePath);
    const type = {
      ".html": "text/html; charset=utf-8",
      ".css": "text/css; charset=utf-8",
      ".js": "text/javascript; charset=utf-8",
      ".json": "application/json; charset=utf-8",
      ".png": "image/png",
      ".jpg": "image/jpeg",
      ".svg": "image/svg+xml"
    }[ext] || "application/octet-stream";
    const data = await readFile(filePath);
    res.writeHead(200, { "content-type": type });
    res.end(data);
  } catch {
    const data = await readFile(path.join(publicDir, "index.html"));
    res.writeHead(200, { "content-type": "text/html; charset=utf-8" });
    res.end(data);
  }
}

const server = http.createServer(async (req, res) => {
  try {
    const url = new URL(req.url, `http://${req.headers.host}`);
    if (url.pathname.startsWith("/api/")) return await api(req, res, url.pathname);
    return await staticFile(req, res, url.pathname);
  } catch (error) {
    console.error(error);
    return json(res, 500, { error: error.message || "Server error." });
  }
});

server.listen(port, () => {
  console.log(`HomeTaste running on http://localhost:${port}`);
});
