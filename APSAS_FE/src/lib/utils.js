import { clsx } from "clsx";
import { twMerge } from "tailwind-merge"
export const cx = (...xs) => xs.filter(Boolean).join(' ')

export function cn(...inputs) {
  return twMerge(clsx(inputs));
}
