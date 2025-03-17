export interface BaseChartConfig {
  categories?: string[];
  series: {
    name: string;
    data: number[];
    color?: string;
    type?: string;
    pointShape?: string;
    pointSize?: number;
    lineWidth?: number;
    format?: (val: number) => string;
  }[];
  width: number;
  height: number;
  animation?: boolean;
  background?: string;
  padding?: number[];
  enableScroll?: boolean;
  dataLabel?: boolean;
  legend?: {
    show?: boolean;
    position?: 'top' | 'bottom' | 'left' | 'right';
    float?: 'left' | 'right' | 'center';
    padding?: number;
    margin?: number;
    backgroundColor?: string;
    fontSize?: number;
    lineHeight?: number;
    itemGap?: number;
    itemWidth?: number;
    itemHeight?: number;
    formatter?: (name: string) => string;
  };
  xAxis?: {
    labelCount?: number;
    scrollShow?: boolean;
    itemCount?: number;
    scrollAlign?: 'left' | 'right' | 'center';
    formatter?: (item: string) => string;
    calibration?: boolean;
    marginLeft?: number;
  };
  yAxis?: {
    data: {
      min?: number;
      max?: number;
      format?: (val: number) => string;
      title?: string;
      titleFontColor?: string;
      titleFontSize?: number;
      titleOffsetY?: number;
      titleOffsetX?: number;
      splitNumber?: number;
      showTitle?: boolean;
    }[];
  };
  extra?: {
    line?: {
      type?: 'straight' | 'curve' | 'dash';
      width?: number;
      activeType?: string;
      linearType?: string;
      activeLine?: boolean;
      activeLineWidth?: number;
      activeLineColor?: string;
      activeAreaOpacity?: number;
      point?: {
        size?: number;
        activeSize?: number;
        activeColor?: string;
        activeBorderWidth?: number;
        borderWidth?: number;
        borderColor?: string;
        fillColor?: string;
        strokeWidth?: number;
      };
    };
    pie?: {
      activeRadius?: number;
      offsetAngle?: number;
      labelWidth?: number;
      border?: boolean;
      borderWidth?: number;
      borderColor?: string;
      linearType?: 'custom';
      customColor?: string[];
      ringWidth?: number;
      centerColor?: string;
      radius?: number;
      pieChartLinePadding?: number;
      activeOpacity?: number;
      borderOpacity?: number;
      labelAlign?: 'center' | 'left' | 'right';
      labelFontSize?: number;
      labelFontColor?: string;
      format?: (val: number, series: any, opts: any) => string;
    };
    tooltip?: {
      showBox?: boolean;
      showArrow?: boolean;
      showCategory?: boolean;
      borderWidth?: number;
      borderRadius?: number;
      borderColor?: string;
      borderOpacity?: number;
      bgColor?: string;
      bgOpacity?: number;
      gridType?: 'dash';
      dashLength?: number;
      gridColor?: string;
      fontColor?: string;
      fontSize?: number;
      lineHeight?: number;
      padding?: number;
      horizentalLine?: boolean;
      xAxisLabel?: boolean;
      yAxisLabel?: boolean;
      labelBgColor?: string;
      labelBgOpacity?: number;
      labelFontColor?: string;
    };
    markLine?: {
      type?: 'dash';
      dashLength?: number;
      data?: {
        value: number;
        lineColor: string;
        showLabel?: boolean;
        labelText?: string;
        labelPosition?: 'left' | 'right' | 'top' | 'bottom';
        labelAlign?: 'top' | 'bottom' | 'left' | 'right';
        labelOffsetX?: number;
        labelOffsetY?: number;
        labelFontSize?: number;
        labelBgColor?: string;
        labelBgOpacity?: number;
        labelFontColor?: string;
      }[];
    };
  };
  context?: Taro.CanvasContext;
} 