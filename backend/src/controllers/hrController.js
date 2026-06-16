const getHRDashboard = (req, res) => {

  res.json({
    dashboard: "HR Dashboard",
    user: req.user,
  });

};

module.exports = {
  getHRDashboard,
};