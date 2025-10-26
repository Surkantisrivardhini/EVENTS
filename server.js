const express = require("express");
const path = require("path");
const bodyParser = require("body-parser");
const app = express();
const PORT = 3000;

app.use(express.static(path.join(__dirname, "public")));
app.use(bodyParser.urlencoded({ extended: true }));

// Category data
const categories = [
  { id: "sports", name: "Sports", img: "/images/sports.png", desc: "Organized tournaments, matches, and sports events." },
  { id: "corporate", name: "Corporate", img: "/images/corporate.png", desc: "Professional conferences, meetings, and corporate events." },
  { id: "social", name: "Social", img: "/images/social.png", desc: "Weddings, birthdays, baby showers, and social gatherings." },
  { id: "educational", name: "Educational", img: "/images/educational.png", desc: "Workshops, seminars, and educational events." },
  { id: "cultural", name: "Cultural", img: "/images/cultural.png", desc: "Festivals, concerts, and cultural celebrations." },
  { id: "community", name: "Community", img: "/images/community.png", desc: "Community programs, awareness events, and local gatherings." },
];

// Helper function to render pages dynamically
function renderPage(title, content) {
  return `
<!DOCTYPE html>
<html lang="en">
<head>
<meta charset="UTF-8" />
<meta name="viewport" content="width=device-width, initial-scale=1.0" />
<title>${title}</title>
<link href="https://fonts.googleapis.com/css2?family=Poppins:wght@400;600&display=swap" rel="stylesheet" />
<style>
  body { margin:0; font-family:'Poppins',sans-serif; background:white; color:#333; }
  header { background:#2E7D32; color:white; text-align:center; padding:20px; font-size:2em; font-weight:600; }
  nav { background:#388E3C; display:flex; justify-content:center; gap:20px; padding:10px; }
  nav a { color:white; text-decoration:none; font-weight:500; }
  nav a:hover { text-decoration:underline; }
  main { padding:40px; text-align:center; min-height:70vh; }
  .btn { display:inline-block; background:#2E7D32; color:white; padding:12px 25px; border-radius:6px; text-decoration:none; margin-top:20px; }
  .btn:hover { background:#1B5E20; }
  .category-grid { display:grid; grid-template-columns:repeat(auto-fit,minmax(250px,1fr)); gap:25px; margin-top:30px; }
  .category { border-radius:12px; overflow:hidden; box-shadow:0 4px 10px rgba(0,0,0,0.15); transition:0.3s; }
  .category:hover { transform:scale(1.05); }
  .category img { width:100%; height:180px; object-fit:cover; }
  .category h3 { margin:0; padding:10px; background:#2E7D32; color:white; }
  footer { background:#f2f2f2; text-align:center; padding:20px; margin-top:40px; }
  form { display:flex; flex-direction:column; align-items:center; gap:10px; }
  input, textarea, select { padding:10px; width:250px; border-radius:5px; border:1px solid #ccc; }
  textarea { height:100px; resize:none; }
</style>
</head>
<body>
<header>Event Management</header>
<nav>
<a href="/">Home</a>
<a href="/categories">Categories</a>
<a href="/events/previous">Previous Events</a>
<a href="/events/upcoming">Upcoming Events</a>
<a href="/payment">Payment</a>
<a href="/feedback">Feedback</a>
<a href="/login">Login/Signup</a>
</nav>
<main>${content}</main>
<footer>
<p><b>Contact us:</b> +91 9876543210 | eventify@gmail.com</p>
<p>123 Celebration Street, Hyderabad, India</p>
</footer>
</body>
</html>`;
}

// Home page
app.get("/", (req, res) => {
  res.send(renderPage("Home", `
<h2>Welcome to Eventify - Your Event, Our Expertise</h2>
<p>Plan, manage, and celebrate all types of events effortlessly.</p>
<a href="/login" class="btn">Get Started</a>
`));
});

// Login page
app.get("/login", (req, res) => {
  res.send(renderPage("Login/Signup", `
<h2>Login / Signup</h2>
<form action="/categories" method="get">
  <input type="text" placeholder="Email" required />
  <input type="password" placeholder="Password" required />
  <button type="submit" class="btn">Login</button>
</form>
`));
  });
