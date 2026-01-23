import express from "express";
import cors from "cors";
import dotenv from "dotenv";
import authRoutes from "./backend/routes/auth.js";
import sleepRoutes from "./backend/routes/sleep.js";

dotenv.config();

const app = express();
const port = process.env.PORT || 3000;

// Middleware
app.use(cors());
app.use(express.json());

// Routes
app.use("/api/users", authRoutes);
app.use("/api/sleep", sleepRoutes);

app.get("/", (req, res) => {
    res.send("DeepSleep API Server is running");
});

app.listen(port, () => {
    console.log(`Server running at http://localhost:${port}`);
});
