function updateChart() {
  const c = currencies[currentCurrency];
  
  if (!fundsChart) {
    const ctx = document.getElementById("fundsChart").getContext("2d");
    fundsChart = new Chart(ctx, {
      type: "line",
      data: {
        labels: chartLabels,   // ラウンド番号など
        datasets: [{
          label: translations[lang].fundsProgress,
          data: chartData,     // 数値の配列
          borderColor: "#3b82f6",
          backgroundColor: "rgba(59, 130, 246, 0.2)",
          fill: true,
          tension: 0.3
        }]
      },
      options: {
        responsive: true,
        scales: {
          y: {
            ticks: {
              callback: function(value) {
                return formatChartLabel(value);
              }
            }
          }
        }
      }
    });
  } else {
    fundsChart.data.labels = chartLabels;
    fundsChart.data.datasets[0].data = chartData;
    fundsChart.update();
  }
}
