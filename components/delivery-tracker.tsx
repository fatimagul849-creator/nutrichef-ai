"use client";

import {
  deliveryStages,
  deliveryStatusMessages,
  type PrototypeDelivery,
} from "@/lib/delivery";

function formatDate(value: string) {
  return new Intl.DateTimeFormat("en-PK", { day: "numeric", month: "short", year: "numeric" }).format(
    new Date(`${value}T00:00:00`)
  );
}

export default function DeliveryTracker({
  delivery,
  onAdvance,
}: {
  delivery: PrototypeDelivery;
  onAdvance: () => void;
}) {
  const activeStage = deliveryStages.indexOf(delivery.status);
  const isDelivered = delivery.status === "Delivered";

  return (
    <section className="mb-8 rounded-3xl border border-indigo-200 bg-white p-5 shadow-md shadow-indigo-950/5 sm:p-7" aria-live="polite">
      <div className="flex flex-col gap-4 border-b border-stone-100 pb-5 sm:flex-row sm:items-start sm:justify-between">
        <div>
          <p className="text-xs font-bold uppercase tracking-wider text-indigo-700">Delivery tracking</p>
          <h2 className="mt-1 text-2xl font-black text-stone-900">Follow your meal delivery</h2>
          <p className="mt-1 text-sm text-stone-600">Order reference: <span className="font-bold text-stone-900">{delivery.orderId}</span></p>
        </div>
        <span className="self-start rounded-full bg-indigo-100 px-3 py-1.5 text-xs font-bold text-indigo-900">{delivery.status}</span>
      </div>

      <div className="mt-5 rounded-2xl bg-indigo-50 p-4">
        <p className="font-bold text-indigo-950">{deliveryStatusMessages[delivery.status]}</p>
        <p className="mt-1 text-sm text-indigo-800">Prototype status controls are available for this demo only.</p>
      </div>

      <ol className="mt-6 grid grid-cols-2 gap-y-5 sm:grid-cols-4 sm:gap-x-3">
        {deliveryStages.map((stage, index) => {
          const isComplete = index <= activeStage;
          const isCurrent = index === activeStage;
          return (
            <li key={stage} className="relative flex items-center gap-2 sm:flex-col sm:items-start">
              <span className={`flex h-8 w-8 shrink-0 items-center justify-center rounded-full text-xs font-black ${isComplete ? "bg-indigo-600 text-white" : "bg-stone-100 text-stone-400"}`}>{index + 1}</span>
              <span className={`text-xs font-bold ${isCurrent ? "text-indigo-900" : isComplete ? "text-stone-800" : "text-stone-400"}`}>{stage}</span>
            </li>
          );
        })}
      </ol>

      <div className="mt-6 grid gap-3 border-t border-stone-100 pt-5 text-sm sm:grid-cols-2">
        <div className="rounded-2xl bg-stone-50 p-4">
          <p className="text-xs font-bold uppercase tracking-wider text-stone-500">Home chef</p>
          <p className="mt-1 font-bold text-stone-900">{delivery.chef.name}</p>
          <p className="text-stone-600">{delivery.chef.city} · {delivery.chef.area}</p>
        </div>
        {delivery.subscription ? (
          <div className="rounded-2xl bg-teal-50 p-4">
            <p className="text-xs font-bold uppercase tracking-wider text-teal-700">Subscription plan</p>
            <p className="mt-1 font-bold text-teal-950">{delivery.subscription.duration} · {delivery.subscription.days} days</p>
            <p className="text-teal-800">{formatDate(delivery.subscription.startDate)} to {formatDate(delivery.subscription.endDate)}</p>
          </div>
        ) : (
          <div className="rounded-2xl bg-stone-50 p-4">
            <p className="text-xs font-bold uppercase tracking-wider text-stone-500">Order type</p>
            <p className="mt-1 font-bold text-stone-900">One-time prototype order</p>
          </div>
        )}
      </div>

      <div className="mt-4 rounded-2xl border border-stone-200 p-4">
        <p className="text-xs font-bold uppercase tracking-wider text-stone-500">Selected meals</p>
        <ul className="mt-2 space-y-1 text-sm text-stone-700">
          {delivery.items.map((item) => (
            <li key={item.mealId}>{item.quantity}× {item.mealName} ({item.mealType})</li>
          ))}
        </ul>
      </div>

      <button
        type="button"
        disabled={isDelivered}
        onClick={onAdvance}
        className={`mt-6 rounded-xl px-5 py-3 text-sm font-bold text-white shadow-sm transition ${isDelivered ? "cursor-not-allowed bg-indigo-300" : "bg-indigo-600 hover:bg-indigo-700"}`}
      >
        {isDelivered ? "Delivery complete" : "Update Delivery Status"}
      </button>
    </section>
  );
}
