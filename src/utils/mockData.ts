interface ChartData {
  labels: string[];
  values: number[];
  average: number;
  max: number;
  min: number;
}

export function generateMockData(
  dataType: string,
  timeRange: string
): ChartData {
  const labels: string[] = [];
  const values: number[] = [];
  let days: number;

  switch (timeRange) {
    case "week":
      days = 7;
      break;
    case "month":
      days = 30;
      break;
    case "year":
      days = 365;
      break;
    default:
      days = 7;
  }

  for (let i = 0; i < days; i++) {
    const date = new Date();
    date.setDate(date.getDate() - i);
    labels.unshift(date.toISOString().split("T")[0]);

    let value: number;
    switch (dataType) {
      case "pd":
        value = Math.round(Math.random() * 1000 + 500); // 500-1500 ml
        break;
      case "water":
        value = Math.round(Math.random() * 1000 + 1000); // 1000-2000 ml
        break;
      case "urine":
        value = Math.round(Math.random() * 800 + 200); // 200-1000 ml
        break;
      case "bp":
        value = Math.round(Math.random() * 40 + 100); // 100-140 mmHg (收缩压)
        break;
      case "weight":
        value = Math.round((Math.random() * 10 + 60) * 10) / 10; // 60-70 kg
        break;
      default:
        value = Math.random() * 100;
    }
    values.unshift(value);
  }

  const average = Number(
    (values.reduce((a, b) => a + b, 0) / values.length).toFixed(2)
  );
  const max = Math.max(...values);
  const min = Math.min(...values);

  return { labels, values, average, max, min };
}
