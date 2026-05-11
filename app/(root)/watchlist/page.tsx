import Link from "next/link";
import { Newspaper, Star, TrendingUp } from "lucide-react";
import WatchlistButton from "@/components/WatchListButton";
import { getCurrentUserWatchlist } from "@/lib/actions/watchlist.action";
import { getNews } from "@/lib/actions/finnhub.action";
import { formatTimeAgo } from "@/lib/utils";

const WatchlistPage = async () => {
  const watchlist = await getCurrentUserWatchlist();
  const symbols = watchlist.map((item) => item.symbol);

  let news: MarketNewsArticle[] = [];
  if (symbols.length > 0) {
    try {
      news = await getNews(symbols);
    } catch {
      news = [];
    }
  }

  if (watchlist.length === 0) {
    return (
      <section className="watchlist-empty-container">
        <div className="watchlist-empty">
          <Star className="watchlist-star" />
          <h1 className="empty-title">Your watchlist is empty</h1>
          <p className="empty-description">
            Add stocks from any stock detail page and they will appear here.
          </p>
          <Link href="/" className="watchlist-btn max-w-xs flex items-center justify-center">
            Explore Dashboard
          </Link>
        </div>
      </section>
    );
  }

  return (
    <section className="space-y-8">
      <div className="flex flex-col gap-2">
        <h1 className="watchlist-title">Watchlist</h1>
        <p className="text-gray-500">
          {watchlist.length} saved {watchlist.length === 1 ? "stock" : "stocks"}
        </p>
      </div>

      <div className="watchlist-container">
        <div className="watchlist">
          <div className="watchlist-table">
            <table className="hidden w-full table-fixed border-collapse md:table">
              <colgroup>
                <col className="w-[48%]" />
                <col className="w-[22%]" />
                <col className="w-[30%]" />
              </colgroup>
              <thead>
                <tr className="table-header-row">
                  <th className="table-header px-4 py-3 text-left">Stock</th>
                  <th className="table-header px-4 py-3 text-left">Added</th>
                  <th className="table-header px-4 py-3 text-right">Action</th>
                </tr>
              </thead>
              <tbody>
                {watchlist.map((item) => (
                  <tr key={item.symbol} className="table-row">
                    <td className="px-4 py-4 align-middle">
                      <Link href={`/stock/${item.symbol}`} className="flex min-w-0 items-center gap-3">
                        <span className="watchlist-icon">
                          <TrendingUp className="star-icon text-yellow-500" />
                        </span>
                        <span className="min-w-0">
                          <span className="table-cell block text-gray-100">{item.symbol}</span>
                          <span className="block truncate text-sm text-gray-500">{item.company}</span>
                        </span>
                      </Link>
                    </td>
                    <td className="px-4 py-4 align-middle text-sm text-gray-500">
                      {new Date(item.addedAt).toLocaleDateString("en-US", {
                        month: "short",
                        day: "numeric",
                        year: "numeric",
                      })}
                    </td>
                    <td className="px-4 py-4 align-middle">
                      <div className="ml-auto w-64 max-w-full">
                        <WatchlistButton
                          symbol={item.symbol}
                          company={item.company}
                          isInWatchlist
                          showTrashIcon
                        />
                      </div>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>

            <div className="divide-y divide-gray-600 md:hidden">
              {watchlist.map((item) => (
                <div
                  key={item.symbol}
                  className="grid grid-cols-1 gap-4 p-4"
                >
                  <Link href={`/stock/${item.symbol}`} className="flex min-w-0 items-center gap-3">
                    <span className="watchlist-icon">
                      <TrendingUp className="star-icon text-yellow-500" />
                    </span>
                    <span className="min-w-0">
                      <span className="table-cell block text-gray-100">{item.symbol}</span>
                      <span className="block truncate text-sm text-gray-500">{item.company}</span>
                    </span>
                  </Link>

                  <div className="flex items-center justify-between gap-4 text-sm">
                    <span className="text-gray-500">Added</span>
                    <span className="text-gray-400">
                      {new Date(item.addedAt).toLocaleDateString("en-US", {
                        month: "short",
                        day: "numeric",
                        year: "numeric",
                      })}
                    </span>
                  </div>

                  <div className="w-full">
                    <WatchlistButton
                      symbol={item.symbol}
                      company={item.company}
                      isInWatchlist
                      showTrashIcon
                    />
                  </div>
                </div>
              ))}
            </div>
          </div>
        </div>

        <aside className="watchlist-alerts">
          <div className="rounded-lg border border-gray-600 bg-gray-800 p-5">
            <div className="mb-3 flex items-center gap-2 text-gray-100">
              <Newspaper className="h-5 w-5 text-yellow-500" />
              <h2 className="font-semibold">Related News</h2>
            </div>
            <p className="text-sm leading-6 text-gray-500">
              Market headlines are pulled from your saved symbols when available.
            </p>
          </div>
        </aside>
      </div>

      {news.length > 0 ? (
        <div className="space-y-4">
          <h2 className="watchlist-title">Latest Watchlist News</h2>
          <div className="watchlist-news">
            {news.map((article) => (
              <a
                key={`${article.id}-${article.url}`}
                href={article.url}
                target="_blank"
                rel="noreferrer"
                className="news-item"
              >
                <span className="news-tag">
                  {article.related || article.category || "market"}
                </span>
                <h3 className="news-title">{article.headline}</h3>
                <div className="news-meta">
                  {article.source} | {formatTimeAgo(article.datetime)}
                </div>
                <p className="news-summary">{article.summary}</p>
                <span className="news-cta">Read story</span>
              </a>
            ))}
          </div>
        </div>
      ) : null}
    </section>
  );
};

export default WatchlistPage;
