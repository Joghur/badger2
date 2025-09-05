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
