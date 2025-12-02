import express from "express";
import { User } from "../models/User.js";

const router = express.Router();

/* ============================================================================
   GET — All users (for testing / admin)
============================================================================ */
router.get("/", async (req, res) => {
  try {
    const users = await User.find().select("-password");
    res.json(users);
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

/* ============================================================================
   GET — Single user by ID
============================================================================ */
router.get("/:id", async (req, res) => {
  const { id } = req.params;

  try {
    const user = await User.findById(id).select("-password");
    if (!user) {
      return res.status(404).json({ error: "User not found." });
    }
    res.json(user);
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

/* ============================================================================
   POST — Register user
   (Frontend: POST /api/users/register)
============================================================================ */
router.post("/register", async (req, res) => {
  try {
    const { name, email, password } = req.body;

    if (!name || !email || !password) {
      return res
        .status(400)
        .json({ error: "Name, email, and password are required." });
    }

    const existing = await User.findOne({ email });
    if (existing) {
      return res.status(400).json({ error: "Email is already registered." });
    }

    const newUser = new User({ name, email, password });
    const saved = await newUser.save();

    const safeUser = {
      _id: saved._id,
      name: saved.name,
      email: saved.email,
    };

    res.status(201).json(safeUser);
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

/* ============================================================================
   POST — Login user
   (Frontend: POST /api/users/login)
============================================================================ */
router.post("/login", async (req, res) => {
  try {
    const { email, password } = req.body;

    if (!email || !password) {
      return res
        .status(400)
        .json({ error: "Email and password are required." });
    }

    const user = await User.findOne({ email });

    if (!user || user.password !== password) {
      // Very simple check, no hashing (for learning only)
      return res.status(401).json({ error: "Invalid credentials." });
    }

    // Return user data without password
    const safeUser = {
      _id: user._id,
      name: user.name,
      email: user.email,
    };

    res.json({ user: safeUser });
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

export default router;