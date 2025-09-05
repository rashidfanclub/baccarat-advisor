const currencies = {
  JPY: { symbol: "¥", format: (v) => `¥${v.toLocaleString("ja-JP")}` },
  USD: { symbol: "$", format: (v) => `$${v.toLocaleString("en-US")}` },
  EUR: { symbol: "€", format: (v) => `€${v.toLocaleString("de-DE")}` },
  KRW: { symbol: "₩", format: (v) => `₩${v.toLocaleString("ko-KR")}` },
  CNY: { symbol: "¥", format: (v) => `¥${v.toLocaleString("zh-CN")}` }
};
