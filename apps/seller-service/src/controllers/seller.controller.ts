import { NextFunction, Request, Response } from "express";
import prisma from "../../../../packages/libs/prisma";
import {
  AuthError,
  ForbiddenError,
  NotFoundError,
  ValidationError,
} from "../../../../packages/error-handler";
import imagekit from "../../../../packages/libs/imagekit";

//delete shop (soft delete)
export const deleteShop = async (
  req: any,
  res: Response,
  next: NextFunction
) => {
  try {
    const sellerId = req.seller?.id;

    //Find seller with shop
    const seller = await prisma.sellers.findUnique({
      where: { id: sellerId },
      include: { shop: true },
    });

    if (!seller || !seller.shop) {
      return next(new NotFoundError("Seller or shop not found."));
    }

    //28 days from now
    const deletedAt = new Date();
    deletedAt.setDate(deletedAt.getDate() + 28);

    //soft delete both seller and shop
    await prisma.$transaction([
      prisma.sellers.update({
        where: { id: sellerId },
        data: {
          isDeleted: true,
          deletedAt,
        },
      }),
      prisma.shops.update({
        where: { id: seller.shop.id },
        data: { isDeleted: true, deletedAt },
      }),
    ]);
    return res.status(200).json({
      message:
        "Shop and seller marked for deletion. Will be permanantly deleted in 24 hours.",
    });
  } catch (error) {
    return next(error);
  }
};

//restore shop
export const restoreShop = async (
  req: any,
  res: Response,
  next: NextFunction
) => {
  try {
    const sellerId = req.seller?.id;

    //find seller with shop
    const seller = await prisma.sellers.findUnique({
      where: { id: sellerId },
      include: { shop: true },
    });

    if (!seller || !seller.shop) {
      return next(new NotFoundError("Seller or Shop not found."));
    }

    if (
      !seller.isDeleted ||
      !seller.deletedAt ||
      !seller.shop.isDeleted ||
      !seller.shop.deletedAt
    ) {
      return next(
        new ForbiddenError("Forbidden Access")
        // Seller or Shop  is not marked for deletion
      );
    }

    const now = new Date();
    const deletedAt = new Date(seller.deletedAt);

    if (now > deletedAt) {
      return next(
        new ForbiddenError(
          "Forbidden Access"
          //   "Cannot restore. The 28-day recovery period has expired."
        )
      );
    }

    //Restore both seller and shop
    await prisma.$transaction([
      prisma.sellers.update({
        where: { id: sellerId },
        data: { isDeleted: false, deletedAt: null },
      }),
      prisma.shops.update({
        where: { id: seller.shop.id },
        data: {
          isDeleted: false,
          deletedAt: null,
        },
      }),
    ]);

    return res.status(200).json({
      message: "Shop and seller have been successfully restored.",
    });
  } catch (error) {
    return next(error);
  }
};

//upload img
export const uploadImage = async (
  req: Request,
  res: Response,
  next: NextFunction
) => {
  try {
    const { file, fileName, folder } = req.body;
    if (!file || !fileName || !folder) {
      return res
        .status(400)
        .json({ success: false, message: "Missing required fields." });
    }

    //Upload img to imagekit
    const uploadResponse = await imagekit.upload({
      file,
      fileName,
      folder,
    });

    return res.status(201).json({
      success: true,
      file_id: uploadResponse.fileId,
      url: uploadResponse.url,
    });
  } catch (error) {
    return next(error);
  }
};

//update avatar and cover photo
export const updateProfilePictures = async (
  req: any,
  res: Response,
  next: NextFunction
) => {
  try {
    const { editType, imageUrl } = req.body;

    if (!editType || !imageUrl) {
      return next(new ValidationError("Missing required fields!"));
    }

    //ensure the user is authenticated
    if (!req.seller?.id) {
      return next(new AuthError("Only sellers can update profile"));
    }

    //determine update field(avatar or cover)
    const updateField =
      editType === "cover" ? { coverBanner: imageUrl } : { avatar: imageUrl };

    //Update sellers profile
    const updatedSeller = await prisma.shops.update({
      where: { sellerId: req.seller.id },
      data: updateField,
      select: {
        id: true,
        avatar: true,
        coverBanner: true,
      },
    });

    res.status(200).json({
      success: true,
      message: `${
        editType === "cover" ? "Cover photo" : "Avatar"
      } updated successfully!`,
      updatedSeller,
    });
  } catch (error) {
    return next(error);
  }
};

//edit seller profile
export const editSellerProfile = async (
  req: any,
  res: Response,
  next: NextFunction
) => {
  try {
    const { name, bio, address, opening_hours, website, socialLinks } =
      req.body;

    if (
      !name ||
      !bio ||
      !address ||
      !opening_hours ||
      !website ||
      !socialLinks
    ) {
      return next(new ValidationError("Please fill all the fields."));
    }

    //ensure the user is authenticated
    if (!req.seller?.id) {
      return next(new AuthError("Only sellers can edit their profile."));
    }

    //check if the shop exists for the seller
    const existingShop = await prisma.shops.findUnique({
      where: { sellerId: req.seller.id },
    });

    if (!existingShop) {
      return next(new ValidationError("Shop not found for this seller"));
    }

    //Update the shop profile
    const updatedShop = await prisma.shops.update({
      where: { sellerId: req.seller.id },
      data: { name, bio, address, opening_hours, website, socialLinks },
      select: {
        id: true,
        name: true,
        bio: true,
        address: true,
        opening_hours: true,
        website: true,
        socialLinks: true,
        updatedAt: true,
      },
    });

    res.status(200).json({
      success: true,
      message: "Shop profile updated successsfully.",
      updatedShop,
    });
  } catch (error) {
    return next(error);
  }
};

