"use client";

import { useCallback, useEffect, useState } from "react";
import { persistPrototype } from "@/lib/client-persistence";
import DeliveryTracker from "@/components/delivery-tracker";
import { advanceDeliveryStatus, createPrototypeDelivery, type PrototypeDelivery } from "@/lib/delivery";
import type { ChefMeal, HomeChef, MealPeriod } from "@/lib/home-chefs";
import { createPrototypeOrder, type OrderLineItem, type PrototypeOrder } from "@/lib/orders";
import {
  createPrototypeSubscription,
  getTodayDate,
  type PrototypeSubscription,
  type SubscriptionDuration,
} from "@/lib/subscriptions";

const periods: MealPeriod[] = ["Breakfast", "Lunch", "Snack", "Dinner"];

function formatRupees(amount: number) {
  return `PKR ${amount.toLocaleString("en-PK")}`;
}

export default function HomeChefBrowser({ chefs }: { chefs: HomeChef[] }) {
  const [activeChefId, setActiveChefId] = useState<string | null>(null);
  const [chosenChefId, setChosenChefId] = useState<string | null>(null);
  const [quantities, setQuantities] = useState<Record<string, number>>({});
  const [order, setOrder] = useState<PrototypeOrder | null>(null);
  const [subscriptionDuration, setSubscriptionDuration] = useState<SubscriptionDuration>("Weekly");
  const [subscription, setSubscription] = useState<PrototypeSubscription | null>(null);
  const [delivery, setDelivery] = useState<PrototypeDelivery | null>(null);
  const [persistenceWarning, setPersistenceWarning] = useState("");

  const activeChef = chefs.find((chef) => chef.id === activeChefId);
  const chosenChef = chefs.find((chef) => chef.id === chosenChefId);
  const selectedItems: OrderLineItem[] = chosenChef
    ? chosenChef.meals.flatMap((meal) => {
        const quantity = quantities[meal.id] ?? 0;
        return quantity > 0
          ? [{ mealId: meal.id, mealName: meal.name, mealType: meal.period, unitPrice: meal.price, calories: meal.calories, quantity }]
          : [];
      })
    : [];
  const totalAmount = selectedItems.reduce((total, item) => total + item.unitPrice * item.quantity, 0);
  const subscriptionPreview = order
    ? createPrototypeSubscription(order, subscriptionDuration, getTodayDate())
    : null;

  function formatDate(value: string) {
    return new Intl.DateTimeFormat("en-PK", { day: "numeric", month: "short", year: "numeric" }).format(
      new Date(`${value}T00:00:00`)
    );
  }

  const saveInBackground = useCallback(async (endpoint: string, payload?: unknown) => {
    const wasSaved = await persistPrototype(endpoint, payload);
    setPersistenceWarning(
      wasSaved ? "" : "Your changes are available for this session, but cloud saving is temporarily unavailable."
    );
  }, []);

  useEffect(() => {
    void saveInBackground("/api/home-chefs/sync");
  }, [saveInBackground]);

  function chooseChef(chef: HomeChef) {
    if (chef.id !== chosenChefId) {
      setQuantities({});
      setOrder(null);
      setSubscription(null);
      setDelivery(null);
    }
    setChosenChefId(chef.id);
    setActiveChefId(chef.id);
  }

  function toggleMeal(meal: ChefMeal) {
    if (!activeChef) return;

    if (chosenChefId !== activeChef.id) {
      setChosenChefId(activeChef.id);
      setQuantities({ [meal.id]: 1 });
      setOrder(null);
      setSubscription(null);
      setDelivery(null);
      return;
    }

    setQuantities((current) => {
      const next = { ...current };
      if (next[meal.id]) delete next[meal.id];
      else next[meal.id] = 1;
      return next;
    });
    setOrder(null);
    setSubscription(null);
    setDelivery(null);
  }

  function updateQuantity(mealId: string, change: number) {
    setQuantities((current) => {
      const nextQuantity = (current[mealId] ?? 0) + change;
      if (nextQuantity <= 0) {
        const remaining = { ...current };
        delete remaining[mealId];
        return remaining;
      }
      return { ...current, [mealId]: nextQuantity };
    });
    setOrder(null);
    setSubscription(null);
    setDelivery(null);
  }

  function placeOrder() {
    if (!chosenChef || selectedItems.length === 0) return;
    const newOrder = createPrototypeOrder(chosenChef, selectedItems);
    const orderDelivery = createPrototypeDelivery(newOrder);
    setOrder(newOrder);
    setSubscription(null);
    setDelivery(orderDelivery);
    void saveInBackground("/api/orders", newOrder);
    void saveInBackground("/api/deliveries", orderDelivery);
  }

  function startSubscription() {
    if (!order || !subscriptionPreview) return;
    setSubscription(subscriptionPreview);
    const subscriptionDelivery = createPrototypeDelivery(order, subscriptionPreview);
    setDelivery(subscriptionDelivery);
    void saveInBackground("/api/subscriptions", subscriptionPreview);
    void saveInBackground("/api/deliveries", subscriptionDelivery);
  }

  function advanceDelivery() {
    setDelivery((current) => {
      if (!current) return current;
      const nextDelivery = advanceDeliveryStatus(current);
      if (nextDelivery !== current) void saveInBackground("/api/deliveries", nextDelivery);
      return nextDelivery;
    });
  }

  return (
    <>
      {persistenceWarning && (
        <div className="mb-6 rounded-2xl border border-amber-200 bg-amber-50 p-4 text-sm text-amber-900" role="status">
          {persistenceWarning}
        </div>
      )}
      {chosenChef && (
        <div className="mb-6 rounded-2xl border border-emerald-200 bg-emerald-50 p-4 text-sm text-emerald-950 shadow-sm" role="status">
          <p className="font-bold">{chosenChef.name} is selected.</p>
          <p className="mt-1 text-emerald-800">Choose meals below to create a prototype order. Subscription and delivery options will connect here later.</p>
        </div>
      )}

      {order && (
        <section className="mb-8 rounded-3xl border border-emerald-300 bg-gradient-to-br from-emerald-50 to-white p-5 shadow-md sm:p-7" role="status">
          <div className="flex flex-col gap-4 border-b border-emerald-100 pb-5 sm:flex-row sm:items-start sm:justify-between">
            <div>
              <p className="text-xs font-bold uppercase tracking-wider text-emerald-700">Order confirmation</p>
              <h2 className="mt-1 text-2xl font-black text-emerald-950">Your order has been placed</h2>
              <p className="mt-1 text-sm text-emerald-900">Reference: <span className="font-bold">{order.id}</span></p>
            </div>
            <span className="self-start rounded-full bg-emerald-600 px-3 py-1.5 text-xs font-bold text-white">{order.status}</span>
          </div>
          <div className="mt-5 grid gap-4 text-sm sm:grid-cols-2">
            <div className="rounded-2xl bg-white/80 p-4">
              <p className="text-xs font-bold uppercase tracking-wider text-stone-500">Selected chef</p>
              <p className="mt-1 font-bold text-stone-900">{order.chef.name}</p>
              <p className="text-stone-600">{order.chef.city} · {order.chef.area}</p>
            </div>
            <div className="rounded-2xl bg-white/80 p-4">
              <p className="text-xs font-bold uppercase tracking-wider text-stone-500">Total amount</p>
              <p className="mt-1 text-xl font-black text-emerald-900">{formatRupees(order.totalAmount)}</p>
              <p className="text-stone-600">{order.items.reduce((count, item) => count + item.quantity, 0)} meal item(s)</p>
            </div>
          </div>
        </section>
      )}

      {order && subscriptionPreview && !subscription && (
        <section className="mb-8 rounded-3xl border border-teal-200 bg-white p-5 shadow-sm sm:p-7" aria-live="polite">
          <div className="border-b border-stone-100 pb-5">
            <p className="text-xs font-bold uppercase tracking-wider text-teal-700">Subscription summary</p>
            <h2 className="mt-1 text-2xl font-black text-stone-900">Choose your delivery duration</h2>
            <p className="mt-1 text-sm text-stone-600">This prototype uses your selected order total for each day in the plan.</p>
          </div>

          <div className="mt-5 grid grid-cols-2 gap-3 sm:max-w-md">
            {(["Weekly", "Monthly"] as SubscriptionDuration[]).map((duration) => {
              const isSelected = subscriptionDuration === duration;
              const days = duration === "Weekly" ? 7 : 30;
              return (
                <button
                  key={duration}
                  type="button"
                  onClick={() => setSubscriptionDuration(duration)}
                  className={`rounded-2xl border p-4 text-left transition ${isSelected ? "border-teal-500 bg-teal-50 ring-2 ring-teal-500/20" : "border-stone-200 bg-stone-50 hover:border-teal-300"}`}
                >
                  <span className="block font-bold text-stone-900">{duration}</span>
                  <span className="mt-1 block text-xs text-stone-600">{days} days</span>
                </button>
              );
            })}
          </div>

          <div className="mt-5 grid gap-3 sm:grid-cols-2 lg:grid-cols-3">
            <div className="rounded-2xl bg-stone-50 p-4">
              <p className="text-xs font-bold uppercase tracking-wider text-stone-500">Chef</p>
              <p className="mt-1 font-bold text-stone-900">{subscriptionPreview.chef.name}</p>
              <p className="text-sm text-stone-600">{subscriptionPreview.chef.city} · {subscriptionPreview.chef.area}</p>
            </div>
            <div className="rounded-2xl bg-stone-50 p-4">
              <p className="text-xs font-bold uppercase tracking-wider text-stone-500">Plan dates</p>
              <p className="mt-1 font-bold text-stone-900">{formatDate(subscriptionPreview.startDate)}</p>
              <p className="text-sm text-stone-600">to {formatDate(subscriptionPreview.endDate)}</p>
            </div>
            <div className="rounded-2xl bg-teal-50 p-4">
              <p className="text-xs font-bold uppercase tracking-wider text-teal-700">Total price</p>
              <p className="mt-1 text-xl font-black text-teal-900">{formatRupees(subscriptionPreview.totalAmount)}</p>
              <p className="text-sm text-teal-800">{subscriptionPreview.duration} · {subscriptionPreview.days} days</p>
            </div>
          </div>

          <div className="mt-5 rounded-2xl border border-stone-200 p-4">
            <p className="text-xs font-bold uppercase tracking-wider text-stone-500">Selected meals</p>
            <ul className="mt-2 space-y-1 text-sm text-stone-700">
              {subscriptionPreview.items.map((item) => (
                <li key={item.mealId}>{item.quantity}× {item.mealName} ({item.mealType})</li>
              ))}
            </ul>
          </div>

          <button type="button" onClick={startSubscription} className="mt-6 rounded-xl bg-teal-600 px-5 py-3 text-sm font-bold text-white shadow-sm transition hover:bg-teal-700">
            Start subscription · {formatRupees(subscriptionPreview.totalAmount)}
          </button>
        </section>
      )}

      {subscription && (
        <section className="mb-8 rounded-3xl border border-teal-300 bg-gradient-to-br from-teal-50 to-white p-5 shadow-md sm:p-7" role="status">
          <div className="flex flex-col gap-4 border-b border-teal-100 pb-5 sm:flex-row sm:items-start sm:justify-between">
            <div>
              <p className="text-xs font-bold uppercase tracking-wider text-teal-700">Subscription confirmed</p>
              <h2 className="mt-1 text-2xl font-black text-teal-950">Your meal subscription is active</h2>
              <p className="mt-1 text-sm text-teal-900">Reference: <span className="font-bold">{subscription.id}</span></p>
            </div>
            <span className="self-start rounded-full bg-teal-600 px-3 py-1.5 text-xs font-bold text-white">{subscription.status}</span>
          </div>
          <div className="mt-5 grid gap-3 text-sm sm:grid-cols-2 lg:grid-cols-4">
            <div className="rounded-2xl bg-white/80 p-4"><p className="text-xs font-bold uppercase tracking-wider text-stone-500">Chef</p><p className="mt-1 font-bold text-stone-900">{subscription.chef.name}</p></div>
            <div className="rounded-2xl bg-white/80 p-4"><p className="text-xs font-bold uppercase tracking-wider text-stone-500">Plan duration</p><p className="mt-1 font-bold text-stone-900">{subscription.duration}</p><p className="text-stone-600">{subscription.days} days</p></div>
            <div className="rounded-2xl bg-white/80 p-4"><p className="text-xs font-bold uppercase tracking-wider text-stone-500">Start and end</p><p className="mt-1 font-bold text-stone-900">{formatDate(subscription.startDate)}</p><p className="text-stone-600">to {formatDate(subscription.endDate)}</p></div>
            <div className="rounded-2xl bg-white/80 p-4"><p className="text-xs font-bold uppercase tracking-wider text-stone-500">Total amount</p><p className="mt-1 text-lg font-black text-teal-900">{formatRupees(subscription.totalAmount)}</p></div>
          </div>
        </section>
      )}

      {delivery && (
        <DeliveryTracker delivery={delivery} onAdvance={advanceDelivery} />
      )}

      <div className="grid grid-cols-1 gap-5 md:grid-cols-2 xl:grid-cols-3">
        {chefs.map((chef) => (
          <article key={chef.id} className="flex flex-col rounded-3xl border border-emerald-100 bg-white p-5 shadow-sm transition hover:-translate-y-0.5 hover:border-emerald-200 hover:shadow-md">
            <div className="flex items-start justify-between gap-4">
              <div>
                <p className="text-xs font-bold uppercase tracking-wider text-emerald-700">Home chef</p>
                <h2 className="mt-1 text-xl font-extrabold text-stone-900">{chef.name}</h2>
                <p className="mt-1 text-sm font-medium text-stone-500">{chef.city} · {chef.area}</p>
              </div>
              <span className="shrink-0 rounded-full bg-amber-50 px-2.5 py-1 text-xs font-bold text-amber-800 ring-1 ring-amber-200">★ {chef.rating.toFixed(1)}</span>
            </div>

            <p className="mt-4 text-sm leading-relaxed text-stone-600">{chef.description}</p>
            <p className="mt-4 text-sm font-bold text-emerald-900">{chef.speciality}</p>

            <div className="mt-4 flex flex-wrap gap-2">
              {chef.availableMealTypes.map((mealType) => (
                <span key={mealType} className="rounded-lg border border-stone-200 bg-stone-50 px-2.5 py-1 text-xs font-semibold text-stone-600">{mealType}</span>
              ))}
            </div>

            <div className="mt-5 flex items-end justify-between gap-3 border-t border-stone-100 pt-4">
              <div>
                <p className="text-xs font-medium text-stone-500">Starting from</p>
                <p className="text-lg font-black text-stone-900">{formatRupees(chef.monthlyStartingPrice)}<span className="text-xs font-semibold text-stone-500">/month</span></p>
              </div>
              <span className={`rounded-full px-2.5 py-1 text-xs font-bold ${chef.availability === "Available this week" ? "bg-emerald-50 text-emerald-800" : "bg-amber-50 text-amber-800"}`}>{chef.availability}</span>
            </div>

            <button type="button" onClick={() => setActiveChefId(chef.id)} className="mt-5 w-full rounded-xl border border-emerald-300 bg-white px-4 py-2.5 text-sm font-bold text-emerald-800 transition hover:bg-emerald-50">
              View menu
            </button>
          </article>
        ))}
      </div>

      {activeChef && (
        <section className="mt-8 rounded-3xl border border-emerald-200 bg-white p-5 shadow-lg shadow-emerald-950/5 sm:p-7" aria-live="polite">
          <div className="flex flex-col gap-4 border-b border-stone-100 pb-5 sm:flex-row sm:items-start sm:justify-between">
            <div>
              <p className="text-xs font-bold uppercase tracking-wider text-emerald-700">{activeChef.city} · {activeChef.area}</p>
              <h2 className="mt-1 text-2xl font-black text-stone-900">{activeChef.name}&apos;s menu</h2>
              <p className="mt-1 text-sm text-stone-600">Select meals individually, then adjust quantities in your order summary.</p>
            </div>
            <button type="button" onClick={() => setActiveChefId(null)} className="self-start rounded-lg px-3 py-2 text-sm font-semibold text-stone-500 hover:bg-stone-100 hover:text-stone-800">Close</button>
          </div>

          <div className="mt-5 grid grid-cols-1 gap-3 sm:grid-cols-2">
            {periods.map((period) => {
              const meal = activeChef.meals.find((chefMeal) => chefMeal.period === period);
              if (!meal) return null;

              return (
                <article key={meal.id} className={`rounded-2xl border p-4 transition ${quantities[meal.id] && chosenChefId === activeChef.id ? "border-emerald-300 bg-emerald-50/70" : "border-stone-200 bg-stone-50/70"}`}>
                  <div className="flex items-center justify-between gap-3">
                    <span className="rounded-full bg-emerald-100 px-2.5 py-1 text-xs font-bold text-emerald-800">{meal.period}</span>
                    <span className="text-xs font-bold text-stone-500">~{meal.calories} kcal</span>
                  </div>
                  <h3 className="mt-3 font-bold text-stone-900">{meal.name}</h3>
                  <p className="mt-1 text-sm leading-relaxed text-stone-600">{meal.description}</p>
                  <div className="mt-3 flex items-center justify-between gap-3">
                    <p className="text-sm font-extrabold text-emerald-900">{formatRupees(meal.price)}</p>
                    <button
                      type="button"
                      onClick={() => toggleMeal(meal)}
                      className={`rounded-lg px-3 py-2 text-xs font-bold transition ${quantities[meal.id] && chosenChefId === activeChef.id ? "bg-emerald-600 text-white hover:bg-emerald-700" : "border border-emerald-300 bg-white text-emerald-800 hover:bg-emerald-50"}`}
                    >
                      {quantities[meal.id] && chosenChefId === activeChef.id ? "Selected" : "Select meal"}
                    </button>
                  </div>
                </article>
              );
            })}
          </div>

          <button type="button" onClick={() => chooseChef(activeChef)} className="mt-6 w-full rounded-xl bg-emerald-600 px-5 py-3 text-sm font-bold text-white shadow-sm transition hover:bg-emerald-700 sm:w-auto">
            {chosenChefId === activeChef.id ? "Chef selected" : "Choose this chef"}
          </button>
        </section>
      )}

      {chosenChef && (
        <section className="mt-8 rounded-3xl border border-stone-200 bg-white p-5 shadow-sm sm:p-7" aria-live="polite">
          <div className="flex flex-col gap-3 border-b border-stone-100 pb-5 sm:flex-row sm:items-start sm:justify-between">
            <div>
              <p className="text-xs font-bold uppercase tracking-wider text-emerald-700">Selected-meals summary</p>
              <h2 className="mt-1 text-2xl font-black text-stone-900">{chosenChef.name}</h2>
            </div>
            <p className="text-lg font-black text-emerald-900">Total: {formatRupees(totalAmount)}</p>
          </div>

          {selectedItems.length > 0 ? (
            <div className="mt-5 space-y-3">
              {selectedItems.map((item) => (
                <article key={item.mealId} className="flex flex-col gap-3 rounded-2xl border border-stone-200 bg-stone-50/70 p-4 sm:flex-row sm:items-center sm:justify-between">
                  <div>
                    <div className="flex flex-wrap items-center gap-2">
                      <span className="rounded-full bg-emerald-100 px-2.5 py-1 text-xs font-bold text-emerald-800">{item.mealType}</span>
                      <span className="text-xs font-semibold text-stone-500">~{item.calories} kcal each</span>
                    </div>
                    <h3 className="mt-2 font-bold text-stone-900">{item.mealName}</h3>
                    <p className="mt-1 text-sm font-semibold text-emerald-900">{formatRupees(item.unitPrice)} each · {formatRupees(item.unitPrice * item.quantity)}</p>
                  </div>
                  <div className="flex items-center gap-3 self-start sm:self-auto">
                    <button type="button" onClick={() => updateQuantity(item.mealId, -1)} className="flex h-9 w-9 items-center justify-center rounded-lg border border-stone-300 bg-white text-lg font-bold text-stone-700 transition hover:bg-stone-100" aria-label={`Reduce quantity of ${item.mealName}`}>−</button>
                    <span className="min-w-5 text-center text-sm font-black text-stone-900">{item.quantity}</span>
                    <button type="button" onClick={() => updateQuantity(item.mealId, 1)} className="flex h-9 w-9 items-center justify-center rounded-lg border border-emerald-300 bg-white text-lg font-bold text-emerald-800 transition hover:bg-emerald-50" aria-label={`Increase quantity of ${item.mealName}`}>+</button>
                  </div>
                </article>
              ))}
            </div>
          ) : (
            <p className="mt-5 rounded-2xl border border-dashed border-stone-300 bg-stone-50 p-4 text-sm text-stone-600">Select one or more meals from {chosenChef.name}&apos;s menu to begin your order.</p>
          )}

          <div className="mt-6 flex flex-col gap-3 border-t border-stone-100 pt-5 sm:flex-row sm:items-center sm:justify-between">
            <p className="text-sm text-stone-600">No payment or delivery is created at this prototype stage.</p>
            <button type="button" disabled={selectedItems.length === 0} onClick={placeOrder} className={`rounded-xl px-5 py-3 text-sm font-bold text-white shadow-sm transition ${selectedItems.length === 0 ? "cursor-not-allowed bg-emerald-300" : "bg-emerald-600 hover:bg-emerald-700"}`}>
              Place order · {formatRupees(totalAmount)}
            </button>
          </div>
        </section>
      )}
    </>
  );
}
