const getOwnerDashboard = async (req, res) => {

  res.status(200).json({
    success: true,
    dashboard: "Owner Dashboard",
    accessBy: req.user.role,

    data: {

      finance: {
        revenue: 1500000,
        expenses: 750000,
        profit: 750000,
      },

      hr: {
        totalEmployees: 120,
        activeEmployees: 112,
        leaveRequests: 9,
      },

      projects: {
        totalProjects: 15,
        activeProjects: 10,
        completedProjects: 5,
      },

      inventory: {
        totalItems: 560,
        lowStockItems: 24,
      }

    }
  });

};

module.exports = {
  getOwnerDashboard,
};