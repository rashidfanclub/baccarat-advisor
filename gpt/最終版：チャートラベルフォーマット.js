function formatChartLabel(value) {
  const c = currencies[currentCurrency];

  if (["JPY", "KRW"].includes(currentCurrency)) {
    if (value >= 100000000) return (value / 100000000).toFixed(1) + "億";
    if (value >= 10000) return (value / 10000).toFixed(1) + "万";
  } else {
    if (value >= 1000000) return (value / 1000000).toFixed(1) + "M";
    if (value >= 1000) return (value / 1000).toFixed(1) + "k";
  }

  return c.format(value);
}
