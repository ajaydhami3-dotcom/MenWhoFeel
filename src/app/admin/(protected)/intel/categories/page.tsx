import { FolderTree } from "lucide-react";
import { getCategoriesWithCounts } from "../queries";
import { CategoryDialog } from "./CategoryDialog";
import { DeleteCategoryDialog } from "./DeleteCategoryDialog";
import { Card, CardContent } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Empty, EmptyHeader, EmptyTitle, EmptyDescription, EmptyMedia } from "@/components/ui/empty";

export const metadata = { title: "Categories" };

export default async function CategoriesPage() {
  const categories = await getCategoriesWithCounts();

  return (
    <div className="space-y-5">
      <div className="flex items-center justify-between gap-4">
        <div>
          <h1 className="text-2xl font-semibold">Categories</h1>
          <p className="text-sm text-muted-foreground">
            {categories.length} categor{categories.length === 1 ? "y" : "ies"}
          </p>
        </div>
        <CategoryDialog />
      </div>

      {categories.length === 0 ? (
        <Empty>
          <EmptyHeader>
            <EmptyMedia variant="icon">
              <FolderTree />
            </EmptyMedia>
            <EmptyTitle>No categories yet</EmptyTitle>
            <EmptyDescription>Create one to start organizing Intel articles.</EmptyDescription>
          </EmptyHeader>
        </Empty>
      ) : (
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
          {categories.map((c) => (
            <Card key={c.id}>
              <CardContent className="pt-6 space-y-2">
                <div className="flex items-start justify-between gap-2">
                  <div className="min-w-0">
                    <h3 className="font-medium truncate">{c.name}</h3>
                    <p className="text-xs text-muted-foreground">/category/{c.slug}</p>
                  </div>
                  <div className="flex items-center shrink-0">
                    <CategoryDialog category={c} />
                    <DeleteCategoryDialog
                      categoryId={c.id}
                      name={c.name}
                      otherCategories={categories.filter((other) => other.id !== c.id)}
                    />
                  </div>
                </div>
                {c.description && <p className="text-sm text-muted-foreground line-clamp-2">{c.description}</p>}
                <Badge variant="outline">
                  {c.articleCount} article{c.articleCount === 1 ? "" : "s"}
                </Badge>
              </CardContent>
            </Card>
          ))}
        </div>
      )}
    </div>
  );
}
