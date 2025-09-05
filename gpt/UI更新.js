function updateUI() {
  const c = currencies[currentCurrency];
  
  document.getElementById("fundsAmount").textContent = c.format(funds);
  document.getElementById("currentBetAmount").textContent = c.format(currentBet);
  document.getElementById("currentLoss").textContent = c.format(currentLoss);
  document.getElementById("lossLimitDisplay").textContent = 
    `${c.format(lossLimit)} (${lossLimitPercent}%)`;

  refreshHistory();
  updateChart();
}
