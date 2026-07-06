const { getExecutiveAnalytics } = require("../services/analyticsService");

async function getExecutiveDashboard(req, res) {
  try {
    return res.json({
      success: true,
      data: await getExecutiveAnalytics(),
    });
  } catch (error) {
    console.error("Analytics Dashboard Error:", error);
    return res.status(500).json({
      success: false,
      message: "Unable to load analytics dashboard",
    });
  }
}

function getAnalyticsDocs(req, res) {
  return res.json({
    module: "Analytics",
    basePath: "/api/analytics",
    roles: ["OWNER"],
    endpoints: ["GET /executive-dashboard", "GET /docs"],
    source: "PostgreSQL module tables only",
  });
}

module.exports = {
  getAnalyticsDocs,
  getExecutiveDashboard,
};
