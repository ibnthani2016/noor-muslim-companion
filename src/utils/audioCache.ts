/**
 * Audio Cache Utility (Offline Quran Recitations)
 * Uses browser Cache Storage API to store & retrieve EveryAyah verse audio files offline.
 */

import { getAyahAudioUrl } from "@/data/quranData";

export const AUDIO_CACHE_NAME = "noor-quran-audio-v1";

// Check if Cache Storage API is supported in the current environment
export function isCacheStorageAvailable(): boolean {
  return typeof window !== "undefined" && "caches" in window;
}

/**
 * Check if a specific audio URL is cached, returning a Blob Object URL if present
 */
export async function getOfflineAudioUrl(url: string): Promise<string | null> {
  if (!isCacheStorageAvailable()) return null;

  try {
    const cache = await caches.open(AUDIO_CACHE_NAME);
    const response = await cache.match(url);
    if (!response) return null;

    const blob = await response.blob();
    return URL.createObjectURL(blob);
  } catch (error) {
    console.warn("[AudioCache] Error retrieving cached audio:", error);
    return null;
  }
}

/**
 * Cache an audio file from a remote URL in the background
 */
export async function cacheAudioUrl(url: string): Promise<boolean> {
  if (!isCacheStorageAvailable()) return false;

  try {
    const cache = await caches.open(AUDIO_CACHE_NAME);
    const existing = await cache.match(url);
    if (existing) return true; // Already cached

    const res = await fetch(url, { mode: "cors" });
    if (!res.ok) return false;

    await cache.put(url, res.clone());
    return true;
  } catch (error) {
    console.warn("[AudioCache] Error caching audio URL:", error);
    return false;
  }
}

/**
 * Check how many ayahs of a surah are cached locally for a specific reciter
 */
export async function getSurahCacheStatus(
  surahNumber: number,
  totalAyahs: number,
  reciterId: string
): Promise<{ cachedCount: number; totalAyahs: number; isFullyCached: boolean }> {
  if (!isCacheStorageAvailable()) {
    return { cachedCount: 0, totalAyahs, isFullyCached: false };
  }

  try {
    const cache = await caches.open(AUDIO_CACHE_NAME);
    let cachedCount = 0;
    const startAyah = (surahNumber !== 9 && surahNumber !== 1) ? 0 : 1;
    const expectedTotal = hasBismillah(surahNumber) ? totalAyahs + 1 : totalAyahs;

    for (let ayah = startAyah; ayah <= totalAyahs; ayah++) {
      const url = getAyahAudioUrl(surahNumber, ayah, reciterId);
      const match = await cache.match(url);
      if (match) cachedCount++;
    }

    return {
      cachedCount,
      totalAyahs: expectedTotal,
      isFullyCached: cachedCount >= totalAyahs && totalAyahs > 0,
    };
  } catch (error) {
    console.warn("[AudioCache] Error checking surah cache status:", error);
    return { cachedCount: 0, totalAyahs, isFullyCached: false };
  }
}

function hasBismillah(surahNum: number): boolean {
  return surahNum !== 9 && surahNum !== 1;
}

/**
 * Download and cache an entire Surah for offline listening with live progress updates
 */
