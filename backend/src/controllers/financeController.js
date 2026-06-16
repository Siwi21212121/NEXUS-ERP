const getFinanceDashboard = async (req, res) => {

  res.status(200).json({
    success: true,
    dashboard: "Finance Dashboard",
    accessBy: req.user.role,

    data: {
      totalRevenue: 1500000,
      totalExpenses: 750000,
      netProfit: 750000,
      pendingInvoices: 24,
      approvedBudgets: 18,
    },
  });

};

module.exports = {
  getFinanceDashboard,
};