import { NextFunction, Request, Response } from "express";
import prisma from "../../../../packages/libs/prisma/index";
import {
  AuthError,
  NotFoundError,
  ValidationError,
} from "../../../../packages/error-handler";
import imagekit from "../../../../packages/libs/imagekit";
import { request } from "http";
import { Prisma } from "@prisma/client";

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

//get stripe seller information

//get all products
export const getAllProducts = async (
  req: Request,
  res: Response,
  next: NextFunction
): Promise<void> => {
  try {
    const page = parseInt(req.query.page as string) || 1;
    const limit = parseInt(req.query.limit as string) || 20;
    const skip = (page - 1) * limit;
    const type = req.query.type;

    // Debug: First, let's see what products exist without any filters
    const totalProductsInDB = await prisma.products.count();
    console.log("Total products in database:", totalProductsInDB);

    // Sample a few products to check their structure
    const sampleProducts = await prisma.products.findMany({
      take: 2,
      select: {
        id: true,
        title: true,
        starting_date: true,
        ending_date: true,
        status: true,
        isDeleted: true,
      },
    });
    console.log("Sample products:", sampleProducts);

    // Updated filter logic - more flexible
    const baseFilter = {
      // Only include non-deleted products
      isDeleted: { not: true },

      // Include active products
      status: "Active",

      // For time-based filtering, include products that are:
      // 1. Have no start/end dates (always available)
      // 2. Started but not ended
      // 3. Within the active date range
      AND: [
        {
          OR: [{ starting_date: null }, { starting_date: { lte: new Date() } }],
        },
        {
          OR: [{ ending_date: null }, { ending_date: { gte: new Date() } }],
        },
      ],
    };

    // If you just want to get ALL products for testing, use this simple filter:
    const simpleFilter = {
      isDeleted: { not: true },
    };

    // Use simpleFilter for testing, then switch to baseFilter
    const filterToUse = simpleFilter; // Change this to baseFilter when ready

    const orderBy: Prisma.productsOrderByWithRelationInput =
      type === "latest"
        ? { createdAt: "desc" as Prisma.SortOrder }
        : { totalSales: "desc" as Prisma.SortOrder };

    const [products, total, top10Products] = await Promise.all([
      prisma.products.findMany({
        skip,
        take: limit,
        include: {
          images: true,
          Shop: true,
        },
        where: filterToUse,
        orderBy: {
          totalSales: "desc",
        },
      }),

      prisma.products.count({ where: filterToUse }),

      prisma.products.findMany({
        take: 10,
        where: filterToUse,
        orderBy,
        include: {
          images: true,
          Shop: true,
        },
      }),
    ]);

    console.log("Filtered products count:", total);
    console.log("Products found:", products.length);

    res.status(200).json({
      products,
      top10By: type === "latest" ? "latest" : "topSales",
      top10Products,
      total,
      currentPage: page,
      totalPages: Math.ceil(total / limit),
    });
    return;
  } catch (error) {
    console.error("Error in getAllProducts:", error);
    next(error);
    return;
  }
};

//get product details
export const getProductDetails = async (
  req: Request,
  res: Response,
  next: NextFunction
) => {
  try {
    const product = await prisma.products.findUnique({
      where: {
        slug: req.params.slug!,
      },
      include: {
        images: true,
        Shop: true,
      },
    });

    // Check if product exists
    if (!product) {
      return res.status(404).json({
        success: false,
        message: "Product not found",
      });
    }

    // Use 200 for successful GET requests, not 201
    res.status(200).json({
      success: true,
      product,
    });
  } catch (error) {
    return next(error);
  }
};

//get filtered products

