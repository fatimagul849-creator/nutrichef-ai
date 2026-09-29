import { getDatabase } from "@/lib/mongodb";
import { homeChefs } from "@/lib/home-chefs";
import type { PrototypeDelivery } from "@/lib/delivery";
import type { PrototypeOrder } from "@/lib/orders";
import type { PrototypeSubscription } from "@/lib/subscriptions";

export async function syncPrototypeChefs() {
  const database = await getDatabase();
  const now = new Date();

  await database.collection("homeChefs").bulkWrite(
    homeChefs.map((chef) => ({
      updateOne: {
        filter: { chefId: chef.id },
        update: {
          $set: { chefId: chef.id, ...chef, updatedAt: now },
          $setOnInsert: { createdAt: now },
        },
        upsert: true,
      },
    }))
  );
}

export async function savePrototypeOrder(order: PrototypeOrder) {
  const database = await getDatabase();
  const createdAt = new Date(order.createdAt);

  await database.collection("orders").updateOne(
    { reference: order.id },
    {
      $set: {
        reference: order.id,
        chefId: order.chef.id,
        chef: order.chef,
        selectedMeals: order.items,
        totalPrice: order.totalAmount,
        status: order.status,
        createdAt,
        updatedAt: new Date(),
      },
    },
    { upsert: true }
  );
}

export async function savePrototypeSubscription(subscription: PrototypeSubscription) {
  const database = await getDatabase();

  await database.collection("subscriptions").updateOne(
    { reference: subscription.id },
    {
      $set: {
        reference: subscription.id,
        orderReference: subscription.orderId,
        chefId: subscription.chef.id,
        chef: subscription.chef,
        selectedMeals: subscription.items,
        duration: subscription.duration,
        startDate: subscription.startDate,
        endDate: subscription.endDate,
        totalPrice: subscription.totalAmount,
        status: subscription.status,
        createdAt: new Date(subscription.createdAt),
        updatedAt: new Date(),
      },
    },
    { upsert: true }
  );
}

export async function savePrototypeDelivery(delivery: PrototypeDelivery) {
  const database = await getDatabase();

  await database.collection("deliveries").updateOne(
    { orderReference: delivery.orderId },
    {
      $set: {
        reference: delivery.id,
        orderReference: delivery.orderId,
        chefId: delivery.chef.id,
        subscriptionReference: delivery.subscription?.id,
        status: delivery.status,
        statusUpdatedAt: new Date(delivery.updatedAt),
        createdAt: new Date(delivery.createdAt),
        updatedAt: new Date(),
      },
    },
    { upsert: true }
  );
}
