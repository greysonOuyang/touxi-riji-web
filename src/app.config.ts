export default {
  pages: [
    "pages/health/index",
    "pages/statistics/index",
    "pages/profile/index",
    "pages/login/index",
    "pages/bloodPresure/input/index",
    "pages/pdPlan/input/index",
    "pages/pdPlan/planManage/index",
    "pages/pdPlan/record/index",
    "pages/profile/edit/index",
    "pages/pdPlan/historicalDataMore/index",
  ],
  window: {
    backgroundTextStyle: "light",
    navigationBarBackgroundColor: "#F8F9FA",
    navigationBarTitleText: "健康概览",
    navigationBarTextStyle: "black",
    navigationStyle: "default", // 添加这一行来使用自定义导航栏
  },

  tabBar: {
    list: [
      {
        pagePath: "pages/health/index",
        text: "首页",
        iconPath: "assets/icons/home_unselected.png",
        selectedIconPath: "assets/icons/home_selected copy.png",
      },
      // {
      //   pagePath: 'pages/record/index',
      //   text: '记录',
      //   iconPath: 'assets/icons/calendar.png',
      //   selectedIconPath: 'assets/icons/calendar_a.png'
      // },
      {
        pagePath: "pages/statistics/index",
        text: "统计",
        iconPath: "assets/icons/statics_unselected.png",
        selectedIconPath: "assets/icons/statics_selected.png",
      },
      {
        pagePath: "pages/profile/index",
        text: "个人",
        iconPath: "assets/icons/personal_unselected.png",
        selectedIconPath: "assets/icons/personal_selected.png",
      },
    ],
    color: "#999999",
    selectedColor: "3a82f7",
    backgroundColor: "#ffffff",
    borderStyle: "black",
  },
};
