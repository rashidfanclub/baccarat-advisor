function updateSettingsUI() {
  const settings = userSettings[currentCurrency];
  document.getElementById("initialFundsInput").value = settings.funds;
  document.getElementById("initialBetInput").value   = settings.bet;
}
