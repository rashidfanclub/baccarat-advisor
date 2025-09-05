let currentCurrency = "JPY";

function setCurrency(currencyCode) {
  currentCurrency = currencyCode;
  const currency = currencies[currencyCode];

  // 初期値にリセット
  funds = currency.initialFunds;
  currentBet = currency.initialBet;

  // 表示を更新
  document.getElementById("fundsAmount").textContent = currency.format(funds);
  document.getElementById("currentBetAmount").textContent = currency.format(currentBet);
  document.getElementById("currencyLabel").textContent = currency.name[lang];

  // 損失限度の再計算
  updateRiskManagement();
  updateChart();
}
