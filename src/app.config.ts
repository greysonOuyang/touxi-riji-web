export default {
  pages: [
    "pages/health/index",
    "pages/statistics/index",
    "pages/profile/index",
    "pages/login/index",
    "pages/BloodPressureInputPage/index",
    "pages/pdPlanInput/index",
    "pages/pdPlan/index",
  ],
  window: {
    backgroundTextStyle: "light",
    navigationBarBackgroundColor: "#FCFCFC",
    navigationBarTitleText: "健康概览",
    navigationBarTextStyle: "black",
  },

  tabBar: {
    list: [
      {
        pagePath: "pages/health/index",
        text: "首页",
        iconPath: "assets/icons/home.png",
        selectedIconPath: "assets/icons/home_selected.png",
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
        // iconPath: 'assets/icons/statistics.png',
        // selectedIconPath: 'assets/icons/statistics_selected.png'
        iconPath: "assets/icons/home.png",
        selectedIconPath: "assets/icons/home_selected.png",
      },
      {
        pagePath: "pages/profile/index",
        text: "个人",
        iconPath: "assets/icons/personal.png",
        selectedIconPath: "assets/icons/personal_a.png",
      },
    ],
    color: "#999999",
    selectedColor: "3a82f7",
    backgroundColor: "#ffffff",
    borderStyle: "black",
  },
};
