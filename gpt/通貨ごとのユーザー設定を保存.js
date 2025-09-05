let userSettings = {
  JPY: { funds: 100000, bet: 500 },
  USD: { funds: 1000, bet: 5 },
  EUR: { funds: 900, bet: 5 },
  KRW: { funds: 1200000, bet: 6000 },
  CNY: { funds: 7000, bet: 35 }
};

// ページロード時にローカルストレージから復元
if (localStorage.getItem("userSettings")) {
  userSettings = JSON.parse(localStorage.getItem("userSettings"));
}