// Categories page
app.get("/categories", (req, res) => {
  const html = categories.map(c => `
<div class="category">
<a href="/categories/${c.id}">
<img src="${c.img}" alt="${c.name}" />
<h3>${c.name}</h3>
</a>
</div>`).join("");
  res.send(renderPage("Categories", `<h2>Explore Event Categories</h2><div class="category-grid">${html}</div>`));
});

// Individual category details
app.get("/categories/:id", (req, res) => {
  const cat = categories.find(c => c.id === req.params.id);
  if (!cat) return res.status(404).send("Category not found");
  res.send(renderPage(cat.name, `
<h2>${cat.name} Events</h2>
<img src="${cat.img}" alt="${cat.name}" style="width:80%;max-width:700px;border-radius:10px;" />
<p>${cat.desc}</p>
<h3>Requirements & Key Points:</h3>
<ul style="list-style:none;padding:0;">
<li>✔️ Venue decoration & lighting</li>
<li>✔️ Catering & guest management</li>
<li>✔️ Photography & music arrangements</li>
<li>✔️ Customer special requests accommodated</li>
</ul>
<a href="/payment" class="btn">Book Now</a>
`));
});

// Previous events
app.get("/events/previous", (req, res) => {
  res.send(renderPage("Previous Events", `
<h2>Previous Successful Events</h2>
<div class="category-grid">
<div class="category"><img src="/images/previous1.png"><h3>Corporate Summit 2024</h3></div>
<div class="category"><img src="/images/previous2.png"><h3>Wedding Gala</h3></div>
</div>`));
});

// Upcoming events
app.get("/events/upcoming", (req, res) => {
  res.send(renderPage("Upcoming Events", `
<h2>Upcoming Events</h2>
<div class="category-grid">
<div class="category"><img src="/images/upcoming1.png"><h3>Tech Meet 2025</h3></div>
<div class="category"><img src="/images/upcoming2.png"><h3>Cultural Festival</h3></div>
</div>`));
});

// Payment page
app.get("/payment", (req, res) => {
  res.send(renderPage("Payment", `
<h2>Secure Payment</h2>
<form action="/submit-payment" method="post">
<select name="event" required>
<option value="">Select Event Category</option>
${categories.map(c => `<option value="${c.name}">${c.name}</option>`).join("")}
</select>
<input type="text" name="name" placeholder="Full Name" required />
<input type="email" name="email" placeholder="Email" required />
<input type="number" name="amount" placeholder="Amount (₹)" required />
<select name="method" required>
<option value="Card">Card</option>
<option value="UPI">UPI</option>
<option value="NetBanking">Net Banking</option>
</select>
<button type="submit" class="btn">Pay Now</button>
</form>`));
});

// Payment submission
app.post("/submit-payment", (req, res) => {
  const { name, event, amount, method } = req.body;
  res.send(renderPage("Payment Success", `
<h2>Payment Successful!</h2>
<p>Thank you, <b>${name}</b>! Your payment of ₹${amount} for <b>${event}</b> via <b>${method}</b> has been received.</p>
<a href="/feedback" class="btn">Proceed to Feedback</a>`));
});

// Feedback page
app.get("/feedback", (req, res) => {
  res.send(renderPage("Feedback", `
<h2>Give Your Feedback</h2>
<form action="/submit-feedback" method="post">
<input type="text" name="name" placeholder="Your Name" required />
<textarea name="feedback" placeholder="Write your feedback here..." required></textarea>
<select name="rating" required>
<option value="">Rating</option>
<option>⭐</option>
<option>⭐⭐</option>
<option>⭐⭐⭐</option>
<option>⭐⭐⭐⭐</option>
<option>⭐⭐⭐⭐⭐</option>
</select>
<button type="submit" class="btn">Submit Feedback</button>
</form>`));
});

// Feedback submission
app.post("/submit-feedback", (req, res) => {
  const { name, feedback, rating } = req.body;
  res.send(renderPage("Thank You!", `
<h2>Thank You for Your Feedback!</h2>
<p><b>${name}</b>, we appreciate your feedback:</p>
<blockquote>"${feedback}"</blockquote>
<p>Rating: ${rating}</p>
<a href="/" class="btn">Back to Home</a>`));
});

// Start server
app.listen(PORT, () => console.log(`✅ Server running at http://localhost:${PORT}`));
