import express from "express";
import pool from "../db.js";

import {
  authenticateToken,
  requireAdmin,
} from "../middlware/auth.js";

const router = express.Router();


// =====================================================
// GET SERVICES - PUBLIC
// =====================================================

router.get("/", async (req, res) => {
  try {
    const [rows] = await pool.query(`
      SELECT
        id,
        name,
        slug,
        description,
        price,
        image_url,
        is_active,
        created_at,
        updated_at
      FROM services
      ORDER BY created_at DESC
    `);

    res.json({
      success: true,
      data: rows,
    });

  } catch (error) {

    console.error(
      "Get services error:",
      error
    );

    res.status(500).json({
      success: false,
      message: "Failed to retrieve services",
    });

  }
});


// =====================================================
// POST SERVICE - ADMIN ONLY
// =====================================================

router.post(
  "/",
  authenticateToken,
  requireAdmin,
  async (req, res) => {

    try {

      const {
        name,
        slug,
        description,
        price,
        image_url,
        is_active,
      } = req.body;


      if (!name || !slug) {

        return res.status(400).json({
          success: false,
          message:
            "name and slug are required",
        });

      }


      // Check duplicate slug

      const [existing] =
        await pool.query(
          `
          SELECT id
          FROM services
          WHERE slug = ?
          LIMIT 1
          `,
          [slug]
        );


      if (existing.length > 0) {

        return res.status(409).json({
          success: false,
          message:
            "Service slug already exists",
        });

      }


      const [result] =
        await pool.query(
          `
          INSERT INTO services
          (
            name,
            slug,
            description,
            price,
            image_url,
            is_active
          )
          VALUES (?, ?, ?, ?, ?, ?)
          `,
          [
            name,
            slug,
            description || null,
            price !== undefined &&
            price !== null &&
            price !== ""
              ? Number(price)
              : null,
            image_url || null,
            is_active !== undefined
              ? Boolean(is_active)
              : true,
          ]
        );


      res.status(201).json({
        success: true,
        message:
          "Service created successfully",
        data: {
          id: result.insertId,
        },
      });

    } catch (error) {

      console.error(
        "Create service error:",
        error
      );

      res.status(500).json({
        success: false,
        message:
          "Failed to create service",
      });

    }

  }
);


// =====================================================
// PUT SERVICE - ADMIN ONLY
// =====================================================

router.put(
  "/:id",
  authenticateToken,
  requireAdmin,
  async (req, res) => {

    try {

      const { id } = req.params;

      const {
        name,
        slug,
        description,
        price,
        image_url,
        is_active,
      } = req.body;


      if (!name || !slug) {

        return res.status(400).json({
          success: false,
          message:
            "name and slug are required",
        });

      }


      // Check service exists

      const [existingService] =
        await pool.query(
          `
          SELECT id
          FROM services
          WHERE id = ?
          LIMIT 1
          `,
          [id]
        );


      if (existingService.length === 0) {

        return res.status(404).json({
          success: false,
          message:
            "Service not found",
        });

      }


      // Check duplicate slug
      // excluding current service

      const [duplicateSlug] =
        await pool.query(
          `
          SELECT id
          FROM services
          WHERE slug = ?
          AND id != ?
          LIMIT 1
          `,
          [slug, id]
        );


      if (duplicateSlug.length > 0) {

        return res.status(409).json({
          success: false,
          message:
            "Service slug already exists",
        });

      }


      await pool.query(
        `
        UPDATE services
        SET
          name = ?,
          slug = ?,
          description = ?,
          price = ?,
          image_url = ?,
          is_active = ?
        WHERE id = ?
        `,
        [
          name,
          slug,
          description || null,
          price !== undefined &&
          price !== null &&
          price !== ""
            ? Number(price)
            : null,
          image_url || null,
          is_active !== undefined
            ? Boolean(is_active)
            : true,
          id,
        ]
      );


      res.json({
        success: true,
        message:
          "Service updated successfully",
      });

    } catch (error) {

      console.error(
        "Update service error:",
        error
      );

      res.status(500).json({
        success: false,
        message:
          "Failed to update service",
      });

    }

  }
);


// =====================================================
// DELETE SERVICE - ADMIN ONLY
// =====================================================

router.delete(
  "/:id",
  authenticateToken,
  requireAdmin,
  async (req, res) => {

    try {

      const { id } = req.params;


      // Check if service exists

      const [existingService] =
        await pool.query(
          `
          SELECT id
          FROM services
          WHERE id = ?
          LIMIT 1
          `,
          [id]
        );


      if (existingService.length === 0) {

        return res.status(404).json({
          success: false,
          message:
            "Service not found",
        });

      }


      // Check whether service is used
      // by bookings

      const [bookings] =
        await pool.query(
          `
          SELECT COUNT(*) AS total
          FROM bookings
          WHERE service_id = ?
          `,
          [id]
        );


      if (Number(bookings[0].total) > 0) {

        return res.status(409).json({
          success: false,
          message:
            "This service cannot be deleted because it is already used by bookings. Deactivate it instead.",
        });

      }


      await pool.query(
        `
        DELETE FROM services
        WHERE id = ?
        `,
        [id]
      );


      res.json({
        success: true,
        message:
          "Service deleted successfully",
      });

    } catch (error) {

      console.error(
        "Delete service error:",
        error
      );

      res.status(500).json({
        success: false,
        message:
          "Failed to delete service",
      });

    }

  }
);


export default router;