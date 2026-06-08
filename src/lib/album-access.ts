const STORAGE_KEY = "snapschool.album-access";

function readGranted(): string[] {
  if (typeof window === "undefined") return [];
  try {
    const raw = window.sessionStorage.getItem(STORAGE_KEY);
    return raw ? (JSON.parse(raw) as string[]) : [];
  } catch {
    return [];
  }
}

/** Tracks which password-protected albums the visitor has unlocked this browser session. */
export function hasAlbumAccess(albumId: string): boolean {
  return readGranted().includes(albumId);
}

export function grantAlbumAccess(albumId: string): void {
  if (typeof window === "undefined") return;
  const granted = readGranted();
  if (!granted.includes(albumId)) {
    window.sessionStorage.setItem(STORAGE_KEY, JSON.stringify([...granted, albumId]));
  }
}
