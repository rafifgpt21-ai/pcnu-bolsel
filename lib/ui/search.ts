export function resetExploreSearch(query: string): string {
  const params = new URLSearchParams(query);
  params.delete("search");
  params.delete("category");
  const remaining = params.toString();
  return remaining ? `/explore?${remaining}` : "/explore";
}
