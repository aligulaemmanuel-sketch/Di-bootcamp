const express = require("express");
const cookieParser = require("cookie-parser");
const config = require("./src/config");
const authRoutes = require("./src/routes/auth");
const userRoutes = require("./src/routes/users");
const { notFound, errorHandler } = require("./src/middleware/errorHandler");

const app = express();

// Step 3: global middleware (express.json replaces the old body-parser package)
app.use(express.json());
app.use(cookieParser());

// tiny request logger for learning visibility
app.use((req, _res, next) => {
  console.log(`${req.method} ${req.path}`);
  next();
});

// Step 4 + 7: routes
app.use("/api/auth", authRoutes);
app.use("/api/users", userRoutes);

app.get("/api/health", (_req, res) => res.json({ status: "ok" }));

app.use(notFound);
app.use(errorHandler);

app.listen(config.port, () => {
  console.log(`JWT auth server running on http://localhost:${config.port}`);
});
