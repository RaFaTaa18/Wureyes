import express from "express";
import pool from "../db.js";

const router = express.Router();

router.get("/", async (req, res) => {
  try {
    const [rows] = await pool.query(`
      SELECT
        id,
        client_name,
        client_role,
        message,
        rating,
        image_url,
        created_at
      FROM testimonials
      WHERE is_published = TRUE
      ORDER BY created_at DESC
    `);

    res.json({
      success: true,
      data: rows,
    });
  } catch (error) {
    console.error("Testimonials error:", error);

    res.status(500).json({
      success: false,
      message: "Failed to retrieve testimonials",
    });
  }
});

export default router;