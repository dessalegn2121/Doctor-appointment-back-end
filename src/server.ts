import dotenv from "dotenv";
import path from "path";
import app from "./app";
import { connectDB } from "./config/db";
import bcrypt from "bcryptjs";
import { User } from "./models/User";

// Load env from backend root (.env), regardless of where node is invoked from
dotenv.config({ path: path.resolve(process.cwd(), ".env") });

const PORT = process.env.PORT ? Number(process.env.PORT) : 5000;

const start = async () => {
  await connectDB();

  // Optional: create an admin account for local development.
  // Set ADMIN_EMAIL + ADMIN_PASSWORD in the backend `.env`.
  const adminEmail = process.env.ADMIN_EMAIL;
  const adminPassword = process.env.ADMIN_PASSWORD;
  if (adminEmail && adminPassword) {
    const existing = await User.findOne({ email: adminEmail });
    if (!existing) {
      const hashed = await bcrypt.hash(adminPassword, 10);
      await User.create({
        name: process.env.ADMIN_NAME ?? "Hospital Admin",
        email: adminEmail,
        password: hashed,
        role: "admin",
      });
      console.log("Seeded admin user from env");
    }
  }

  app.listen(PORT, () => console.log(`Server running on port ${PORT}`));
};

start().catch((err) => {
  console.error("Failed to start server", err);
  process.exit(1);
});

