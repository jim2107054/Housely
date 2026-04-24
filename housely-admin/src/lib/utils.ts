import { clsx, type ClassValue } from "clsx";
import { twMerge } from "tailwind-merge";
import { format, formatDistanceToNow } from "date-fns";

export function cn(...inputs: ClassValue[]) {
  return twMerge(clsx(inputs));
}

// Format BDT currency
export function formatCurrency(amount: number): string {
  return `৳ ${amount.toLocaleString("en-BD")}`;
}

export function formatDate(dateString: string | null | undefined): string {
  if (!dateString) return "—";
  const d = new Date(dateString);
  return isNaN(d.getTime()) ? "—" : format(d, "dd MMM yyyy");
}

export function formatDateTime(dateString: string | null | undefined): string {
  if (!dateString) return "—";
  const d = new Date(dateString);
  return isNaN(d.getTime()) ? "—" : format(d, "dd MMM yyyy, HH:mm");
}

export function formatRelative(dateString: string | null | undefined): string {
  if (!dateString) return "—";
  const d = new Date(dateString);
  return isNaN(d.getTime()) ? "—" : formatDistanceToNow(d, { addSuffix: true });
}

export function getInitials(name: string | null, username: string): string {
  const source = name || username;
  return source.split(" ").map(w => w[0]).join("").toUpperCase().slice(0, 2);
}
