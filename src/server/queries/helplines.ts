import { getDb } from "./connection";
import { helplines } from "@/db/schema";
import { eq } from "drizzle-orm";

export async function findAllHelplines() {
  return getDb().query.helplines.findMany({
    orderBy: helplines.country,
  });
}

export async function findHelplinesByCountry(countryCode: string) {
  return getDb().query.helplines.findMany({
    where: eq(helplines.countryCode, countryCode),
  });
}

export async function createHelpline(data: {
  country: string;
  countryCode: string;
  organization: string;
  phoneNumber: string;
  description?: string;
  availableHours?: string;
  website?: string;
}) {
  const [{ id }] = await getDb().insert(helplines).values(data).$returningId();
  return getDb().query.helplines.findFirst({
    where: eq(helplines.id, id),
  });
}