export const getFilteredProducts = async (
  req: Request,
  res: Response,
  next: NextFunction
) => {
  try {
    console.log("=== DEBUGGING FILTERED PRODUCTS ===");
    console.log("Raw query params:", req.query);

    const {
      priceRange = "0,10000",
      categories,
      colors,
      sizes,
      page = "1",
      limit = "12",
    } = req.query;

    const parsedPriceRange =
      typeof priceRange === "string"
        ? priceRange.split(",").map(Number)
        : [0, 10000];

    const parsedPage = parseInt(page as string) || 1;
    const parsedLimit = parseInt(limit as string) || 12;
    const skip = (parsedPage - 1) * parsedLimit;

    // Base filters - removed starting_date filter
    const filters: Record<string, any> = {
      sale_price: {
        gte: parsedPriceRange[0],
        lte: parsedPriceRange[1],
      },
      isDeleted: { not: true }, // Add this filter
    };

    // Add optional filters
    if (categories) {
      const parsedCategories = Array.isArray(categories)
        ? categories
        : String(categories).split(",").filter(Boolean);

      if (parsedCategories.length > 0) {
        filters.category = { in: parsedCategories };
      }
    }

    if (colors) {
      const parsedColors = Array.isArray(colors)
        ? colors
        : String(colors).split(",").filter(Boolean);

      if (parsedColors.length > 0) {
        filters.colors = { hasSome: parsedColors };
      }
    }

    if (sizes) {
      const parsedSizes = Array.isArray(sizes)
        ? sizes
        : String(sizes).split(",").filter(Boolean);

      if (parsedSizes.length > 0) {
        filters.sizes = { hasSome: parsedSizes };
      }
    }

    console.log("Final filters:", JSON.stringify(filters, null, 2));

    // First, test without any filters to see if products exist
    const testQuery = await prisma.products.findMany({
      where: { isDeleted: { not: true } },
      take: 5,
      select: { id: true, title: true, sale_price: true, starting_date: true },
    });

    console.log("Test query results:", testQuery);

    const [products, total] = await Promise.all([
      prisma.products.findMany({
        where: filters,
        skip,
        take: parsedLimit,
        include: { images: true, Shop: true },
      }),
      prisma.products.count({ where: filters }),
    ]);

    console.log("Filtered products count:", products.length);
    console.log("Total count:", total);
    console.log("=== END DEBUGGING ===");

    const totalPages = Math.ceil(total / parsedLimit);

    res.json({
      products,
      pagination: { total, page: parsedPage, totalPages },
    });
  } catch (error) {
    console.error("Error in getFilteredProducts:", error);
    next(error);
  }
};

//get filtered offrs
export const getFilteredEvents = async (
  req: Request,
  res: Response,
  next: NextFunction
) => {
  try {
    const {
      priceRange = "0, 10000",
      categories,
      colors,
      sizes,
      page = "1",
      limit = "12",
    } = req.query;

    const parsedPriceRange =
      typeof priceRange === "string"
        ? priceRange.split(",").map(Number)
        : [0, 10000];
    const parsedPage = parseInt(page as string) || 1;
    const parsedLimit = parseInt(limit as string) || 12;
    const skip = (parsedPage - 1) * parsedLimit;

    // Base filters - removed starting_date filter
    const filters: Record<string, any> = {
      sale_price: {
        gte: parsedPriceRange[0],
        lte: parsedPriceRange[1],
      },
      isDeleted: { not: true }, // Add this filter
    };

    // Add optional filters
    if (categories) {
      const parsedCategories = Array.isArray(categories)
        ? categories
        : String(categories).split(",").filter(Boolean);

      if (parsedCategories.length > 0) {
        filters.category = { in: parsedCategories };
      }
    }

    if (colors) {
      const parsedColors = Array.isArray(colors)
        ? colors
        : String(colors).split(",").filter(Boolean);

      if (parsedColors.length > 0) {
        filters.colors = { hasSome: parsedColors };
      }
    }

    if (sizes) {
      const parsedSizes = Array.isArray(sizes)
        ? sizes
        : String(sizes).split(",").filter(Boolean);

      if (parsedSizes.length > 0) {
        filters.sizes = { hasSome: parsedSizes };
      }
    }

    console.log("Final filters:", JSON.stringify(filters, null, 2));

    // First, test without any filters to see if products exist
    const testQuery = await prisma.products.findMany({
      where: { isDeleted: { not: true } },
      take: 5,
      select: { id: true, title: true, sale_price: true, starting_date: true },
    });

    console.log("Test query results:", testQuery);

    const [products, total] = await Promise.all([
      prisma.products.findMany({
        where: filters,
        skip,
        take: parsedLimit,
        include: { images: true, Shop: true },
      }),
      prisma.products.count({ where: filters }),
    ]);

    console.log("Filtered products count:", products.length);
    console.log("Total count:", total);
    console.log("=== END DEBUGGING ===");

    const totalPages = Math.ceil(total / parsedLimit);

    res.json({
      products,
      pagination: { total, page: parsedPage, totalPages },
    });
  } catch (error) {
    console.error("Error in getFilteredProducts:", error);
    next(error);
  }
};

