import { NextFunction, Request, Response } from "express";
import prisma from "../../../../packages/libs/prisma/index";
import {
  AuthError,
  NotFoundError,
  ValidationError,
} from "../../../../packages/error-handler";
import imagekit from "../../../../packages/libs/imagekit";
import { request } from "http";

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

//upload product image
export const uploadProductImage = async (
  req: Request,
  res: Response,
  next: NextFunction
) => {
  try {
    const { fileName } = req.body;
    const response = await imagekit.upload({
      file: fileName,
      fileName: `product-${Date.now()}.jpg`,
      folder: "/products",
    });

    res.status(201).json({
      file_url: response.url,
      fileId: response.fileId,
    });
  } catch (error) {
    next(error);
  }
};

//delete product image
export const deleteProductImage = async (
  req: Request,
  res: Response,
  next: NextFunction
) => {
  try {
    const { fileId } = req.body;

    const response = await imagekit.deleteFile(fileId);

    res.status(201).json({
      success: true,
      response,
    });
  } catch (error) {
    next(error);
  }
};

//create product
export const createProduct = async (
  req: any,
  res: Response,
  next: NextFunction
) => {
  try {
    const {
      title,
      short_description,
      detailed_description,
      warranty,
      custom_specifications = [],
      slug,
      tags,
      cash_on_delivery,
      brand,
      video_url,
      category,
      colors = [],
      sizes = [],
      discountCodes = [],
      stock,
      sale_price,
      regular_price,
      subCategory,
      customProperties = {},
      images = [],
    } = req.body;

    // Basic validation for required fields
    const requiredFields = [
      title,
      slug,
      short_description,
      category,
      subCategory,
      tags,
      stock,
      sale_price,
      regular_price,
      images,
    ];

    if (
      requiredFields.some(
        (field) => !field || (Array.isArray(field) && field.length === 0)
      )
    ) {
      return next(new ValidationError("Missing required fields!"));
    }

    // Seller auth check
    const sellerId = req?.seller?.id;
    const shopId = req?.seller?.shop?.id;

    if (!sellerId || !shopId) {
      return next(new AuthError("Only seller can create products!"));
    }

    // Slug uniqueness check
    const existingProduct = await prisma.products.findUnique({
      where: { slug },
    });
    if (existingProduct) {
      return next(
        new ValidationError("Slug already exists! Please use a different slug.")
      );
    }

    // Create product
    const newProduct = await prisma.products.create({
      data: {
        title,
        brand,
        short_description,
        detailed_description,
        warranty,
        cashOnDelivery: cash_on_delivery,
        slug,
        shopId,
        tags: Array.isArray(tags) ? tags : tags.split(","),
        video_url,
        category,
        subCategory,
        colors,
        sizes,
        discount_codes: discountCodes,
        stock: parseInt(stock),
        sale_price: parseFloat(sale_price),
        regular_price: parseFloat(regular_price),
        custom_properties: customProperties,
        custom_specifications,
        images: {
          create: images
            .filter((img: any) => img?.fileId && img?.file_url)
            .map((image: any) => ({
              file_id: image.fileId,
              url: image.file_url,
            })),
        },
      },
      include: { images: true },
    });

    return res.status(201).json({
      success: true,
      product: newProduct,
    });
  } catch (error) {
    next(error);
  }
};

//get logged in seller products
export const getShopProducts = async (
  req: any,
  res: Response,
  next: NextFunction
) => {
  try {
    const products = await prisma.products.findMany({
      where: {
        shopId: req?.seller?.shop?.id,
      },
      include: {
        images: true,
      },
    });

    res.status(201).json({
      success: true,
      products,
    });
  } catch (error) {
    next(error);
  }
};

//delete product
export const deleteProduct = async (
  req: any,
  res: Response,
  next: NextFunction
) => {
  try {
    const { productId } = req.params;
    const sellerId = req.seller?.shop?.id;

    const product = await prisma.products.findUnique({
      where: { id: productId },
      select: { id: true, shopId: true, isDeleted: true },
    });

    if (!product) {
      return next(new ValidationError("Product not found!"));
    }

    if (product.shopId !== sellerId) {
      return next(new ValidationError("Unauthorized action!"));
    }

    if (product.isDeleted) {
      return next(new ValidationError("Product is already deleted!"));
    }

    const deletedProduct = await prisma.products.update({
      where: { id: productId },
      data: {
        isDeleted: true,
        deletedAt: new Date(Date.now() + 24 * 60 * 60 * 1000),
      },
    });

    return res.status(200).json({
      message:
        "Product is scheduled for deletion in 24 hours. You can restore it within this time period.",
      deletedAt: deletedProduct.deletedAt,
    });
  } catch (error) {
    next(error);
  }
};

//restore product
export const restoreProduct = async (
  req: any,
  res: Response,
  next: NextFunction
) => {
  try {
    const { productId } = req.params;
    const sellerId = req.seller?.shop?.id;

    const product = await prisma.products.findUnique({
      where: { id: productId },
      select: { id: true, shopId: true, isDeleted: true },
    });

    if (!product) {
      return next(new ValidationError("Product not found!"));
    }

    if (product.shopId !== sellerId) {
      return next(new ValidationError("Unauthorized action!"));
    }

    if (!product.isDeleted) {
      return res.status(400).json({
        message: "Product is not in deleted state!",
      });
    }

    await prisma.products.update({
      where: { id: productId },
      data: {
        isDeleted: false,
        deletedAt: null,
      },
    });

    return res.status(200).json({
      message: "Product successfully restored.",
    });
  } catch (error) {
    return res.status(500).json({
      message: "Error restoring product.",
      error,
    });
  }
};
