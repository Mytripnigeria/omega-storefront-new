import { MenuItem } from "@/types/menu";

/**
 * Single source of truth for "this product can't be added straight to the cart".
 *
 * True when the item has a variation group, a required option group, or any
 * add-on group with a Minimum Selection of 1 or more — in all three cases the
 * product page must open so the customer picks before carting.
 *
 * Used by the menu quick-add (+), the "Goes well with" upsell, the in-cart
 * upsell and reorder so every add-to-cart path honours the same rule.
 */
export function itemNeedsSelection(item: MenuItem): boolean {
  return (
    item.options?.some(
      (o) => o.isVariation || o.required || (o.minSelections ?? 0) >= 1,
    ) ?? false
  );
}
