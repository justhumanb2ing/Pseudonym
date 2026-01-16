import type { Tables } from "./database.types";

export interface StudioOutletContext {
  page: Omit<Tables<"pages">, "created_at" | "updated_at">;
  handle: string;
}
