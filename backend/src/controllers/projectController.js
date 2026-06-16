const getProjectDashboard = async (req, res) => {

  res.status(200).json({
    success: true,
    dashboard: "Project Dashboard",
    accessBy: req.user.role,

    data: {
      totalProjects: 15,
      activeProjects: 10,
      completedProjects: 5,
      pendingTasks: 42,
      teamMembers: 60,
    },
  });

};

module.exports = {
  getProjectDashboard,
};