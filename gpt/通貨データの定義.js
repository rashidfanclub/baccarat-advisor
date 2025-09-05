const currencies = {
  JPY: {
    symbol: "¥",
    name: { ja: "日本円", en: "Japanese Yen", es: "Yen Japonés", zh: "日元", ko: "일본 엔", fr: "Yen Japonais" },
    initialFunds: 100000,
    initialBet: 500,
    step: 100,
    format: (value) => `¥${value.toLocaleString("ja-JP")}`
  },
  USD: {
    symbol: "$",
    name: { ja: "米ドル", en: "US Dollar", es: "Dólar Estadounidense", zh: "美元", ko: "미국 달러", fr: "Dollar Américain" },
    initialFunds: 1000,
    initialBet: 5,
    step: 1,
    format: (value) => `$${value.toLocaleString("en-US")}`
  },
  EUR: {
    symbol: "€",
    name: { ja: "ユーロ", en: "Euro", es: "Euro", zh: "欧元", ko: "유로", fr: "Euro" },
    initialFunds: 900,
    initialBet: 5,
    step: 1,
    format: (value) => `€${value.toLocaleString("de-DE")}`
  },
  KRW: {
    symbol: "₩",
    name: { ja: "韓国ウォン", en: "Korean Won", es: "Won Coreano", zh: "韩元", ko: "대한민국 원", fr: "Won Coréen" },
    initialFunds: 1200000,
    initialBet: 6000,
    step: 1000,
    format: (value) => `₩${value.toLocaleString("ko-KR")}`
  },
  CNY: {
    symbol: "¥",
    name: { ja: "人民元", en: "Chinese Yuan", es: "Yuan Chino", zh: "人民币", ko: "중국 위안", fr: "Yuan Chinois" },
    initialFunds: 7000,
    initialBet: 35,
    step: 1,
    format: (value) => `¥${value.toLocaleString("zh-CN")}`
  }
};
