import type { PriceItemType } from "@/types/pricing";

export type ProductMockupLayout =
  | "single"
  | "grid-2"
  | "grid-3"
  | "grid-8"
  | "mug"
  | "mousepad"
  | "keychain"
  | "card";

export interface ProductMockupPreset {
  /** Stable key stored on `PriceListItem.productType`, drives the storefront mockup. */
  productType: string;
  name: string;
  description: string;
  type: PriceItemType;
  layout: ProductMockupLayout;
  /** Suggested default price in the price list's currency (major units). */
  amount: number;
  unitsIncluded?: number;
}

/** Common print + merchandise products every school can add to its price list in one click. */
export const PRODUCT_MOCKUPS: ProductMockupPreset[] = [
  {
    productType: "print_1",
    name: "Photo Print — 8×12in (20×30cm)",
    description: "1 photo on a premium glossy 20×30cm print",
    type: "single_print",
    layout: "single",
    amount: 99,
  },
  {
    productType: "print_2",
    name: "2 Photos — 20×30cm Sheet",
    description: "2 photos arranged on one 20×30cm sheet",
    type: "package",
    layout: "grid-2",
    amount: 149,
    unitsIncluded: 2,
  },
  {
    productType: "print_3",
    name: "3 Photos — 20×30cm Sheet",
    description: "3 photos arranged on one 20×30cm sheet",
    type: "package",
    layout: "grid-3",
    amount: 179,
    unitsIncluded: 3,
  },
  {
    productType: "passport_8",
    name: "Passport Photos — Sheet of 8",
    description: "8 passport-size photos on a single sheet",
    type: "package",
    layout: "grid-8",
    amount: 99,
    unitsIncluded: 8,
  },
  {
    productType: "mug",
    name: "Photo Mug",
    description: "Ceramic mug printed with your favourite photo",
    type: "addon",
    layout: "mug",
    amount: 349,
  },
  {
    productType: "mousepad",
    name: "Photo Mouse Pad",
    description: "Smooth-surface mouse pad printed with your photo",
    type: "addon",
    layout: "mousepad",
    amount: 299,
  },
  {
    productType: "keychain",
    name: "Photo Keychain",
    description: "Durable acrylic keychain with your photo",
    type: "addon",
    layout: "keychain",
    amount: 149,
  },
  {
    productType: "greeting_card",
    name: "Photo Greeting Card",
    description: "Folded greeting card featuring your photo",
    type: "addon",
    layout: "card",
    amount: 99,
  },
];

export const PRODUCT_MOCKUP_BY_TYPE = new Map(PRODUCT_MOCKUPS.map((p) => [p.productType, p]));
