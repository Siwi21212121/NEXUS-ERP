const express = require("express");
const cors = require("cors");

const authRoutes = require("./routes/authRoutes");

const app = express();
const hrRoutes =
  require("./routes/hrRoutes");
const financeRoutes =
  require("./routes/financeRoutes");

const projectRoutes =
  require("./routes/projectRoutes");

const ownerRoutes =
  require("./routes/ownerRoutes");
const inventoryRoutes =
  require("./routes/inventoryRoutes");
const procurementRoutes =
  require("./routes/procurementRoutes");
const analyticsRoutes =
  require("./routes/analyticsRoutes");
const aiRoutes =
  require("../modules/ai/routes");
const intelligenceRoutes =
  require("../modules/intelligence/routes");
app.use(
  cors({
    origin: 'http://localhost:5173',
    credentials: true,
  })
)
app.use(express.json());

app.use("/api/auth", authRoutes);
app.use("/api/hr", hrRoutes);
app.use("/api/finance", financeRoutes);

app.use("/api/projects", projectRoutes);

app.use("/api/owner", ownerRoutes);
app.use("/api/inventory", inventoryRoutes);
app.use("/api/procurement", procurementRoutes);
app.use("/api/analytics", analyticsRoutes);
app.use("/api/ai", aiRoutes);
app.use("/api/intelligence", intelligenceRoutes);

module.exports = app;
