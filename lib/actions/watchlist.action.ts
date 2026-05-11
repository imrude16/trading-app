'use server';

import { connectToDatabase } from '@/database/mongoose';
import { Watchlist } from '@/database/models/watchlist.model';
import { auth } from '@/lib/better-auth/auth';
import { headers } from 'next/headers';
import { revalidatePath } from 'next/cache';

const getCurrentUserId = async () => {
  const session = await auth.api.getSession({ headers: await headers() });
  return session?.user?.id || null;
};

const normalizeSymbol = (symbol: string) => symbol.trim().toUpperCase();

export async function getCurrentUserWatchlist(): Promise<StockWithData[]> {
  const userId = await getCurrentUserId();
  if (!userId) return [];

  try {
    await connectToDatabase();

    const items = await Watchlist.find({ userId })
      .sort({ addedAt: -1 })
      .lean();

    return items.map((item) => ({
      userId: String(item.userId),
      symbol: String(item.symbol),
      company: String(item.company),
      addedAt: new Date(item.addedAt),
    }));
  } catch (err) {
    console.error('getCurrentUserWatchlist error:', err);
    return [];
  }
}

export async function isSymbolInCurrentUserWatchlist(symbol: string): Promise<boolean> {
  const userId = await getCurrentUserId();
  if (!userId || !symbol) return false;

  try {
    await connectToDatabase();

    const item = await Watchlist.exists({
      userId,
      symbol: normalizeSymbol(symbol),
    });

    return Boolean(item);
  } catch (err) {
    console.error('isSymbolInCurrentUserWatchlist error:', err);
    return false;
  }
}

export async function addToWatchlist({
  symbol,
  company,
}: {
  symbol: string;
  company: string;
}) {
  const userId = await getCurrentUserId();
  if (!userId) return { success: false, error: 'Unauthorized' };

  const normalizedSymbol = normalizeSymbol(symbol);
  if (!normalizedSymbol) return { success: false, error: 'Symbol is required' };

  try {
    await connectToDatabase();

    await Watchlist.updateOne(
      { userId, symbol: normalizedSymbol },
      {
        $setOnInsert: {
          userId,
          symbol: normalizedSymbol,
          company: company?.trim() || normalizedSymbol,
          addedAt: new Date(),
        },
      },
      { upsert: true }
    );

    revalidatePath('/watchlist');
    revalidatePath(`/stock/${normalizedSymbol}`);

    return { success: true, isInWatchlist: true };
  } catch (err) {
    console.error('addToWatchlist error:', err);
    return { success: false, error: 'Failed to add stock to watchlist' };
  }
}

export async function removeFromWatchlist(symbol: string) {
  const userId = await getCurrentUserId();
  if (!userId) return { success: false, error: 'Unauthorized' };

  const normalizedSymbol = normalizeSymbol(symbol);
  if (!normalizedSymbol) return { success: false, error: 'Symbol is required' };

  try {
    await connectToDatabase();

    await Watchlist.deleteOne({ userId, symbol: normalizedSymbol });

    revalidatePath('/watchlist');
    revalidatePath(`/stock/${normalizedSymbol}`);

    return { success: true, isInWatchlist: false };
  } catch (err) {
    console.error('removeFromWatchlist error:', err);
    return { success: false, error: 'Failed to remove stock from watchlist' };
  }
}

export async function toggleWatchlist({
  symbol,
  company,
  shouldAdd,
}: {
  symbol: string;
  company: string;
  shouldAdd: boolean;
}) {
  return shouldAdd
    ? addToWatchlist({ symbol, company })
    : removeFromWatchlist(symbol);
}

export async function getWatchlistSymbolsByEmail(email: string): Promise<string[]> {
  if (!email) return [];

  try {
    const mongoose = await connectToDatabase();
    const db = mongoose.connection.db;
    if (!db) throw new Error('MongoDB connection not found');

    // Better Auth stores users in the "user" collection
    const user = await db.collection('user').findOne<{ _id?: unknown; id?: string; email?: string }>({ email });

    if (!user) return [];

    const userId = (user.id as string) || String(user._id || '');
    if (!userId) return [];

    const items = await Watchlist.find({ userId }, { symbol: 1 }).lean();
    return items.map((i) => String(i.symbol));
  } catch (err) {
    console.error('getWatchlistSymbolsByEmail error:', err);
    return [];
  }
}
