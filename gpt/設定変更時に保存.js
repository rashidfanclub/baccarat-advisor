document.getElementById("applySettings").addEventListener("click", () => {
  const selectedCurrency = document.getElementById("currencySelect").value;
  
  // 入力欄から値を取得（例：初期資金、ベット額）
  const newFunds = parseInt(document.getElementById("initialFundsInput").value, 10);
  const newBet   = parseInt(document.getElementById("initialBetInput").value, 10);

  // ユーザー設定を保存
  userSettings[selectedCurrency] = { funds: newFunds, bet: newBet };
  localStorage.setItem("userSettings", JSON.stringify(userSettings));

  setCurrency(selectedCurrency); // 表示更新
});
