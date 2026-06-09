import type { AuthUser, PriceList, School, SchoolClass, Student } from "@/types";

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

// Shared portrait preview images for price list item mockups
const PORTRAIT_A = "https://images.unsplash.com/photo-1529626455594-4ff0802cfb7e?w=600&q=70";
const PORTRAIT_B = "https://images.unsplash.com/photo-1503454537195-1dcabb73ffb9?w=600&q=70";
const PORTRAIT_C = "https://images.unsplash.com/photo-1588361861040-ac9b1018f6d5?w=600&q=70";
const MUG_IMG   = "https://images.unsplash.com/photo-1572119865084-43c285814d63?w=600&q=70";
const CANVAS_IMG = "https://images.unsplash.com/photo-1579541671172-43429ce17aca?w=600&q=70";

export const MOCK_PRICE_LISTS: PriceList[] = [
  {
    id: "pl_us_default",
    schoolId: "sch_riverside",
    name: "United States — Standard",
    countryCode: "US",
    currencyCode: "USD",
    isDefault: true,
    updatedAt: now,
    items: [
      {
        id: "pli_us_pack_std", type: "package", name: "Pack Standard", amount: 22,
        description: "3 sheets: 18×27, duo B&W, multi-pose. Format: 20×30 cm",
        previewImageUrl: PORTRAIT_A, unitsIncluded: 3,
      },
      {
        id: "pli_us_sheet_1827", type: "single_print", name: "1 sheet 18×27", amount: 12,
        description: "Format: 20×30 cm", previewImageUrl: PORTRAIT_A,
      },
      {
        id: "pli_us_duo_bw", type: "single_print", name: "Sheet of 2 photos (1 color and 1 black and white)", amount: 12,
        description: "Format: 20×30 cm", previewImageUrl: PORTRAIT_B,
      },
      {
        id: "pli_us_1318_nb", type: "single_print", name: "1(13×18) + 1(13×18)NB", amount: 12,
        description: "One color + one black and white. Format: 20×30 cm", previewImageUrl: PORTRAIT_B,
      },
      {
        id: "pli_us_multi", type: "package", name: "1(13×18) + 1(9×13) + 1(6×9) + 1(4×6) + 2 ID", amount: 12,
        description: "Multi-format sheet. Format: 20×30 cm", previewImageUrl: PORTRAIT_C, unitsIncluded: 6,
      },
      {
        id: "pli_us_calendar", type: "addon", name: "Calendar and MP", amount: 12,
        description: "Desk calendar with monthly portrait.", previewImageUrl: PORTRAIT_C,
      },
      {
        id: "pli_us_greeting", type: "addon", name: "Small Animals Greeting Cards", amount: 12,
        description: "Set of 4 cards with animal-theme borders.", previewImageUrl: PORTRAIT_A,
      },
      {
        id: "pli_us_keychain_magnet", type: "addon", name: "2 keychains + 2 magnets", amount: 12,
        description: "Custom photo keychains and fridge magnets.", previewImageUrl: PORTRAIT_B,
      },
      {
        id: "pli_us_magnets", type: "addon", name: "2 magnets", amount: 8,
        description: "Two rectangular fridge magnets.", previewImageUrl: PORTRAIT_C,
      },
      {
        id: "pli_us_keychains", type: "addon", name: "2 keychains", amount: 8,
        description: "Two oval photo keychains.", previewImageUrl: PORTRAIT_A,
      },
      {
        id: "pli_us_plexi", type: "addon", name: "Plexi Block", amount: 14,
        description: "Acrylic standee with full-color portrait.", previewImageUrl: CANVAS_IMG,
      },
      {
        id: "pli_us_canvas", type: "single_print", name: "24×30 Canvas Poster", amount: 20,
        description: "Gallery-wrapped canvas, 24×30 cm.", previewImageUrl: CANVAS_IMG,
      },
      {
        id: "pli_us_mug", type: "addon", name: "Mug V", amount: 16,
        description: "Ceramic photo mug, 330 ml.", previewImageUrl: MUG_IMG,
      },
      {
        id: "pli_us_digital", type: "digital_download", name: "Digital Download (HD)", amount: 8,
        description: "Single high-resolution digital photo.", previewImageUrl: PORTRAIT_A,
      },
    ],
    bulkDiscounts: [
      { id: "bd_us_5", minQuantity: 5, discountPercent: 10 },
      { id: "bd_us_10", minQuantity: 10, discountPercent: 18 },
    ],
  },
  {
    id: "pl_gb_default",
    schoolId: "sch_oakwood",
    name: "United Kingdom — Standard",
    countryCode: "GB",
    currencyCode: "GBP",
    isDefault: true,
    updatedAt: now,
    items: [
      { id: "pli_gb_pack", type: "package", name: "Pack Standard", amount: 18, unitsIncluded: 3, description: "3 photo sheets. Format: 20×30 cm", previewImageUrl: PORTRAIT_A },
      { id: "pli_gb_sheet", type: "single_print", name: '10×8" Portrait', amount: 10, description: "Glossy portrait print.", previewImageUrl: PORTRAIT_B },
      { id: "pli_gb_duo", type: "single_print", name: "Duo print (colour + B&W)", amount: 10, description: "Format: 20×30 cm", previewImageUrl: PORTRAIT_C },
      { id: "pli_gb_canvas", type: "single_print", name: "Canvas print", amount: 18, description: "Gallery-wrapped canvas.", previewImageUrl: CANVAS_IMG },
      { id: "pli_gb_mug", type: "addon", name: "Photo Mug", amount: 14, description: "Ceramic photo mug.", previewImageUrl: MUG_IMG },
      { id: "pli_gb_digital", type: "digital_download", name: "Digital Download (HD)", amount: 6, description: "High-resolution digital file.", previewImageUrl: PORTRAIT_A },
      { id: "pli_gb_pkg", type: "package", name: "Class Package (10 photos)", amount: 38, unitsIncluded: 10, description: "Any 10 digital downloads.", previewImageUrl: PORTRAIT_B },
    ],
    bulkDiscounts: [{ id: "bd_gb_5", minQuantity: 5, discountPercent: 12 }],
  },
  {
    id: "pl_in_default",
    schoolId: "sch_sunrise",
    name: "India — Standard",
    countryCode: "IN",
    currencyCode: "INR",
    isDefault: true,
    updatedAt: now,
    items: [
      { id: "pli_in_pack", type: "package", name: "Photo Pack (3 sheets)", amount: 799, unitsIncluded: 3, description: "3 printed sheets, 20×30 cm", previewImageUrl: PORTRAIT_A },
      { id: "pli_in_print", type: "single_print", name: "Portrait Print 6×4\"", amount: 99, description: "Glossy print.", previewImageUrl: PORTRAIT_B },
      { id: "pli_in_canvas", type: "single_print", name: "Canvas Print", amount: 499, description: "Gallery-wrapped canvas.", previewImageUrl: CANVAS_IMG },
      { id: "pli_in_mug", type: "addon", name: "Photo Mug", amount: 349, description: "Ceramic mug with portrait.", previewImageUrl: MUG_IMG },
      { id: "pli_in_digital", type: "digital_download", name: "Digital Download (HD)", amount: 199, description: "High-resolution digital file.", previewImageUrl: PORTRAIT_A },
      { id: "pli_in_pkg", type: "package", name: "Class Package (10 photos)", amount: 999, unitsIncluded: 10, description: "Any 10 digital downloads.", previewImageUrl: PORTRAIT_C },
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

// Deterministic helpers for mock student credentials
function studentUsername(n: number) { return String(1000000 + n * 97 + 3).slice(0, 7); }
function studentCode(seed: number) {
  const chars = "ABCDEFGHJKLMNPQRSTUVWXYZ23456789";
  let r = seed * 6364136223846793005 + 1442695040888963407;
  return Array.from({ length: 8 }, () => { r = (r * 1103515245 + 12345) & 0x7fffffff; return chars[r % chars.length]; }).join("");
}

export const MOCK_STUDENTS: Student[] = [
  // Grade 5A — Riverside Elementary
  { id: "stu_riv_001", schoolId: "sch_riverside", classId: "cls_riv_5a", number: "0051", name: "Emma Johnson", username: studentUsername(51), accessCode: studentCode(51), coverPhotoUrl: "https://i.pravatar.cc/150?img=47", createdAt: now },
  { id: "stu_riv_002", schoolId: "sch_riverside", classId: "cls_riv_5a", number: "0052", name: "Liam Smith",   username: studentUsername(52), accessCode: studentCode(52), coverPhotoUrl: "https://i.pravatar.cc/150?img=53", createdAt: now },
  { id: "stu_riv_003", schoolId: "sch_riverside", classId: "cls_riv_5a", number: "0053", name: "Olivia Brown", username: studentUsername(53), accessCode: studentCode(53), coverPhotoUrl: "https://i.pravatar.cc/150?img=44", createdAt: now },
  { id: "stu_riv_004", schoolId: "sch_riverside", classId: "cls_riv_5a", number: "0054", name: "Noah Davis",  username: studentUsername(54), accessCode: studentCode(54), coverPhotoUrl: "https://i.pravatar.cc/150?img=56", createdAt: now },
  { id: "stu_riv_005", schoolId: "sch_riverside", classId: "cls_riv_5a", number: "0055", name: "Sophia Wilson", username: studentUsername(55), accessCode: studentCode(55), coverPhotoUrl: "https://i.pravatar.cc/150?img=45", createdAt: now },
  { id: "stu_riv_006", schoolId: "sch_riverside", classId: "cls_riv_5a", number: "0056", name: "Jackson Martinez", username: studentUsername(56), accessCode: studentCode(56), coverPhotoUrl: "https://i.pravatar.cc/150?img=57", createdAt: now },

  // Grade 5B — Riverside Elementary
  { id: "stu_riv_007", schoolId: "sch_riverside", classId: "cls_riv_5b", number: "0067", name: "Ava Anderson", username: studentUsername(67), accessCode: studentCode(67), coverPhotoUrl: "https://i.pravatar.cc/150?img=48", createdAt: now },
  { id: "stu_riv_008", schoolId: "sch_riverside", classId: "cls_riv_5b", number: "0068", name: "Ethan Thomas", username: studentUsername(68), accessCode: studentCode(68), coverPhotoUrl: "https://i.pravatar.cc/150?img=59", createdAt: now },
  { id: "stu_riv_009", schoolId: "sch_riverside", classId: "cls_riv_5b", number: "0069", name: "Isabella Garcia", username: studentUsername(69), accessCode: studentCode(69), coverPhotoUrl: "https://i.pravatar.cc/150?img=49", createdAt: now },
  { id: "stu_riv_010", schoolId: "sch_riverside", classId: "cls_riv_5b", number: "0070", name: "Mason Rodriguez", username: studentUsername(70), accessCode: studentCode(70), coverPhotoUrl: "https://i.pravatar.cc/150?img=60", createdAt: now },
  { id: "stu_riv_011", schoolId: "sch_riverside", classId: "cls_riv_5b", number: "0071", name: "Mia Lewis",   username: studentUsername(71), accessCode: studentCode(71), coverPhotoUrl: "https://i.pravatar.cc/150?img=46", createdAt: now },

  // Sports Day — Riverside Elementary (event class, no individual students usually, but add a few)
  { id: "stu_riv_012", schoolId: "sch_riverside", classId: "cls_riv_sports", number: "0082", name: "Lucas Lee",  username: studentUsername(82), accessCode: studentCode(82), coverPhotoUrl: "https://i.pravatar.cc/150?img=61", createdAt: now },
  { id: "stu_riv_013", schoolId: "sch_riverside", classId: "cls_riv_sports", number: "0083", name: "Amelia Walker", username: studentUsername(83), accessCode: studentCode(83), coverPhotoUrl: "https://i.pravatar.cc/150?img=50", createdAt: now },

  // Oakwood High
  { id: "stu_oak_001", schoolId: "sch_oakwood", classId: "cls_oak_seniors", number: "0101", name: "Charlotte Hall", username: studentUsername(101), accessCode: studentCode(101), coverPhotoUrl: "https://i.pravatar.cc/150?img=51", createdAt: now },
  { id: "stu_oak_002", schoolId: "sch_oakwood", classId: "cls_oak_seniors", number: "0102", name: "Benjamin Allen", username: studentUsername(102), accessCode: studentCode(102), coverPhotoUrl: "https://i.pravatar.cc/150?img=62", createdAt: now },
  { id: "stu_oak_003", schoolId: "sch_oakwood", classId: "cls_oak_seniors", number: "0103", name: "Harper Young", username: studentUsername(103), accessCode: studentCode(103), coverPhotoUrl: "https://i.pravatar.cc/150?img=52", createdAt: now },
];
