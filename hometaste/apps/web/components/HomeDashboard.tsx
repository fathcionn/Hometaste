"use client";

import { useMemo, useState } from "react";

interface DishCard {
  dish: string;
  cook: string;
  cuisine: string;
  location: string;
  rating: string;
  availability: string;
  prepTime: string;
  orders: string;
  speed: string;
  price: string;
  image: string;
}

const dishes: DishCard[] = [
  {
    dish: "Koshari",
    cook: "Mona Hassan",
    cuisine: "Egyptian Cuisine",
    location: "Istanbul, Turkey",
    rating: "4.9 (120)",
    availability: "Today 6 PM - 10 PM",
    prepTime: "35-45 min",
    orders: "847 Orders",
    speed: "4.6",
    price: "₺170",
    image: "https://images.unsplash.com/photo-1548943487-a2e4e43b4853?auto=format&fit=crop&w=700&q=80"
  },
  {
    dish: "Adana Kebab",
    cook: "Ahmet Yilmaz",
    cuisine: "Turkish Cuisine",
    location: "Istanbul, Turkey",
    rating: "4.8 (98)",
    availability: "Weekends 1 PM - 9 PM",
    prepTime: "45-60 min",
    orders: "653 Orders",
    speed: "4.7",
    price: "₺200",
    image: "https://images.unsplash.com/photo-1529193591184-b1d58069ecdd?auto=format&fit=crop&w=700&q=80"
  },
  {
    dish: "Lasagna",
    cook: "Giulia Rossi",
    cuisine: "Italian Cuisine",
    location: "Istanbul, Turkey",
    rating: "4.9 (76)",
    availability: "Daily 12 PM - 8 PM",
    prepTime: "25-35 min",
    orders: "489 Orders",
    speed: "4.8",
    price: "₺180",
    image: "https://images.unsplash.com/photo-1574894709920-11b28e7367e3?auto=format&fit=crop&w=700&q=80"
  },
  {
    dish: "Yaprak Sarma",
    cook: "Layla Omari",
    cuisine: "Syrian Cuisine",
    location: "Istanbul, Turkey",
    rating: "4.7 (64)",
    availability: "Today 6 PM - 10 PM",
    prepTime: "35-45 min",
    orders: "381 Orders",
    speed: "4.6",
    price: "₺160",
    image: "https://images.unsplash.com/photo-1604909052743-94e838986d24?auto=format&fit=crop&w=700&q=80"
  }
];

const cuisines = ["All", "Egyptian", "Turkish", "Syrian", "Italian", "Moroccan", "Indian"];

