import dotenv from "dotenv";
dotenv.config();
import app from "./app.js";
import db from "./config/db.js";

const PORT = process.env.PORT || 5000;

try {
  await db.query("SELECT 1");
  console.log("MySQL connected successfully.");
  app.listen(PORT, () => console.log(`Server running at http://localhost:${PORT}`));
} catch (error) {
  console.error("Unable to connect to MySQL:", error.message);
  process.exit(1);
}
