let currentCurrency = "JPY";

function setCurrency(code) {
  currentCurrency = code;
  updateUI();
}

// 表示更新
function updateUI() {
  const c = currencies[currentCurrency];

  // 資金表示
  document.getElementById("fundsAmount").textContent = c.format(funds);
  document.getElementById("currentBetAmount").textContent = c.format(currentBet);

  // 損失・限度額表示
  document.getElementById("currentLoss").textContent = c.format(currentLoss);
  document.getElementById("lossLimitDisplay").textContent =
    `${c.format(lossLimit)} (${lossLimitPercent}%)`;

  // 履歴更新
  refreshHistory();

  // チャート更新
  updateChart();
}

// 設定適用時
document.getElementById("applySettings").addEventListener("click", () => {
  const selectedCurrency = document.getElementById("currencySelect").value;
  setCurrency(selectedCurrency);
});
