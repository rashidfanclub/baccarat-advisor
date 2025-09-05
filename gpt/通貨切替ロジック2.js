let currentCurrency = "JPY";

function setCurrency(code) {
  currentCurrency = code;
  const c = currencies[code];

  // 初期資金とベット額をリセット
  funds = c.initialFunds;
  currentBet = c.initialBet;

  // UI更新
  document.getElementById("fundsAmount").textContent = c.format(funds);
  document.getElementById("currentBetAmount").textContent = c.format(currentBet);

  // 損失限度の再計算
  updateRiskManagement();
  updateChart();
}

// 設定適用時に反映
document.getElementById("applySettings").addEventListener("click", () => {
  const selectedCurrency = document.getElementById("currencySelect").value;
  setCurrency(selectedCurrency);
});
