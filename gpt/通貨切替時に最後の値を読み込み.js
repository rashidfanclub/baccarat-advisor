function setCurrency(code) {
  currentCurrency = code;
  const settings = userSettings[code];

  // ユーザーが保存した値を読み込む
  funds = settings.funds;
  currentBet = settings.bet;

  updateUI();
}
