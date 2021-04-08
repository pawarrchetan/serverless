export function expireDateTime() {
  const now = new Date();
  const expire = new Date(now.setMonth(now.getMonth() + 3)); // Expire in 3 months
  return epochDateTime(expire);
}

export function epochDateTime(date: Date) {
  return Math.floor(date.getTime() / 1000);
}

export function validateOwner(owner: string): boolean {
  const regex = new RegExp("^((?!-)[A-Za-z0-9-]{1,63}(?<!-)\\.)+[A-Za-z]{2,6}");
  return owner.match(regex) != null;
}

export function validateLongUrl(longUrl: string): boolean {
  const regex = new RegExp(
    "(https?://(?:www.|(?!www))[a-zA-Z0-9][a-zA-Z0-9-]+[a-zA-Z0-9].[^s]{2,}|www.[a-zA-Z0-9][a-zA-Z0-9-]+[a-zA-Z0-9].[^s]{2,}|https?://(?:www.|(?!www))[a-zA-Z0-9]+.[^s]{2,}|www.[a-zA-Z0-9]+.[^s]{2,})"
  );
  return longUrl.match(regex) != null;
}
