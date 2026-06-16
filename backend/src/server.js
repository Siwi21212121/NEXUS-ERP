require("dotenv").config();

const app = require("./app");
const pool = require("./config/db");

const PORT = process.env.PORT || 5000;

pool.connect()
  .then(() => {
    console.log("Database Connected Successfully");
  })
  .catch((err) => {
    console.error("Database Error:", err.message);
  });

app.listen(PORT, () => {
  console.log(`Server running on port ${PORT}`);
});