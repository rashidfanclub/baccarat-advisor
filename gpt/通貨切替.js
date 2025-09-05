let currentCurrency = "JPY";

function setCurrency(code) {
  currentCurrency = code;
  updateUI(); // 過去データ含めすべて再描画
}
