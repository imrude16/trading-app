"use client";
import React, { useMemo, useState, useTransition } from "react";
import { useRouter } from "next/navigation";
import { Loader2 } from "lucide-react";
import { toggleWatchlist } from "@/lib/actions/watchlist.action";

const WatchlistButton = ({
  symbol,
  company,
  isInWatchlist,
  showTrashIcon = false,
  type = "button",
  onWatchlistChange,
}: WatchlistButtonProps) => {
  const [added, setAdded] = useState<boolean>(!!isInWatchlist);
  const [pendingAction, setPendingAction] = useState<"adding" | "removing" | null>(null);
  const [isPending, startTransition] = useTransition();
  const router = useRouter();

  const label = useMemo(() => {
    if (type === "icon") return added ? "" : "";
    if (pendingAction) return pendingAction === "adding" ? "Adding..." : "Removing...";
    return added ? "Remove from Watchlist" : "Add to Watchlist";
  }, [added, pendingAction, type]);

  const handleClick = () => {
    const next = !added;
    setPendingAction(next ? "adding" : "removing");
    setAdded(next);
    onWatchlistChange?.(symbol, next);

    startTransition(async () => {
      const result = await toggleWatchlist({
        symbol,
        company,
        shouldAdd: next,
      });

      if (!result.success) {
        setAdded(!next);
        onWatchlistChange?.(symbol, !next);
        setPendingAction(null);
        return;
      }

      setPendingAction(null);
      router.refresh();
    });
  };

  if (type === "icon") {
    return (
      <button
        title={added ? `Remove ${symbol} from watchlist` : `Add ${symbol} to watchlist`}
        aria-label={added ? `Remove ${symbol} from watchlist` : `Add ${symbol} to watchlist`}
        className={`watchlist-icon-btn ${added ? "watchlist-icon-added" : ""}`}
        disabled={isPending || pendingAction !== null}
        onClick={handleClick}
      >
        <svg
          xmlns="http://www.w3.org/2000/svg"
          viewBox="0 0 24 24"
          fill={added ? "#FACC15" : "none"}
          stroke="#FACC15"
          strokeWidth="1.5"
          className="watchlist-star"
        >
          <path
            strokeLinecap="round"
            strokeLinejoin="round"
            d="M11.48 3.499a.562.562 0 011.04 0l2.125 5.111a.563.563 0 00.475.345l5.518.442c.499.04.701.663.321.988l-4.204 3.602a.563.563 0 00-.182.557l1.285 5.385a.562.562 0 01-.84.61l-4.725-2.885a.563.563 0 00-.586 0L6.982 20.54a.562.562 0 01-.84-.61l1.285-5.385a.563.563 0 00-.182-.557L3.04 10.385a.563.563 0 01.321-.988l5.518-.442a.563.563 0 00.475-.345l2.125-5.111z"
          />
        </svg>
      </button>
    );
  }

  return (
    <button
      className={`watchlist-btn ${added ? "watchlist-remove" : ""}`}
      disabled={isPending || pendingAction !== null}
      onClick={handleClick}
    >
      {pendingAction ? <Loader2 className="h-5 w-5 shrink-0 animate-spin" /> : null}
      {showTrashIcon && added && !pendingAction ? (
        <svg
          xmlns="http://www.w3.org/2000/svg"
          fill="none"
          viewBox="0 0 24 24"
          strokeWidth={1.5}
          stroke="currentColor"
          className="h-5 w-5 shrink-0"
        >
          <path strokeLinecap="round" strokeLinejoin="round" d="M6 7h12M9 7V5a1 1 0 011-1h4a1 1 0 011 1v2m-7 4v6m4-6v6m4-6v6" />
        </svg>
      ) : null}
      <span>{label}</span>
    </button>
  );
};

export default WatchlistButton;
