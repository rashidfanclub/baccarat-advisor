function updateUI() {
  const c = currencies[currentCurrency];

  // 基本表示
  document.getElementById("fundsAmount").textContent = c.format(funds);
  document.getElementById("currentBetAmount").textContent = c.format(currentBet);

  // リスク関連
  document.getElementById("currentLoss").textContent = c.format(currentLoss);
  document.getElementById("lossLimitDisplay").textContent =
    `${c.format(lossLimit)} (${lossLimitPercent}%)`;

  // 履歴再描画
  refreshHistory();

  // チャート更新
  updateChart();
}