//get filtered shops
export const getFilteredShops = async (
  req: Request,
  res: Response,
  next: NextFunction
) => {
  try {
    const { categories = [], countries = [], page = 1, limit = 12 } = req.query;

    const parsedPage = Number(page);
    const parsedLimit = Number(limit);
    const skip = (parsedPage - 1) * parsedLimit;

    const filters: Record<string, any> = {};

    if (categories && String(categories).length > 0) {
      filters.category = {
        in: Array.isArray(categories)
          ? categories
          : String(categories).split(","),
      };
    }

    if (countries && String(countries).length > 0) {
      filters.country = {
        in: Array.isArray(countries) ? countries : String(countries).split(","),
      };
    }

    const [shops, total] = await Promise.all([
      prisma.shops.findMany({
        where: filters,
        skip,
        take: parsedLimit,
        include: {
          sellers: true,
          // followers: true,
          products: true,
        },
      }),
      prisma.shops.count({ where: filters }),
    ]);

    const totalPages = Math.ceil(total / parsedLimit);

    res.json({
      shops,
      pagination: { total, page: parsedPage, totalPages },
    });
  } catch (error) {
    next(error);
  }
};

//search products
export const searchProducts = async (
  req: Request,
  res: Response,
  next: NextFunction
) => {
  try {
    const query = req.query.q as string;

    if (!query || query.trim().length === 0) {
      return res.status(400).json({ message: "Search query is required!" });
    }

    const products = await prisma.products.findMany({
      where: {
        OR: [
          {
            title: {
              contains: query,
              mode: "insensitive",
            },
          },
          {
            short_description: {
              contains: query,
              mode: "insensitive",
            },
          },
        ],
      },
      select: {
        id: true,
        title: true,
        slug: true,
      },
      take: 10,
      orderBy: {
        createdAt: "desc",
      },
    });

    return res.status(200).json({ products });
  } catch (error) {
    return next(error);
  }
};

//search products
export const topShops = async (
  req: Request,
  res: Response,
  next: NextFunction
) => {
  try {
    //aggregate total sales per shop from opders
    const topShopsData = await prisma.orders.groupBy({
      by: ["shopId"],
      _sum: { total: true },
      orderBy: { _sum: { total: "desc" } },
      take: 10,
    });

    //fetch the corresponding shop details
    const shopIds = topShopsData.map((item) => item.shopId);

    const shops = await prisma.shops.findMany({
      where: {
        id: {
          in: shopIds,
        },
      },
      select: {
        id: true,
        name: true,
        avatar: true,
        coverBanner: true,
        address: true,
        ratings: true,
        // followers: true,
        category: true,
      },
    });

    //merge sales with shop data
    const enrichedShops = shops.map((shop) => {
      const salesData = topShopsData.find((s) => s.shopId === shop.id);
      return {
        ...shop,
        totalSales: salesData?._sum.total ?? 0,
      };
    });

    const top10Shops = enrichedShops
      .sort((a, b) => b.totalSales - a.totalSales)
      .slice(0, 10);

    return res.status(200).json({ shops: top10Shops });
  } catch (error) {
    console.log("Error fetching top shops:", error);
    return next(error);
  }
};
