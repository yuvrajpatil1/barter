import { NextFunction, Request, Response } from "express";
import prisma from "../../../../packages/libs/prisma";

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

    // Ensure data is in expected format
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
