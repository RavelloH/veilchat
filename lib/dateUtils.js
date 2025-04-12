/**
 * Simple date formatting utility to replace date-fns dependency
 */

// Format date to HH:mm format
export function formatTime(date) {
  if (!(date instanceof Date)) {
    date = new Date(date);
  }
  
  const hours = date.getHours().toString().padStart(2, '0');
  const minutes = date.getMinutes().toString().padStart(2, '0');
  
  return `${hours}:${minutes}`;
}

// Format date to yyyy-MM-dd format
export function formatDate(date) {
  if (!(date instanceof Date)) {
    date = new Date(date);
  }
  
  const year = date.getFullYear();
  const month = (date.getMonth() + 1).toString().padStart(2, '0');
  const day = date.getDate().toString().padStart(2, '0');
  
  return `${year}-${month}-${day}`;
}

// Format date to MM/dd format
export function formatShortDate(date) {
  if (!(date instanceof Date)) {
    date = new Date(date);
  }
  
  const month = (date.getMonth() + 1).toString().padStart(2, '0');
  const day = date.getDate().toString().padStart(2, '0');
  
  return `${month}/${day}`;
}

// Check if date is today
export function isToday(date) {
  if (!(date instanceof Date)) {
    date = new Date(date);
  }
  
  const today = new Date();
  return date.getDate() === today.getDate() &&
    date.getMonth() === today.getMonth() &&
    date.getFullYear() === today.getFullYear();
}