//get seller(public preview)
export const getSellerInfo = async (
  req: Request,
  res: Response,
  next: NextFunction
) => {
  try {
    const shop = await prisma.shops.findUnique({
      where: { id: req.params.id },
    });

    const followersCount = await prisma.followers.count({
      where: { shopsId: shop?.id },
    });

    res.status(201).json({
      success: true,
      shop,
      followersCount,
    });
  } catch (error) {
    return next(error);
  }
};

//get seller products(public preview)
export const getSellerProducts = async (
  req: any,
  res: Response,
  next: NextFunction
) => {
  try {
    const page = parseInt(req.query.page as string) || 1;
    const limit = parseInt(req.query.limit as string) || 10;
    const skip = (page - 1) * limit;

    const [products, total] = await Promise.all([
      prisma.products.findMany({
        where: {
          starting_date: null,
          shopId: req.query.id!,
        },
        skip,
        take: limit,
        orderBy: {
          createdAt: "desc",
        },
        include: {
          images: true,
          Shop: true,
        },
      }),

      prisma.products.count({
        where: {
          starting_date: null,
          shopId: req.query.id!,
        },
      }),
    ]);

    res.status(200).json({
      success: true,
      products,
      pagination: {
        total,
        page,
        limit,
        totalPages: Math.ceil(total / limit),
      },
    });
  } catch (error) {
    return next(error);
  }
};

//get seller events(public preview)
export const getSellerEvents = async (
  req: any,
  res: Response,
  next: NextFunction
) => {
  try {
    const page = parseInt(req.query.page as string) || 1;
    const limit = parseInt(req.query.limit as string) || 10;
    const skip = (page - 1) * limit;

    const [products, total] = await Promise.all([
      prisma.products.findMany({
        where: {
          starting_date: {
            not: null,
          },
          shopId: req.query.id!,
        },
        skip,
        take: limit,
        orderBy: {
          createdAt: "desc",
        },
        include: {
          images: true,
        },
      }),

      prisma.products.count({
        where: {
          starting_date: null,
          shopId: req.query.id!,
        },
      }),
    ]);

    res.status(200).json({
      success: true,
      products,
      pagination: {
        total,
        page,
        limit,
        totalPages: Math.ceil(total / limit),
      },
    });
  } catch (error) {
    return next(error);
  }
};

//follow a page
export const followShop = async (
  req: any,
  res: Response,
  next: NextFunction
) => {
  try {
    const { shopId } = req.body;

    if (!shopId) {
      return next(new ValidationError("Shop id is required!"));
    }

    //check if already followed
    const existingFollow = await prisma.followers.findFirst({
      where: {
        userId: req.user?.id,
        shopsId: shopId,
      },
    });

    if (existingFollow) {
      return res.status(200).json({
        success: true,
        message: "Already following this shop.",
      });
    }

    //create new follow
    const follow = await prisma.followers.create({
      data: {
        userId: req.user?.id,
        shopsId: shopId,
      },
    });

    res.status(201).json({
      success: true,
      follow,
    });
  } catch (error) {
    return next(error);
  }
};

//unfollow a page
export const unfollowShop = async (
  req: any,
  res: Response,
  next: NextFunction
) => {
  try {
    const { shopId } = req.body;

    if (!shopId) {
      return next(new ValidationError("Shop id is required!"));
    }

    //check if already followed
    const existingFollow = await prisma.followers.findFirst({
      where: {
        userId: req.user?.id,
        shopsId: shopId,
      },
    });

    if (!existingFollow) {
      return res.status(404).json({
        success: true,
        message: "You are not following this shop.",
      });
    }

    await prisma.followers.delete({
      where: {
        id: existingFollow.id,
      },
    });

    res.status(201).json({
      success: true,
      message: "Successfully unfollowed the shop.",
    });
  } catch (error) {
    return next(error);
  }
};

//is following
export const isFollowing = async (
  req: any,
  res: Response,
  next: NextFunction
) => {
  try {
    const shopId = req.params.id;

    if (!shopId) {
      return next(new ValidationError("Shop id is required!"));
    }

    //check if already followed
    const isFollowing = await prisma.followers.findFirst({
      where: {
        userId: req.user?.id,
        shopsId: shopId,
      },
    });

    res.status(201).json({
      success: true,
      isFollowing,
    });
  } catch (error) {
    return next(error);
  }
};

//fetching notifications for seller
export const sellerNotifications = async (
  req: any,
  res: Response,
  next: NextFunction
) => {
  try {
    const sellerId = req.seller.id;

    const notifications = await prisma.notifications.findMany({
      where: {
        receiverId: sellerId,
      },
      orderBy: {
        createdAt: "desc",
      },
    });

    res.status(200).json({
      success: true,
      notifications,
    });
  } catch (error) {
    return next(error);
  }
};

//mark notifications as read
export const markNotificationAsRead = async (
  req: any,
  res: Response,
  next: NextFunction
) => {
  try {
    const { notificationId } = req.body;

    if (!notificationId) {
      return next(new ValidationError("Notification id is required."));
    }

    const notification = await prisma.notifications.update({
      where: { id: notificationId },
      data: { status: "Read" },
    });

    res.status(200).json({
      success: true,
      notification,
    });
  } catch (error) {
    return next(error);
  }
};
