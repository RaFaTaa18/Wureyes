import express from "express";
import pool from "../db.js";
import {
  authenticateToken,
  requireAdmin,
} from "../middlware/auth.js";

const router = express.Router();

// GET semua pesan
router.get(
  "/",
  authenticateToken,
  requireAdmin,
  async (req, res) => {
  try {
    const [rows] = await pool.query(`
      SELECT
        id,
        name,
        email,
        subject,
        message,
        status,
        created_at
      FROM messages
      ORDER BY created_at DESC
    `);

    res.json({
      success: true,
      data: rows,
    });
  } catch (error) {
    console.error("Messages error:", error);

    res.status(500).json({
      success: false,
      message: "Failed to retrieve messages",
    });
  }
});

// POST pesan baru
router.post("/", async (req, res) => {
  try {
    const {
      name,
      email,
      subject,
      message,
    } = req.body;

    if (!name || !email || !message) {
      return res.status(400).json({
        success: false,
        message: "name, email, and message are required",
      });
    }

    const [result] = await pool.query(
      `
      INSERT INTO messages
      (
        name,
        email,
        subject,
        message
      )
      VALUES (?, ?, ?, ?)
      `,
      [
        name,
        email,
        subject || null,
        message,
      ]
    );

    res.status(201).json({
      success: true,
      message: "Message sent successfully",
      data: {
        id: result.insertId,
      },
    });
  } catch (error) {
    console.error("Create message error:", error);

    res.status(500).json({
      success: false,
      message: "Failed to send message",
    });
  }
});


// =====================================================
// UPDATE MESSAGE STATUS - ADMIN ONLY
// =====================================================

router.patch(
  "/:id/status",
  authenticateToken,
  requireAdmin,
  async (req, res) => {
    try {
      const { id } = req.params;
      const { status } = req.body;

      const allowedStatuses = [
        "unread",
        "read",
        "replied",
      ];

      if (!allowedStatuses.includes(status)) {
        return res.status(400).json({
          success: false,
          message: "Invalid message status",
        });
      }

      const [existing] = await pool.query(
        `
        SELECT id
        FROM messages
        WHERE id = ?
        LIMIT 1
        `,
        [id]
      );

      if (existing.length === 0) {
        return res.status(404).json({
          success: false,
          message: "Message not found",
        });
      }

      await pool.query(
        `
        UPDATE messages
        SET status = ?
        WHERE id = ?
        `,
        [status, id]
      );

      res.json({
        success: true,
        message:
          "Message status updated successfully",
      });

    } catch (error) {

      console.error(
        "Update message status error:",
        error
      );

      res.status(500).json({
        success: false,
        message:
          "Failed to update message status",
      });
    }
  }
);

export default router;