export async function downloadSurahAudio(
  surahNumber: number,
  totalAyahs: number,
  reciterId: string,
  onProgress?: (completed: number, total: number) => void
): Promise<{ success: boolean; downloaded: number }> {
  if (!isCacheStorageAvailable()) {
    return { success: false, downloaded: 0 };
  }

  try {
    const cache = await caches.open(AUDIO_CACHE_NAME);
    let completed = 0;

    // Process with concurrency limit of 3 for smooth network handling
    const concurrency = 3;
    const withBismillah = hasBismillah(surahNumber);
    const ayahIndices = withBismillah
      ? [0, ...Array.from({ length: totalAyahs }, (_, i) => i + 1)]
      : Array.from({ length: totalAyahs }, (_, i) => i + 1);

    const totalToDownload = ayahIndices.length;

    for (let i = 0; i < ayahIndices.length; i += concurrency) {
      const batch = ayahIndices.slice(i, i + concurrency);
      await Promise.all(
        batch.map(async (ayah) => {
          const url = getAyahAudioUrl(surahNumber, ayah, reciterId);
          if (!url) return;
          try {
            const existing = await cache.match(url);
            if (!existing) {
              const res = await fetch(url, { mode: "cors" });
              if (res.ok) {
                await cache.put(url, res.clone());
              }
            }
          } catch (e) {
            console.warn(`[AudioCache] Failed to download ayah ${ayah}:`, e);
          } finally {
            completed++;
            if (onProgress) {
              onProgress(completed, totalToDownload);
            }
          }
        })
      );
    }

    return { success: true, downloaded: completed };
  } catch (error) {
    console.error("[AudioCache] Error downloading surah audio:", error);
    return { success: false, downloaded: 0 };
  }
}

/**
 * Remove downloaded audio files for a specific Surah and reciter from cache
 */
export async function deleteSurahAudio(
  surahNumber: number,
  totalAyahs: number,
  reciterId: string
): Promise<boolean> {
  if (!isCacheStorageAvailable()) return false;

  try {
    const cache = await caches.open(AUDIO_CACHE_NAME);
    const startAyah = hasBismillah(surahNumber) ? 0 : 1;
    for (let ayah = startAyah; ayah <= totalAyahs; ayah++) {
      const url = getAyahAudioUrl(surahNumber, ayah, reciterId);
      if (url) {
        await cache.delete(url);
      }
    }
    return true;
  } catch (error) {
    console.warn("[AudioCache] Error deleting surah audio:", error);
    return false;
  }
}

/**
 * Calculate total storage used by cached Quran audio files
 */
export async function getAudioCacheStorageUsage(): Promise<{
  entryCount: number;
  formattedSize: string;
}> {
  if (!isCacheStorageAvailable()) {
    return { entryCount: 0, formattedSize: "0 KB" };
  }

  try {
    const cache = await caches.open(AUDIO_CACHE_NAME);
    const keys = await cache.keys();
    let totalBytes = 0;

    // Sample or compute sizes
    for (const request of keys) {
      const res = await cache.match(request);
      if (res) {
        const blob = await res.blob();
        totalBytes += blob.size;
      }
    }

    let formatted = "0 KB";
    if (totalBytes > 1024 * 1024) {
      formatted = `${(totalBytes / (1024 * 1024)).toFixed(1)} MB`;
    } else if (totalBytes > 0) {
      formatted = `${Math.round(totalBytes / 1024)} KB`;
    }

    return {
      entryCount: keys.length,
      formattedSize: formatted,
    };
  } catch (error) {
    console.warn("[AudioCache] Error calculating storage:", error);
    return { entryCount: 0, formattedSize: "0 KB" };
  }
}

/**
 * Purge all cached audio
 */
export async function clearAllAudioCache(): Promise<boolean> {
  if (!isCacheStorageAvailable()) return false;
  try {
    return await caches.delete(AUDIO_CACHE_NAME);
  } catch (error) {
    console.warn("[AudioCache] Error purging cache:", error);
    return false;
  }
}

/**
 * Quick scan to find which Surahs have cached audio verses in Cache Storage
 */
export async function getCachedSurahMap(): Promise<Record<number, boolean>> {
  if (!isCacheStorageAvailable()) return {};
  try {
    const cache = await caches.open(AUDIO_CACHE_NAME);
    const requests = await cache.keys();
    const map: Record<number, boolean> = {};
    for (const req of requests) {
      const match = req.url.match(/\/(\d{3})\d{3}\.mp3$/);
      if (match) {
        const surahNum = parseInt(match[1], 10);
        map[surahNum] = true;
      }
    }
    return map;
  } catch {
    return {};
  }
}
