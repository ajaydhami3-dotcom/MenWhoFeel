import { verifyAdminSession } from "@/lib/admin/dal";
import { getCategoriesForSelect, getTopicsForSelect, getAllTagNames } from "../queries";
import { ArticleForm } from "../ArticleForm";

export const metadata = { title: "New article" };

export default async function NewArticlePage() {
  const { adminUser } = await verifyAdminSession();
  const [categories, topics, allTagNames] = await Promise.all([
    getCategoriesForSelect(),
    getTopicsForSelect(),
    getAllTagNames(),
  ]);

  return (
    <ArticleForm
      article={null}
      categories={categories}
      topics={topics}
      allTagNames={allTagNames}
      initialTagNames={[]}
      defaultAuthorName={adminUser.name || adminUser.email || "MenWhoFeel Core"}
    />
  );
}
