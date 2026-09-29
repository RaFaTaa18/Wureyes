import express from "express";
import pool from "../db.js";

const router = express.Router();

router.get("/", async (req, res) => {
  try {
    const [rows] = await pool.query(`
      SELECT
        id,
        name,
        slug
      FROM categories
      ORDER BY name ASC
    `);

    res.json({
      success: true,
      data: rows,
    });
  } catch (error) {
    console.error("Categories error:", error);

    res.status(500).json({
      success: false,
      message: "Failed to retrieve categories",
    });
  }
});

export default router;