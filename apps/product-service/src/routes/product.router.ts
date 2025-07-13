import express, { Router } from "express";
import {
  createDiscountCode,
  deleteDiscountCode,
  getCategories,
  getDiscountCodes,
  uploadProductImage,
} from "../controllers/product.controller";
import isAuthenticated from "../../../../packages/middleware/isAuthenticated";

const router: Router = express.Router();

router.get("/get-categories", getCategories);
router.post("/create-discount-code", isAuthenticated, createDiscountCode);
router.get("/get-discount-codes", isAuthenticated, getDiscountCodes);
router.delete("/delete-discount-code/:id", isAuthenticated, deleteDiscountCode);
router.post("/upload-product-image", isAuthenticated, uploadProductImage);

export default router;
