export interface BaseChartConfig {
  animation: boolean;
  background: string;
  padding: number[];
  enableScroll: boolean;
  dataLabel: boolean;
  legend: {
    show: boolean;
    position: string;
    float: string;
    padding: number;
    margin: number;
    backgroundColor: string;
    fontSize: number;
    lineHeight: number;
    itemGap: number;
    itemWidth: number;
    itemHeight: number;
  };
  xAxis: {
    labelCount: number;
    scrollShow: boolean;
    itemCount: number;
    scrollAlign: string;
    calibration: boolean;
    marginLeft: number;
    formatter: (item: string) => string;
  };
  yAxis: {
    data: {
      min: number;
      splitNumber: number;
      showTitle: boolean;
      format: (val: number) => string;
    }[];
  };
  extra: {
    line: {
      type: string;
      width: number;
      activeType: string;
      linearType: string;
      activeLine: boolean;
      activeLineWidth: number;
      activeLineColor: string;
      activeAreaOpacity: number;
      point: {
        size: number;
        activeSize: number;
        activeColor: string;
        activeBorderWidth: number;
        borderWidth: number;
        borderColor: string;
        fillColor: string;
        strokeWidth: number;
      };
    };
    tooltip: {
      showBox: boolean;
      showArrow: boolean;
      showCategory: boolean;
      borderWidth: number;
      borderRadius: number;
      borderColor: string;
      borderOpacity: number;
      bgColor: string;
      bgOpacity: number;
      gridType: string;
      dashLength: number;
      gridColor: string;
      fontColor: string;
      fontSize: number;
      lineHeight: number;
      padding: number;
      horizentalLine: boolean;
      xAxisLabel: boolean;
      yAxisLabel: boolean;
      labelBgColor: string;
      labelBgOpacity: number;
      labelFontColor: string;
    };
  };
  categories: string[];
  series: { name: string; data: number[]; color?: string; type?: string; pointShape?: string; pointSize?: number; lineWidth?: number; format?: (val: number) => string }[];
  width: number;
  height: number;
  context: Taro.CanvasContext;
}