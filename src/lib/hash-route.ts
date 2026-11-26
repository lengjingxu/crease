// 阅读器会把一次性访问凭证追加在入口地址的 hash 里（#rrpass=<token>）。
// 它不是页面路由：路由只认第一个非 rrpass 片段，缺省回落到给定页面。
export function routeFromHash(fallback: string): string {
  const segment = window.location.hash
    .slice(1)
    .split("&")
    .find((part) => part && !part.startsWith("rrpass="));
  return segment ?? fallback;
}
