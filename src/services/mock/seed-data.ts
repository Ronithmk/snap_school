import type { AuthUser, PriceList, School, SchoolClass } from "@/types";

const now = "2026-05-01T00:00:00.000Z";

export const MOCK_SCHOOLS: School[] = [
  {
    id: "sch_riverside",
    slug: "riverside-elementary",
    name: "Riverside Elementary",
    logoUrl: "https://api.dicebear.com/9.x/initials/svg?seed=Riverside&backgroundType=gradientLinear",
    bannerUrl: "https://images.unsplash.com/photo-1503676260728-1c00da094a0b?w=1600&q=60",
    description: "Capturing every milestone at Riverside Elementary School.",
    status: "active",
    settings: {
      countryCode: "US",
      currencyCode: "USD",
      tax: { enabled: true, rate: 7.5, label: "Sales Tax", inclusive: false },
      supportEmail: "photos@riverside.edu",
      primaryColor: "#2563eb",
    },
    classCount: 3,
    albumCount: 5,
    createdAt: now,
    updatedAt: now,
  },
  {
    id: "sch_oakwood",
    slug: "oakwood-high",
    name: "Oakwood High School",
    logoUrl: "https://api.dicebear.com/9.x/initials/svg?seed=Oakwood&backgroundType=gradientLinear",
    bannerUrl: "https://images.unsplash.com/photo-1523050854058-8df90110c9f1?w=1600&q=60",
    description: "Senior portraits, sports days, and graduation galleries.",
    status: "active",
    settings: {
      countryCode: "GB",
      currencyCode: "GBP",
      tax: { enabled: true, rate: 20, label: "VAT", inclusive: true },
      supportEmail: "media@oakwoodhigh.co.uk",
      primaryColor: "#7c3aed",
    },
    classCount: 2,
    albumCount: 4,
    createdAt: now,
    updatedAt: now,
  },
  {
    id: "sch_sunrise",
    slug: "sunrise-academy",
    name: "Sunrise Academy",
    logoUrl: "https://api.dicebear.com/9.x/initials/svg?seed=Sunrise&backgroundType=gradientLinear",
    bannerUrl: "https://images.unsplash.com/photo-1571260899304-425eee4c7efc?w=1600&q=60",
    description: "Annual events and class photography for Sunrise Academy.",
    status: "inactive",
    settings: {
      countryCode: "IN",
      currencyCode: "INR",
      tax: { enabled: true, rate: 18, label: "GST", inclusive: false },
      supportEmail: "office@sunriseacademy.in",
      primaryColor: "#ea580c",
    },
    classCount: 2,
    albumCount: 2,
    createdAt: now,
    updatedAt: now,
  },
];

export const MOCK_CLASSES: SchoolClass[] = [
  { id: "cls_riv_5a", schoolId: "sch_riverside", name: "Grade 5A", slug: "grade-5a", grouping: "Grade 5", albumCount: 2, studentCount: 24, createdAt: now },
  { id: "cls_riv_5b", schoolId: "sch_riverside", name: "Grade 5B", slug: "grade-5b", grouping: "Grade 5", albumCount: 1, studentCount: 22, createdAt: now },
  { id: "cls_riv_sports", schoolId: "sch_riverside", name: "Sports Day 2026", slug: "sports-day-2026", grouping: "Events", albumCount: 2, studentCount: undefined, createdAt: now },

  { id: "cls_oak_seniors", schoolId: "sch_oakwood", name: "Senior Class of 2026", slug: "seniors-2026", grouping: "Year 13", albumCount: 2, studentCount: 110, createdAt: now },
  { id: "cls_oak_drama", schoolId: "sch_oakwood", name: "Drama Production", slug: "drama-production", grouping: "Events", albumCount: 2, studentCount: undefined, createdAt: now },

  { id: "cls_sun_2a", schoolId: "sch_sunrise", name: "Class 2A", slug: "class-2a", grouping: "Grade 2", albumCount: 1, studentCount: 18, createdAt: now },
  { id: "cls_sun_annual", schoolId: "sch_sunrise", name: "Annual Day", slug: "annual-day", grouping: "Events", albumCount: 1, studentCount: undefined, createdAt: now },
];

export const MOCK_PRICE_LISTS: PriceList[] = [
  {
    id: "pl_us_default",
    name: "United States — Standard",
    countryCode: "US",
    currencyCode: "USD",
    isDefault: true,
    updatedAt: now,
    items: [
      { id: "pli_us_digital", type: "digital_download", name: "Digital Download (HD)", amount: 8, description: "Single high-resolution digital photo." },
      { id: "pli_us_print", type: "single_print", name: '6x4" Print', amount: 5, description: "Glossy photographic print." },
      { id: "pli_us_pkg", type: "package", name: "Class Package (10 photos)", amount: 45, unitsIncluded: 10, description: "Any 10 digital downloads, bundled." },
    ],
    bulkDiscounts: [
      { id: "bd_us_5", minQuantity: 5, discountPercent: 10 },
      { id: "bd_us_10", minQuantity: 10, discountPercent: 18 },
    ],
  },
  {
    id: "pl_gb_default",
    name: "United Kingdom — Standard",
    countryCode: "GB",
    currencyCode: "GBP",
    isDefault: true,
    updatedAt: now,
    items: [
      { id: "pli_gb_digital", type: "digital_download", name: "Digital Download (HD)", amount: 6, description: "Single high-resolution digital photo." },
      { id: "pli_gb_print", type: "single_print", name: '6x4" Print', amount: 4, description: "Glossy photographic print." },
      { id: "pli_gb_pkg", type: "package", name: "Class Package (10 photos)", amount: 38, unitsIncluded: 10, description: "Any 10 digital downloads, bundled." },
    ],
    bulkDiscounts: [{ id: "bd_gb_5", minQuantity: 5, discountPercent: 12 }],
  },
  {
    id: "pl_in_default",
    name: "India — Standard",
    countryCode: "IN",
    currencyCode: "INR",
    isDefault: true,
    updatedAt: now,
    items: [
      { id: "pli_in_digital", type: "digital_download", name: "Digital Download (HD)", amount: 199, description: "Single high-resolution digital photo." },
      { id: "pli_in_print", type: "single_print", name: '6x4" Print', amount: 99, description: "Glossy photographic print." },
      { id: "pli_in_pkg", type: "package", name: "Class Package (10 photos)", amount: 999, unitsIncluded: 10, description: "Any 10 digital downloads, bundled." },
    ],
    bulkDiscounts: [{ id: "bd_in_5", minQuantity: 5, discountPercent: 8 }],
  },
];

export const MOCK_USERS: (AuthUser & { password: string })[] = [
  {
    id: "usr_platform",
    name: "Avery Platform",
    email: "admin@snapschool.dev",
    password: "admin123",
    role: "platform_admin",
    avatarUrl: "https://api.dicebear.com/9.x/notionists/svg?seed=Avery",
  },
  {
    id: "usr_riverside",
    name: "Jordan Riverside",
    email: "admin@riverside.edu",
    password: "school123",
    role: "school_admin",
    schoolIds: ["sch_riverside"],
    avatarUrl: "https://api.dicebear.com/9.x/notionists/svg?seed=Jordan",
  },
  {
    id: "usr_oakwood",
    name: "Sam Oakwood",
    email: "admin@oakwoodhigh.co.uk",
    password: "school123",
    role: "school_admin",
    schoolIds: ["sch_oakwood"],
    avatarUrl: "https://api.dicebear.com/9.x/notionists/svg?seed=Sam",
  },
];
