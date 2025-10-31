import express from "express";
import fs from "fs";
import bcrypt from "bcrypt";
import session from "express-session";
import path from "path";
import { fileURLToPath } from "url";
import dotenv from "dotenv";

dotenv.config();

const app = express();
const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

// Middleware
app.use(express.json());
app.use(express.urlencoded({ extended: true }));
app.use(express.static(path.join(__dirname, "public")));

app.use(
  session({
    secret: process.env.SESSION_SECRET || "eventhub_secret_key",
    resave: false,
    saveUninitialized: true,
    cookie: { secure: false },
  })
);

const dataDir = path.join(__dirname, "data");
const usersPath = path.join(dataDir, "users.json");
const bookingsPath = path.join(dataDir, "bookings.json");

// JSON utilities
const readJSON = (file) => {
  try {
    return JSON.parse(fs.readFileSync(file, "utf-8"));
  } catch {
    return [];
  }
};
const writeJSON = (file, data) =>
  fs.writeFileSync(file, JSON.stringify(data, null, 2), "utf-8");

// ---------- Authentication ----------
app.post("/signup", async (req, res) => {
  const { name, email, password } = req.body;
  if (!name || !email || !password)
    return res.status(400).send("All fields required.");

  const users = readJSON(usersPath);
  if (users.find((u) => u.email === email))
    return res.status(400).send("User already exists.");

  const hashed = await bcrypt.hash(password, 10);
  users.push({ name, email, password: hashed });
  writeJSON(usersPath, users);
  res.redirect("/login.html");
});

app.post("/login", async (req, res) => {
  const { email, password } = req.body;
  const users = readJSON(usersPath);
  const user = users.find((u) => u.email === email);
  if (!user) return res.status(401).send("Invalid credentials. Try again");

  const valid = await bcrypt.compare(password, user.password);
  if (!valid) return res.status(401).send("Invalid credentials. Try again");

  req.session.user = { name: user.name, email: user.email };
  res.redirect("/categories.html");
});

app.get("/logout", (req, res) => {
  req.session.destroy(() => {
    res.redirect("/login.html");
  });
});

app.get("/api/session", (req, res) => {
  res.json({ user: req.session.user || null });
});

// Middleware to protect routes
function requireLogin(req, res, next) {
  if (!req.session.user) return res.redirect("/login.html");
  next();
}

// ---------- Events ----------
const events = [
  {
    id: 1,
    name: "Sports Fiesta",
    category: "Sports",
    date: "2025-12-05",
    location: "Hyderabad Stadium",
    description: "Annual sports gathering for community teams.",
    img: "/images/sports.jpg",
  },
  {
    id: 2,
    name: "Corporate Meet 2025",
    category: "Corporate",
    date: "2025-11-18",
    location: "ITC Kohenur",
    description: "Networking event for top business professionals.",
    img: "/images/corporate.jpg",
  },
  {
    id: 3,
    name: "Cultural Carnival",
    category: "Cultural",
    date: "2025-12-20",
    location: "Shilparamam",
    description: "A festival of art, dance, and music.",
    img: "/images/cultural.jpg",
  },
  {
    id: 4,
    name: "Education Expo",
    category: "Educational",
    date: "2025-11-25",
    location: "HICC Convention Center",
    description: "Exhibition of top educational institutions.",
    img: "/images/educational.jpg",
  },
  {
    id: 5,
    name: "Social Charity Night",
    category: "Social",
    date: "2025-12-10",
    location: "Hyderabad Club",
    description: "Fundraising event for a noble cause.",
    img: "/images/social.jpg",
  },
  {
    id: 6,
    name: "Community Marathon",
    category: "Community",
    date: "2025-12-03",
    location: "Necklace Road",
    description: "Run for health, unity, and sustainability.",
    img: "/images/community.jpg",
  },
];

app.get("/api/events", requireLogin, (req, res) => {
  res.json(events);
});

// ---------- Bookings ----------
app.post("/save-booking", requireLogin, (req, res) => {
  const { eventName, customerName, venue, guests, theme, requests } = req.body;
  const bookings = readJSON(bookingsPath);
  const newBooking = {
    id: bookings.length + 1,
    eventName,
    customerName,
    venue,
    guests,
    theme,
    requests,
    date: new Date().toLocaleString(),
  };
  bookings.push(newBooking);
  writeJSON(bookingsPath, bookings);
  res.json({ success: true, message: "Booking saved successfully!" });
});

app.get("/api/bookings", requireLogin, (req, res) => {
  const bookings = readJSON(bookingsPath);
  res.json(bookings);
});

// ---------- Server ----------
const PORT = process.env.PORT || 3000;
app.listen(PORT, () =>
  console.log(`✅ Server running at http://localhost:${PORT}`)
);
