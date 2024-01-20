export default [
  {
    id: "1",
    name: "首页",
    type: "md-home",
    link: "/home",
  },
  {
    id: "2",
    name: "交易所管理",
    type: "md-analytics",
    link: "/exchange",
    children: [
      {
        id: "7",
        name: "交易所",
        link: "/exchange/exchange",
      },
      {
        id: "8",
        name: "币种管理",
        link: "/exchange/currency",
      },
      {
        id: "9",
        name: "币对管理",
        link: "/exchange/coinPair",
      },
      {
        id: "301",
        name: "券商管理",
        link: "/exchange/broker",
      },
      {
        id: "302",
        name: "做市账号",
        link: "/exchange/account",
      },
      {
        id: "201",
        name: "币池账户",
        link: "/exchange/pool",
      },
      {
        id: "302",
        name: "功能配置",
        link: "/exchange/options",
      },
      {
        id: "202",
        name: "客户管理",
        link: "/exchange/customer",
      },
    ],
  },
  {
    id: "5",
    name: "模板管理",
    type: "md-grid",
    link: "/template",
  },
  {
    id: "13",
    name: "消息查询",
    type: "md-mail",
    link: "/delivery_status",
  },
  // {
  //   id: "6",
  //   name: "资金账号",
  //   type: "logo-bitcoin",
  //   link: "/asset",
  // },
  {
    id: "14",
    name: "审核管理",
    type: "ios-book",
    link: null,
    children: [
      {
        id: "15",
        name: "币种审核",
        link: "/verify/currency",
      },
      {
        id: "16",
        name: "币对审核",
        link: "/verify/coinPair",
      },
      {
        id: "1401",
        name: "合约审核",
        link: "/verify/contract",
      },
      {
        id: "1402",
        name: "业务审批",
        link: "/verify/business",
      },
    ],
  },
  {
    id: "18",
    name: "平台管理",
    type: "ios-pulse",
    link: null,
    children: [
      {
        id: "19",
        name: "指数管理",
        link: "/platform/quote",
      },
      {
        id: "1801",
        name: "币种管理",
        link: "/platform/currency",
      },
      {
        id: "1802",
        name: "限价管理",
        link: "/platform/limit",
      },
      {
        id: "1805",
        name: "转账管理",
        link: "/platform/transfer",
      },
      {
        id: "1806",
        name: "流水查询",
        link: "/platform/data",
      },
      {
        id: "1807",
        name: "合约订单查询",
        link: "/platform/order",
      },
    ],
  },
  {
    id: "10",
    name: "权限管理",
    type: "logo-snapchat",
    link: null,
    children: [
      {
        id: "11",
        name: "用户管理",
        link: "/system/user",
      },
      {
        id: "12",
        name: "角色管理",
        link: "/system/group",
      },
      {
        id: "17",
        name: "安全管理",
        link: "/system/white",
      },
    ],
  },
  /*{
    id: "20",
    name: "技术管理",
    type: "ios-key",
    link: null,
    children: [
      {
        id: "2001",
        name: "转账白名单",
        link: "/technology/whiteList",
      },
      {
        id: "2002",
        name: "数据库查询",
        link: "/technology/query",
      },
    ],
  },*/
];
