import { notFound } from "next/navigation";
import { verifyAdminSession } from "@/lib/admin/dal";
import {
  getArticleById,
  getCategoriesForSelect,
  getTopicsForSelect,
  getAllTagNames,
  getArticleTagNames,
} from "../queries";
import { ArticleForm } from "../ArticleForm";

export async function generateMetadata({ params }: { params: Promise<{ id: string }> }) {
  const { id } = await params;
  const article = await getArticleById(Number(id));
  return { title: article ? `Edit · ${article.title}` : "Edit article" };
}

export default async function EditArticlePage({ params }: { params: Promise<{ id: string }> }) {
  const { id } = await params;
  const articleId = Number(id);
  if (!Number.isInteger(articleId)) notFound();

  const { adminUser } = await verifyAdminSession();
  const [article, categories, topics, allTagNames] = await Promise.all([
    getArticleById(articleId),
    getCategoriesForSelect(),
    getTopicsForSelect(),
    getAllTagNames(),
  ]);

  if (!article) notFound();

  const initialTagNames = await getArticleTagNames(articleId);

  return (
    <ArticleForm
      article={article}
      categories={categories}
      topics={topics}
      allTagNames={allTagNames}
      initialTagNames={initialTagNames}
      defaultAuthorName={adminUser.name || adminUser.email || "MenWhoFeel Core"}
    />
  );
}
