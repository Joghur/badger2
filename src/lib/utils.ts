import { clsx, type ClassValue } from "clsx";
import { twMerge } from "tailwind-merge";

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
