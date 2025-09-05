import { clsx, type ClassValue } from "clsx";
import { twMerge } from "tailwind-merge";
import * as exifr from "exifr";
import { convertFileSrc } from "@tauri-apps/api/core";

export let isWindowsOS = false;
export let isMacOS = false;

export function cn(...inputs: ClassValue[]) {
  return twMerge(clsx(inputs));
}

if (typeof window !== "undefined") {
  // Only calculate on client-side
  const userAgent = navigator.userAgent;

  isWindowsOS = userAgent.indexOf("Windows") !== -1;
  isMacOS = userAgent.indexOf("Mac") !== -1;
}

export async function readExifFromPath(path: string) {
  const url = convertFileSrc(path);
  const res = await fetch(url);
  const buf = await res.arrayBuffer();
  try {
    return await exifr.parse(buf);
  } catch {
    return null;
  }
}

export const joinSafe = (parent: string, name: string) => {
  // vælg separator ud fra parent (Windows har '\')
  const sep = parent.includes("\\") ? "\\" : "/";
  return parent.endsWith(sep) ? `${parent}${name}` : `${parent}${sep}${name}`;
};

export const lastName = (p: string): string => p.split(/[/\\]/).pop() ?? p;

export const dirOf = (p: string) => p.replace(/[\\/][^\\/]+$/, "");

// sanitizér brugerens basis-navn til filsystem
export const slug = (s: string) =>
  s
    .trim()
    .replace(/\s+/g, "-")
    .replace(/[^A-Za-z0-9._-]+/g, "") || "untitled";

export const fmtTs = (d: Date, useDayMonth = true) => {
  const pad = (n: number) => String(n).padStart(2, "0");
  const yyyy = d.getFullYear();
  const mm = pad(d.getMonth() + 1);
  const dd = pad(d.getDate());
  const HH = pad(d.getHours());
  const MM = pad(d.getMinutes());
  const SS = pad(d.getSeconds());
  const date = useDayMonth ? `${yyyy}-${dd}-${mm}` : `${yyyy}-${mm}-${dd}`;
  return `${date}_${HH}-${MM}-${SS}`; // minus-tegn i tiden for Windows
};
