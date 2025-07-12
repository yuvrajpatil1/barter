import { NextFunction, Request, Response } from "express";
import prisma from "../../../../packages/libs/prisma/index";
import {
  NotFoundError,
  ValidationError,
} from "../../../../packages/error-handler";

//get product categories
export const getCategories = async (
  req: Request,
  res: Response,
  next: NextFunction
) => {
  try {
    const config = await prisma.site_config.findFirst();

    if (!config) {
      return res.status(200).json({
        categories: [],
        subCategories: {},
      });
    }

    const categories = Array.isArray(config.categories)
      ? config.categories
      : [];
    const subCategories =
      typeof config.subCategories === "object" && config.subCategories !== null
        ? config.subCategories
        : {};

    return res.status(200).json({
      categories,
      subCategories,
    });
  } catch (error) {
    console.error("Database error in getCategories:", error);
    return next(error);
  }
};

//Create discount codes
export const createDiscountCode = async (
  req: any,
  res: Response,
  next: NextFunction
) => {
  try {
    const { public_name, discountType, discountValue, discountCode } = req.body;

    if (!public_name || !discountType || !discountValue || !discountCode) {
      return next(new ValidationError("All fields are required!"));
    }

    const parsedDiscountValue = parseFloat(discountValue);
    if (isNaN(parsedDiscountValue) || parsedDiscountValue <= 0) {
      return next(
        new ValidationError("Discount value must be a positive number!")
      );
    }

    if (discountType === "percentage" && parsedDiscountValue > 100) {
      return next(
        new ValidationError("Percentage discount cannot exceed 100%!")
      );
    }

    const isDiscountCodeExist = await prisma.discount_codes.findUnique({
      where: {
        discountCode,
      },
    });

    if (isDiscountCodeExist) {
      return next(
        new ValidationError(
          "Discount code already available, please use a different code!"
        )
      );
    }

    const discount_code = await prisma.discount_codes.create({
      data: {
        public_name,
        discountType,
        discountValue: parsedDiscountValue,
        discountCode,
        sellerId: req.seller.id,
      },
    });

    res.status(201).json({
      success: true,
      discount_code,
    });
  } catch (error) {
    next(error);
  }
};

//get Discount codes
export const getDiscountCodes = async (
  req: any,
  res: Response,
  next: NextFunction
) => {
  try {
    const discount_codes = await prisma.discount_codes.findMany({
      where: {
        sellerId: req.seller.id,
      },
      orderBy: {
        createdAt: "desc",
      },
    });

    res.status(200).json({
      success: true,
      discount_codes,
    });
  } catch (error) {
    next(error);
  }
};

//delete discount codes
export const deleteDiscountCode = async (
  req: any,
  res: Response,
  next: NextFunction
) => {
  try {
    const { id } = req.params;
    const sellerId = req.seller.id;

    if (!id) {
      return next(new ValidationError("Discount code ID is required!"));
    }

    const discountCode = await prisma.discount_codes.findUnique({
      where: { id },
      select: { id: true, sellerId: true },
    });

    if (!discountCode) {
      return next(new NotFoundError("Discount code not found!"));
    }

    if (discountCode.sellerId !== sellerId) {
      return next(new ValidationError("Unauthorized Access!"));
    }

    await prisma.discount_codes.delete({ where: { id } });

    return res.status(200).json({
      success: true,
      message: "Discount code deleted successfully.",
    });
  } catch (error) {
    next(error);
  }
};
