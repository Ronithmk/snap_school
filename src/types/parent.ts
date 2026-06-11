import type { ID } from "./common";

export interface ParentChild {
  studentId: ID;
  studentName: string;
  studentUsername: string;
  schoolId: ID;
  schoolName: string;
  schoolSlug: string;
  albumId: ID | null;
  coverPhotoUrl: string | null;
}

export interface LinkChildInput {
  username: string;
  accessCode: string;
}

export interface ParentRegisterInput {
  name: string;
  email: string;
  password: string;
  username: string;
  accessCode: string;
}
