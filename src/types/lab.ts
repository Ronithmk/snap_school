import type { ID, ISODateString } from "./common";

export type LabProductType =
  | "single_print"
  | "collage"
  | "planche_1"
  | "planche_2"
  | "team_sheet"
  | "magazine"
  | "certificate"
  | "id_card"
  | "custom";

export type LabProductStatus = "draft" | "published" | "archived";

export type LabOrientation = "portrait" | "landscape" | "square";

export type LabElementType = "photo" | "text" | "shape";

/** All measurements are in centimeters relative to the page's top-left corner. */
interface LabElementBase {
  id: ID;
  x: number;
  y: number;
  width: number;
  height: number;
  rotation: number;
  zIndex: number;
  locked: boolean;
}

export interface LabPhotoElement extends LabElementBase {
  type: "photo";
  label: string;
  fit: "cover" | "contain";
  placeholderUrl?: string;
}

export interface LabTextElement extends LabElementBase {
  type: "text";
  text: string;
  fontFamily: string;
  fontSize: number;
  fontWeight: "normal" | "medium" | "bold";
  color: string;
  align: "left" | "center" | "right";
}

export interface LabShapeElement extends LabElementBase {
  type: "shape";
  shape: "rectangle" | "ellipse" | "line";
  fill: string;
  stroke: string;
}

export type LabElement = LabPhotoElement | LabTextElement | LabShapeElement;

export interface LabPage {
  id: ID;
  name: string;
  widthCm: number;
  heightCm: number;
  backgroundColor: string;
  backgroundImageUrl?: string;
  elements: LabElement[];
}

export interface LabProductDimensions {
  /** Display label, e.g. "10x15", "A4", "20x30". */
  label: string;
  widthCm: number;
  heightCm: number;
}

export interface LabProduct {
  id: ID;
  schoolId: ID;
  name: string;
  description?: string;
  type: LabProductType;
  category: string;
  status: LabProductStatus;
  previewImageUrl: string;
  dimensions: LabProductDimensions;
  orientation: LabOrientation;
  price: number;
  currencyCode: string;
  taxIncluded: boolean;
  tags: string[];
  pages: LabPage[];
  createdAt: ISODateString;
  updatedAt: ISODateString;
}

export interface CreateLabProductInput {
  name: string;
  description?: string;
  type: LabProductType;
  category: string;
  dimensions: LabProductDimensions;
  orientation: LabOrientation;
  price: number;
  currencyCode: string;
  taxIncluded: boolean;
  tags: string[];
}

export type UpdateLabProductInput = Partial<CreateLabProductInput> & {
  status?: LabProductStatus;
  previewImageUrl?: string;
  pages?: LabPage[];
};

export interface LabProductListFilters {
  search?: string;
  status?: LabProductStatus;
  category?: string;
  type?: LabProductType;
}

export type LabExportFormat = "jpg" | "pdf" | "zip";

export interface LabExportRequest {
  productId: ID;
  format: LabExportFormat;
}

/** Standard print/page sizes offered when creating a product or page. */
export interface LabSizePreset {
  label: string;
  widthCm: number;
  heightCm: number;
}

export const LAB_SIZE_PRESETS: LabSizePreset[] = [
  { label: "A4", widthCm: 21, heightCm: 29.7 },
  { label: "A5", widthCm: 14.8, heightCm: 21 },
  { label: "10x15", widthCm: 10, heightCm: 15 },
  { label: "13x18", widthCm: 13, heightCm: 18 },
  { label: "15x23", widthCm: 15, heightCm: 23 },
  { label: "18x24", widthCm: 18, heightCm: 24 },
  { label: "20x30", widthCm: 20, heightCm: 30 },
];
