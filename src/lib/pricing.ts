import { MenuItem } from "@/types/menu";

type SelectedOptions = { [optionId: string]: string[] } | undefined;

/**
 * Single source of truth for a cart line's unit price.
 *
 * - A selected **variation** REPLACES the base product price (per client spec:
 *   "variation prices should be used as a replacement of actual product price").
 * - Selected **addons** are ADDED on top.
 *
 * Used by the cart subtotal, the cart sheet line totals, and the item detail
 * sheet so every surface agrees on the price.
 */
export function computeLineUnitPrice(
  menuItem: MenuItem,
  selectedOptions: SelectedOptions,
): number {
  let base = menuItem.price;
  let addons = 0;

  if (selectedOptions && menuItem.options) {
    for (const option of menuItem.options) {
      const chosen = selectedOptions[option.id];
      if (!chosen || chosen.length === 0) continue;
      const isVariation = option.isVariation || option.id === "variation";
      for (const choiceId of chosen) {
        const choice = option.choices.find((c) => c.id === choiceId);
        if (!choice?.price) continue;
        if (isVariation) {
          base = choice.price; // replace base price with the chosen variation
        } else {
          addons += choice.price;
        }
      }
    }
  }

  return base + addons;
}

/** Convenience: unit price × quantity. */
export function computeLineTotal(
  menuItem: MenuItem,
  selectedOptions: SelectedOptions,
  quantity: number,
): number {
  return computeLineUnitPrice(menuItem, selectedOptions) * quantity;
}

/**
 * Builds the structured `variation` / `addons` snapshots the backend stores on
 * an order item (and the merchant hub / workstation render). The variation is
 * collapsed to a single `{ name }`; add-ons become `[{ name, price }]`. Pricing
 * still flows through `computeLineUnitPrice` — this is purely the human-readable
 * breakdown so variation/add-on info shows everywhere the order is viewed.
 */
export function buildVariationAddons(
  menuItem: MenuItem,
  selectedOptions: SelectedOptions,
): {
  variation?: Record<string, unknown>;
  addons?: Record<string, unknown>[];
  variationId?: string;
} {
  const variationNames: string[] = [];
  let variationId: string | undefined;
  const addons: { id: string; name: string; price: number }[] = [];

  if (selectedOptions && menuItem.options) {
    for (const option of menuItem.options) {
      const chosen = selectedOptions[option.id];
      if (!chosen || chosen.length === 0) continue;
      const isVariation = option.isVariation || option.id === "variation";
      for (const choiceId of chosen) {
        const choice = option.choices.find((c) => c.id === choiceId);
        if (!choice) continue;
        if (isVariation) {
          variationNames.push(choice.name);
          // Variation choice ids are the backend variation entity ids; the
          // server uses this to re-derive the (replacing) variation price.
          variationId = variationId ?? choice.id;
        } else {
          addons.push({ id: choice.id, name: choice.name, price: choice.price ?? 0 });
        }
      }
    }
  }

  return {
    variation: variationNames.length
      ? { name: variationNames.join(", ") }
      : undefined,
    addons: addons.length ? addons : undefined,
    variationId,
  };
}
