import type { ID, ISODateString } from "./common";

export interface SupportTicketInput {
  name: string;
  email: string;
  subject: string;
  message: string;
}

export type SupportTicketStatus = "open" | "resolved";

export interface SupportTicket {
  id: ID;
  name: string;
  email: string;
  subject: string;
  message: string;
  status: SupportTicketStatus;
  createdAt: ISODateString;
}
