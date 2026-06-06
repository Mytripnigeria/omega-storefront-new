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
