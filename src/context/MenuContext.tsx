import {
  createContext,
  useContext,
  useEffect,
  useMemo,
  useState,
  type ReactNode,
} from "react";
import { useCart } from "@/context/CartContext";
import {
  menuApi,
  type PublicCategory,
  type PublicCombo,
  type PublicProduct,
  type PublicStore,
} from "@/services/menu";
import {
  Category,
  ItemOption,
  MenuItem,
  OptionChoice,
} from "@/types/menu";

interface MenuContextValue {
  isLoading: boolean;
  error: string | null;
  stores: PublicStore[];
  store: PublicStore | null;
  categories: Category[];
  menuItems: MenuItem[];
  comboItems: MenuItem[];
  refresh: () => Promise<void>;
}

const MenuContext = createContext<MenuContextValue | undefined>(undefined);

const FALLBACK_CATEGORIES: Category[] = [
  { id: "popular", name: "Popular", emoji: "🔥" },
  { id: "new", name: "New", emoji: "✨" },
];

function productToMenuItem(p: PublicProduct, categoryId: string): MenuItem {
  const options: ItemOption[] = [];

  if ((p.variations ?? []).length > 0) {
    options.push({
      id: "variation",
      name: "Choose option",
      required: true,
      maxSelections: 1,
      isVariation: true,
      choices: p.variations.map<OptionChoice>((v) => ({
        id: v.id,
        name: v.name,
        // Variation selling price is absolute and REPLACES the base product
        // price (see computeLineUnitPrice). Fall back to base + delta for any
        // legacy payloads that only send a delta.
        price:
          Number(v.sellingPrice) ||
          (v.priceDelta != null ? Number(p.sellingPrice) + Number(v.priceDelta) : undefined),
      })),
    });
  }

  for (const group of p.addonGroups ?? []) {
    if (!group.addons || group.addons.length === 0) continue;
    // A group with a minimum selection of 1+ is effectively required — the
    // API has no separate `required` flag, so derive it from minSelection.
    const minSel = group.minSelection ?? undefined;
    const maxSel = group.maxSelection ?? undefined;
    options.push({
      id: group.id,
      name: group.name,
      required: (minSel ?? 0) >= 1,
      maxSelections: maxSel,
      minSelections: minSel,
      choices: group.addons
        .filter((a) => a.isAvailable !== false)
        .map<OptionChoice>((a) => ({
          id: a.id,
          name: a.name,
          price: Number(a.price) || undefined,
        })),
    });
  }

  return {
    id: p.id,
    name: p.name,
    description: p.description ?? "",
    // Customer-facing price is the selling price, never the cost price.
    price: Number(p.sellingPrice ?? p.price),
    image: p.imageUrl ?? "",
    category: categoryId,
    options: options.length > 0 ? options : undefined,
  };
}

function comboToMenuItem(c: PublicCombo): MenuItem {
  return {
    id: c.id,
    name: c.name,
    description: c.description ?? "",
    price: Number(c.price),
    image: c.imageUrl ?? "",
    category: "combos",
    isCombo: true,
    comboItems: (c.items ?? []).map((i) => ({
      itemId: i.productId,
      name: i.product?.name ?? "Item",
      originalPrice: Number(i.product?.sellingPrice ?? 0),
    })),
  };
}

export function MenuProvider({ children }: { children: ReactNode }) {
  const { storeId, setStoreId } = useCart();
  const [stores, setStores] = useState<PublicStore[]>([]);
  const [products, setProducts] = useState<PublicProduct[]>([]);
  const [combos, setCombos] = useState<PublicCombo[]>([]);
  const [apiCategories, setApiCategories] = useState<PublicCategory[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  // Bootstrap stores once
  useEffect(() => {
    let cancelled = false;
    void (async () => {
      try {
        const list = await menuApi.stores();
        if (cancelled) return;
        setStores(list);
        // Stale-store recovery: if the cart still references a store that's
        // no longer active (admin removed/disabled it), fall back to the
        // first available store so the customer doesn't see an empty menu.
        if (list.length > 0) {
          const stillThere = storeId && list.some((s) => s.id === storeId);
          if (!storeId || !stillThere) {
            setStoreId(list[0].id);
          }
        } else {
          setIsLoading(false);
        }
      } catch (e) {
        if (!cancelled) {
          setError((e as Error).message ?? "Failed to load stores");
          setIsLoading(false);
        }
      }
    })();
    return () => {
      cancelled = true;
    };
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  const refresh = async () => {
    if (!storeId) return;
    setIsLoading(true);
    try {
      const [cats, prods, cmbs] = await Promise.all([
        menuApi.categories(),
        menuApi.products(storeId),
        menuApi.combos(storeId),
      ]);
      setApiCategories(cats);
      setProducts(prods);
      setCombos(cmbs);
      setError(null);
    } catch (e) {
      setError((e as Error).message ?? "Failed to load menu");
    } finally {
      setIsLoading(false);
    }
  };

  useEffect(() => {
    void refresh();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [storeId]);

  const store = useMemo(
    () => stores.find((s) => s.id === storeId) ?? null,
    [stores, storeId],
  );

  const value = useMemo<MenuContextValue>(() => {
    // Categories: use API categories filtered to "menu" type, plus virtual ones
    const dynamic: Category[] = (apiCategories ?? []).map((c) => ({
      id: c.id,
      name: c.name,
      // Use the emoji set on the merchant dashboard; fall back when unset.
      emoji: c.emoji || "🍽️",
    }));
    const allCategories: Category[] = [
      { id: "combos", name: "Combos", emoji: "🎁" },
      ...FALLBACK_CATEGORIES,
      ...dynamic,
    ];

    // Map products: derive category by id; fall back to "popular" if uncategorised
    const items = products.map((p) =>
      productToMenuItem(p, p.categoryId ?? "popular"),
    );
    const comboMenuItems = combos.map(comboToMenuItem);

    return {
      isLoading,
      error,
      stores,
      store,
      categories: allCategories,
      menuItems: items,
      comboItems: comboMenuItems,
      refresh,
    };
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [apiCategories, products, combos, stores, store, isLoading, error]);

  return <MenuContext.Provider value={value}>{children}</MenuContext.Provider>;
}

export function useMenu() {
  const ctx = useContext(MenuContext);
  if (!ctx) throw new Error("useMenu must be used within a MenuProvider");
  return ctx;
}
