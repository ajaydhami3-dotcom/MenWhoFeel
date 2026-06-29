import Link from "next/link";
import { Plus } from "lucide-react";
import { Button } from "@/components/ui/button";
import { getIntelList, getCategoriesForSelect, type IntelSort } from "./queries";
import { IntelToolbar } from "./IntelToolbar";
import { IntelTable } from "./IntelTable";

export const metadata = { title: "Intel" };

type SearchParams = Promise<{
  q?: string;
  status?: string;
  category?: string;
  sort?: string;
  page?: string;
}>;

export default async function IntelListPage({ searchParams }: { searchParams: SearchParams }) {
  const sp = await searchParams;
  const page = Number(sp.page) > 0 ? Number(sp.page) : 1;
  const categoryId = sp.category ? Number(sp.category) : undefined;

  const [{ rows, total, pageCount }, categories] = await Promise.all([
    getIntelList({
      search: sp.q,
      status: sp.status,
      categoryId,
      sort: sp.sort as IntelSort | undefined,
      page,
    }),
    getCategoriesForSelect(),
  ]);

  return (
    <div className="space-y-5">
      <div className="flex items-center justify-between gap-4">
        <div>
          <h1 className="text-2xl font-semibold">Intel</h1>
          <p className="text-sm text-muted-foreground">
            {total} article{total === 1 ? "" : "s"}
          </p>
        </div>
        <Button asChild>
          <Link href="/admin/intel/new">
            <Plus className="size-4" /> New article
          </Link>
        </Button>
      </div>

      <IntelToolbar categories={categories} />
      <IntelTable rows={rows} page={page} pageCount={pageCount} />
    </div>
  );
}
