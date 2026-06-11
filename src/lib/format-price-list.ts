type PrismaPriceListItemRow = {
  id: string;
  priceListId: string;
  type: string;
  name: string;
  amount: number;
  description: string | null;
  previewImageUrl: string | null;
  unitsIncluded: number | null;
  category: string | null;
  productType?: string | null;
};

type PrismaBulkDiscountTierRow = {
  id: string;
  priceListId: string;
  minQuantity: number;
  discountPercent: number;
};

type PrismaPriceListRow = {
  id: string;
  schoolId: string;
  name: string;
  countryCode: string;
  currencyCode: string;
  isDefault: boolean;
  items?: PrismaPriceListItemRow[];
  bulkDiscounts?: PrismaBulkDiscountTierRow[];
  updatedAt: Date;
};

function fmtItem(item: PrismaPriceListItemRow) {
  return {
    id: item.id,
    priceListId: item.priceListId,
    type: item.type,
    name: item.name,
    amount: item.amount,
    description: item.description ?? null,
    previewImageUrl: item.previewImageUrl ?? null,
    unitsIncluded: item.unitsIncluded ?? null,
    category: item.category ?? null,
    productType: item.productType ?? null,
  };
}

function fmtTier(tier: PrismaBulkDiscountTierRow) {
  return {
    id: tier.id,
    minQuantity: tier.minQuantity,
    discountPercent: tier.discountPercent,
  };
}

export function fmtPriceList(pl: PrismaPriceListRow) {
  return {
    id: pl.id,
    schoolId: pl.schoolId,
    name: pl.name,
    countryCode: pl.countryCode,
    currencyCode: pl.currencyCode,
    isDefault: pl.isDefault,
    items: (pl.items ?? []).map(fmtItem),
    bulkDiscounts: (pl.bulkDiscounts ?? []).map(fmtTier),
    updatedAt: pl.updatedAt.toISOString(),
  };
}
