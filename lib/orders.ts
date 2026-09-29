import type { ChefMeal, HomeChef } from "@/lib/home-chefs";

export type OrderStatus = "Order Placed";

export type OrderLineItem = {
  mealId: string;
  mealName: string;
  mealType: ChefMeal["period"];
  unitPrice: number;
  calories: number;
  quantity: number;
};

export type PrototypeOrder = {
  id: string;
  status: OrderStatus;
  createdAt: string;
  chef: Pick<HomeChef, "id" | "name" | "city" | "area">;
  items: OrderLineItem[];
  totalAmount: number;
};

export function createPrototypeOrder(chef: HomeChef, items: OrderLineItem[]): PrototypeOrder {
  return {
    id: `NC-${Date.now().toString(36).toUpperCase()}`,
    status: "Order Placed",
    createdAt: new Date().toISOString(),
    chef: {
      id: chef.id,
      name: chef.name,
      city: chef.city,
      area: chef.area,
    },
    items,
    totalAmount: items.reduce((total, item) => total + item.unitPrice * item.quantity, 0),
  };
}
