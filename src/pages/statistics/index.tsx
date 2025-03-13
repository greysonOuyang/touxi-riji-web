import React, { useState, Suspense, lazy } from "react";
import { View, Text, ScrollView } from "@tarojs/components";
// 移除 taro-ui AtTabs 相关组件的引入
// import { AtTabs, AtTabsPane } from "taro-ui";
import Taro, { useDidShow } from "@tarojs/taro";
import "./index.scss";

const BPAnalysis = lazy(() => import("@/components/bloodPresure/analysis"));
const PdAnalysis = lazy(() => import("@/components/pdAnalysis"));
const WeightAnalysis = lazy(() => import("@/components/weightAnalysis"));
const UrineAnalysis = lazy(() => import("@/components/urineAnalysis"));
const WaterAnalysis = lazy(() => import("@/components/waterAnalysis"));

// {{ Assistant:  创建通用 Tab 内容组件 }}
interface TabContentProps {
  current: number;
  index: number;
  children: React.ReactNode;
}

const CommonTabContent: React.FC<TabContentProps> = ({ current, index, children }) => {
  return (
    // 移除 AtTabsPane，直接使用 View 包裹 tab 内容
    // <AtTabsPane current={current} index={index}>
      <View className="tab-content">
        {children}
      </View>
    // </AtTabsPane>
  );
};

const StatisticsReportPage: React.FC = () => {
  const [current, setCurrent] = useState(0);
  // 血压视图模式默认为日模式
  const [bpViewMode, setBpViewMode] = useState<"day" | "week" | "month">("day");
  // 体重视图模式默认为周模式
  const [weightViewMode, setWeightViewMode] = useState<"day" | "week" | "month">("week");
  // 喝水视图模式默认为日模式
  const [waterViewMode, setWaterViewMode] = useState<"day" | "week" | "month">("day");

  useDidShow(() => {
    // 检查本地存储中是否有当前tab的设置
    const storedTab = Taro.getStorageSync('statistics_current_tab');
    if (storedTab !== '' && !isNaN(Number(storedTab))) {
      const tabIndex = Number(storedTab);
      if (tabIndex >= 0 && tabIndex < 5) {
        setCurrent(tabIndex);
        // 使用后清除存储，避免下次自动跳转
        Taro.removeStorageSync('statistics_current_tab');
      }
    }
    
    // 检查是否有传入的tab参数（兼容旧的跳转方式）
    const params = Taro.getCurrentInstance().router?.params;
    if (params && params.tab) {
      const tabIndex = parseInt(params.tab);
      if (!isNaN(tabIndex) && tabIndex >= 0 && tabIndex < 5) {
        setCurrent(tabIndex);
      }
    }
    
    Taro.setNavigationBarTitle({
      title: "统计报告",
    });
    
    // 设置导航栏背景色，确保与页面背景一致
    Taro.setNavigationBarColor({
      frontColor: '#000000',
      backgroundColor: '#f5f7fa',
    });
  });

  const tabList = [
    { title: "腹透" },
    { title: "尿量" },
    { title: "喝水" },
    { title: "体重" },
    { title: "血压" },
  ];

  const handleClick = (value: number) => {
    setCurrent(value);
  };

  // 渲染其他统计模块的内容
  const renderOtherTabContent = (title: string) => {
    return (
      <View className="tab-content">
        <View className="statistics-placeholder-card">
          <Text className="section-title">{title}统计</Text>
          <View className="placeholder-content">
            <Text className="placeholder-text">这里是{title}统计的内容</Text>
          </View>
        </View>
      </View>
    );
  };

  return (
    <View className="statistics-report-page">
      <View className="fixed-tabs">
        {/*  使用 View 和 Text 组件自定义 Tab 导航栏 */}
        <View className="custom-tabs">
          <View className="at-tabs__header"> {/*  保持 at-tabs__header 类名，复用部分样式 */}
            {tabList.map((tab, index) => (
              <View
                key={index}
                className={`at-tabs__item ${current === index ? 'at-tabs__item--active' : ''}`} // 保持 at-tabs__item 和 at-tabs__item--active 类名，复用部分样式
                onClick={() => handleClick(index)}
              >
                <Text>{tab.title}</Text>
              </View>
            ))}
          </View>
        </View>
      </View>
      
      <ScrollView scrollY className="content-scroll">
        <View className="content-wrapper">
          <CommonTabContent current={current} index={0}>
            <Suspense fallback={<View>加载中...</View>}>
              <PdAnalysis />
            </Suspense>
          </CommonTabContent>

          <CommonTabContent current={current} index={1}>
            <Suspense fallback={<View>加载中...</View>}>
              <UrineAnalysis />
            </Suspense>
          </CommonTabContent>

          <CommonTabContent current={current} index={2}>
            <Suspense fallback={<View>加载中...</View>}>
              <WaterAnalysis initialViewMode={waterViewMode} />
            </Suspense>
          </CommonTabContent>

          <CommonTabContent current={current} index={3}>
            <Suspense fallback={<View>加载中...</View>}>
              <WeightAnalysis initialViewMode={weightViewMode} />
            </Suspense>
          </CommonTabContent>

          <CommonTabContent current={current} index={4}>
            <Suspense fallback={<View>加载中...</View>}>
              <BPAnalysis initialViewMode={bpViewMode} />
            </Suspense>
          </CommonTabContent>
        </View>
      </ScrollView>
    </View>
  );
};

export default StatisticsReportPage;
