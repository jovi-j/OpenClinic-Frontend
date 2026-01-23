import type { Person } from "./person";

export interface User {
  id?: string;
  person?: Person;
  type?: string;
  crm?: string;
  membershipId?: string;
  ticketWindow?: number;
}
