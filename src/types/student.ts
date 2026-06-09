import type { ID, ISODateString } from "./common";

export interface Student {
  id: ID;
  schoolId: ID;
  classId: ID;
  /** Padded numeric string shown on card, e.g. "0067" */
  number: string;
  name: string;
  /** Auto-generated username shown on access card */
  username: string;
  /** Auto-generated access code / password shown on access card */
  accessCode: string;
  /** Portrait photo URL shown on the access card */
  coverPhotoUrl?: string;
  createdAt: ISODateString;
}

export interface CreateStudentInput {
  classId: ID;
  name: string;
  number?: string;
  coverPhotoUrl?: string;
}
