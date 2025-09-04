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
  const url = convertFileSrc(path); // webview-safe URL
  const res = await fetch(url); // hent filen via asset protocol
  const buf = await res.arrayBuffer(); // ArrayBuffer til exifr
  try {
    return await exifr.parse(buf); // parse EXIF uden Node fs/zlib
  } catch {
    return null;
  }
}
