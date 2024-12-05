export function notify(element: Element, message: string) {
  element.innerHTML = message;
}

export function bytesToMegabytes(bytes: number): string {
  let mo = (bytes / (1024 * 1024)).toFixed(1);
  return mo; // Convertir en mégaoctets
}

export function formatDate(dateString: string | Date) {
  const date = new Date(dateString);

  let year = date.getFullYear();
  let month = date.getMonth();
  let day = date.getDate();

  let hour = date.getHours();
  let minutes = date.getMinutes();
  return `${day}·${month}·${year} | ${hour}·${minutes}`;

  // Format the date using the Intl.DateTimeFormat object
}
