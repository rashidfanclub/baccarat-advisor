const currencies = {
  JPY: {
    symbol: "¥",
    format: (value) => `¥${value.toLocaleString("ja-JP")}`
  },
  USD: {
    symbol: "$",
    format: (value) => `$${value.toLocaleString("en-US")}`
  },
  EUR: {
    symbol: "€",
    format: (value) => `€${value.toLocaleString("de-DE")}`
  },
  KRW: {
    symbol: "₩",
    format: (value) => `₩${value.toLocaleString("ko-KR")}`
  },
  CNY: {
    symbol: "¥",
    format: (value) => `¥${value.toLocaleString("zh-CN")}`
  }
};
