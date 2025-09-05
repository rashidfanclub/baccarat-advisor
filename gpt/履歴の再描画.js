function refreshHistory() {
  const c = currencies[currentCurrency];
  const container = document.getElementById("historyContainer");
  container.innerHTML = "";

  if (history.length === 0) {
    container.innerHTML = `<div class="history-empty">${translations[lang].noHistoryYet}</div>`;
    return;
  }

  history.forEach(item => {
    const div = document.createElement("div");
    div.className = "history-item";
    div.innerHTML = `
      <span>${item.round} : ${item.winner}</span>
      <span>${c.format(item.funds)}</span>
    `;
    container.appendChild(div);
  });
}
