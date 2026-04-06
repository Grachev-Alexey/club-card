import { type ClassValue, clsx } from "clsx"
import { twMerge } from "tailwind-merge"

export function cn(...inputs: ClassValue[]) {
  return twMerge(clsx(inputs))
}

export function getStatusColor(status: string) {
  switch (status) {
    case "Активна":
      return "bg-green-500/20 text-green-300 border-green-500/30";
    case "Скоро истечет":
      return "bg-orange-500/20 text-orange-300 border-orange-500/30";
    case "Истекла":
      return "bg-red-500/20 text-red-300 border-red-500/30";
    default:
      return "bg-gray-500/20 text-gray-300 border-gray-500/30";
  }
}

export function getStatusIcon(status: string) {
  switch (status) {
    case "Активна":
      return "fas fa-check-circle";
    case "Скоро истечет":
      return "fas fa-exclamation-triangle";
    case "Истекла":
      return "fas fa-times-circle";
    default:
      return "fas fa-question-circle";
  }
}
