import { useEffect, useState } from "react";
import { useParams, useNavigate } from "react-router-dom";
import { Header } from "@/components/Header";
import { Footer } from "@/components/Footer";
import { storefrontApi, type StorefrontPage } from "@/services/storefront";
import { Skeleton } from "@/components/ui/skeleton";

export default function Page() {
  const { slug } = useParams<{ slug: string }>();
  const navigate = useNavigate();
  const [page, setPage] = useState<StorefrontPage | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    if (!slug) return;
    let cancelled = false;
    setIsLoading(true);
    void (async () => {
      try {
        const p = await storefrontApi.getPage(slug);
        if (!cancelled) {
          setPage(p);
          setError(null);
          if (p.metaTitle) document.title = p.metaTitle;
        }
      } catch (e) {
        if (!cancelled) {
          setError((e as Error).message ?? "Page not found");
          setPage(null);
        }
      } finally {
        if (!cancelled) setIsLoading(false);
      }
    })();
    return () => {
      cancelled = true;
    };
  }, [slug]);

  return (
    <div className="min-h-screen bg-background">
      <Header />
      <main className="max-w-3xl mx-auto px-4 py-10">
        {isLoading ? (
          <div className="space-y-3">
            <Skeleton className="h-10 w-2/3" />
            <Skeleton className="h-6 w-full" />
            <Skeleton className="h-6 w-full" />
            <Skeleton className="h-6 w-3/4" />
          </div>
        ) : error || !page ? (
          <div className="text-center py-20">
            <h1 className="text-2xl font-semibold mb-2">Page not found</h1>
            <p className="text-muted-foreground mb-6">
              {error ?? "We couldn't find the page you're looking for."}
            </p>
            <button
              onClick={() => navigate("/")}
              className="text-primary underline"
            >
              Back home
            </button>
          </div>
        ) : (
          <article>
            <header className="mb-6">
              <h1 className="text-3xl font-bold tracking-tight">{page.name}</h1>
              {page.metaDescription && (
                <p className="text-muted-foreground mt-2">{page.metaDescription}</p>
              )}
            </header>
            <div
              className="prose prose-neutral dark:prose-invert max-w-none whitespace-pre-wrap"
              // Trust admin content; render as text + line breaks. For HTML in future,
              // sanitise on the server before storing.
            >
              {page.content || ""}
            </div>
          </article>
        )}
      </main>
      <Footer />
    </div>
  );
}
