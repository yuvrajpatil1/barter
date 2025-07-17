import prisma from "../../../../packages/libs/prisma";

export const updateUserAnalytics = async (event: any) => {
  try {
    const existingData = await prisma.userAnalytics.findUnique({
      where: {
        userId: event.userId,
      },
      select: { actions: true },
    });

    let updatedActions: any = existingData?.actions || [];

    const actionExists = updatedActions.some(
      (entry: any) =>
        entry.productId === event.productId && entry.action === event.action
    );

    //always store "product_view" for recommendations
    if (event.action === "product_view") {
      updatedActions.push({
        productId: event?.productId,
        shopId: event?.shopId,
        action: event?.action,
        timestamp: new Date(),
      });
    } else if (
      ["add_to_cart", "add_to_wishlist"].includes(event.action) &&
      !actionExists
    ) {
      updatedActions.push({
        productId: event?.productId,
        shopId: event?.shopId,
        action: event?.action,
        timestamp: new Date(),
      });

      //remove from "add_to_cart" when "remove_from_cart" is triggered
    } else if (event.action === "remove_from_cart") {
      updatedActions = updatedActions.filter(
        (entry: any) =>
          !(
            entry.productId === event.productId &&
            entry.action === "add_to_cart"
          )
      );

      //remove "add_to_wishlist" when "remove_from_wishlist"
    } else if (event.action === "remove_from_wishlist") {
      updatedActions = updatedActions.filter(
        (entry: any) =>
          !(
            entry.productId === event.productId &&
            entry.action === "add_to_wishlist"
          )
      );
    }

    //keep only the last 100 actions to prvent storage overload
    const MAX_ACTIONS = 100;
    if (updatedActions.length >= MAX_ACTIONS) {
      updatedActions = updatedActions.slice(-MAX_ACTIONS + 1);
    }

    const extraFields: Record<string, any> = {};

    if (event.country) {
      extraFields.country = event.country;
    }
    if (event.city) {
      extraFields.city = event.city;
    }
    if (event.device) {
      extraFields.device = event.device;
    }

    //update or create user analytics
    await prisma.userAnalytics.upsert({
      where: { userId: event.userId },
      update: {
        lastVisited: new Date(),
        actions: updatedActions,
        ...extraFields,
      },
      create: {
        userId: event?.userId,
        lastVisited: new Date(),
        actions: updatedActions,
        ...extraFields,
      },
    });

    //update product analytics
    await updateProductAnalytics(event);
  } catch (error) {
    console.log("Error storing user analytics", error);
  }
};

export const updateProductAnalytics = async (event: any) => {
  try {
    if (!event.productId) return;

    //define update fields dynamically
    const updateFields: any = {};

    if (event.action === "product_view") updateFields.views = { increment: 1 };
    if (event.action === "add_to_cart")
      updateFields.cartAdds = { increment: 1 };
    if (event.action === "remove_from_cart")
      updateFields.cartAdds = { decrement: 1 };
    if (event.action === "add_to_wishlist")
      updateFields.wishlistAdds = { increment: 1 };
    if (event.action === "remove_from_wishlist")
      updateFields.wishlistAdds = { decrement: 1 };
    if (event.action === "purchase") updateFields.purchases = { increment: 1 };

    //update or create Product analytics asynchronously
    await prisma.productAnalytics.upsert({
      where: { productId: event.productId },
      update: { lastViewedAt: new Date(), ...updateFields },
      create: {
        productId: event.productId,
        shopId: event.shopId || null,
        views: event.action === "product_view" ? 1 : 0,
        cartAdds: event.action === "add_to_cart" ? 1 : 0,
        wishlistAdds: event.action === "add_to_wishlist" ? 1 : 0,
        purchases: event.action === "purchase" ? 1 : 0,
        lastViewedAt: new Date(),
      },
    });
  } catch (error) {
    console.log("Error storing product analytics", error);
  }
};