export function HomeDashboard() {
  const [selectedCuisine, setSelectedCuisine] = useState("All");
  const [suggestion, setSuggestion] = useState<DishCard | null>(null);

  const filteredDishes = useMemo(() => {
    if (selectedCuisine === "All") return dishes;
    return dishes.filter((dish) => dish.cuisine.toLowerCase().includes(selectedCuisine.toLowerCase()));
  }, [selectedCuisine]);

  function surpriseMe(): void {
    const pool = filteredDishes.length > 0 ? filteredDishes : dishes;
    const next = pool[Math.floor(Math.random() * pool.length)] ?? dishes[0]!;
    setSuggestion(next);
  }

  return (
    <main className="customer-home">
      <aside className="sidebar">
        <a className="brand-block" href="/en">
          <span className="brand-mark">HT</span>
          <span>
            <strong>HomeTaste</strong>
            <small>Food from real home cooks</small>
          </span>
        </a>
        <nav className="side-nav" aria-label="Customer navigation">
          <a className="active" href="#home">⌂ Home</a>
          <a href="#dishes">🍲 Browse Dishes</a>
          <a href="#orders">🧾 My Orders</a>
          <a href="#messages">💬 Messages</a>
          <a href="#favorites">♡ Favorites</a>
        </nav>
        <div className="sidebar-bottom">
          <a href="#help">? Help & Support</a>
          <a href="#settings">⚙ Settings</a>
          <a className="sign-out" href="#sign-out">↪ Sign out</a>
        </div>
      </aside>

      <section className="home-main" id="home">
        <div className="topbar">
          <button className="menu-button" type="button" aria-label="Open menu">☰</button>
          <div className="location-pill">📍 Istanbul, Turkey</div>
          <div className="topbar-actions">
            <button className="header-pill" type="button">🔔</button>
            <button className="header-pill" type="button">♡</button>
            <button className="account-pill" type="button">Mona</button>
          </div>
        </div>

        <section className="home-hero">
          <div>
            <p className="eyebrow">Homemade meals nearby</p>
            <h1>Find something comforting for dinner.</h1>
            <p className="hero-copy">Order warm, trusted dishes from home cooks in your city.</p>
          </div>
          <div className="search-panel">
            <input aria-label="Search dishes" placeholder="Search dishes, cooks, or cuisines" />
            <select aria-label="Choose location" defaultValue="Istanbul">
              <option>Istanbul</option>
              <option>Ankara</option>
              <option>Izmir</option>
            </select>
            <button className="search-button" type="button">Search</button>
            <button className="surprise-button" type="button" onClick={surpriseMe}>
              <span aria-hidden="true">✦</span> Surprise Me
            </button>
          </div>
          {suggestion ? (
            <p className="surprise-result">
              Try <strong>{suggestion.dish}</strong> by {suggestion.cook} tonight.
            </p>
          ) : null}
          <div className="cuisine-chips">
            {cuisines.map((cuisine) => (
              <button key={cuisine} className={selectedCuisine === cuisine ? "selected" : ""} type="button" onClick={() => setSelectedCuisine(cuisine)}>
                {cuisine}
              </button>
            ))}
          </div>
        </section>

        <section className="trust-strip" aria-label="Trust features">
          <span>📷 Camera verified photos</span>
          <span>⭐ Real customer ratings</span>
          <span>🕒 Clear prep times</span>
        </section>

        <div className="content-layout">
          <section className="dish-section" id="dishes">
            <div className="section-heading">
              <div>
                <h2>Popular Dishes Near You</h2>
                <p>Friendly home-cooked favorites available around Istanbul.</p>
              </div>
              <a href="/en/browse">View all dishes</a>
            </div>
            <div className="dish-grid">
              {filteredDishes.map((dish) => <DishCardView key={dish.dish} dish={dish} />)}
            </div>
          </section>

          <aside className="right-widgets">
            <section className="widget">
              <h3>Active Order</h3>
              <p className="widget-title">Yaprak Sarma</p>
              <p>Layla is preparing your order.</p>
              <div className="progress"><span style={{ width: "62%" }} /></div>
              <small>Estimated arrival: 32 min</small>
            </section>
            <section className="widget" id="messages">
              <h3>Messages</h3>
              <p className="widget-title">Mona Hassan</p>
              <p>Your Koshari can be ready by 7:10 PM.</p>
              <button className="light-action" type="button">Open chat</button>
            </section>
          </aside>
        </div>
      </section>
    </main>
  );
}

function DishCardView({ dish }: { dish: DishCard }) {
  return (
    <article className="dish-card">
      <button className="favorite-button" type="button" aria-label={`Add ${dish.dish} to favorites`}>♡</button>
      <img src={dish.image} alt={dish.dish} />
      <div className="dish-card-body">
        <div className="dish-title-row">
          <div>
            <h3>{dish.dish}</h3>
            <p>by {dish.cook}</p>
          </div>
          <strong>{dish.price}</strong>
        </div>
        <div className="dish-meta">
          <span>{dish.cuisine}</span>
          <span>{dish.location}</span>
          <span>⭐ {dish.rating}</span>
          <span>🕒 {dish.prepTime}</span>
          <span>Today: {dish.availability}</span>
          <span>📷 Camera verified</span>
          <span>{dish.orders}</span>
          <span>Speed {dish.speed}</span>
        </div>
      </div>
    </article>
  );
}
