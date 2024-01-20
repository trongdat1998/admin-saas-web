import Vue from "vue";
import Router from "vue-router";
import iView from "view-design";
Vue.use(Router);

const routes = [
  {
    path: "/login",
    component: () => import("./views/login/index.vue"),
  },
  {
    path: "/password/find",
    component: () => import("./views/password/find.vue"),
  },
  {
    path: "/password/init/:uid/:token",
    component: () => import("./views/password/init.vue"),
  },
  {
    path: "/",
    component: () => import("./views/index/index.vue"),
    children: [
      {
        path: "/",
        redirect: "/home",
      },
      {
        path: "/home",
        meta: {
          name: "首页",
        },
        component: () => import("./views/index/home.vue"),
      },
      {
        path: "/exchange",
        component: () => import("./views/index/template.vue"),
        meta: {
          name: "交易所管理",
        },
        children: [
          {
            path: "currency",
            meta: {
              name: "币种管理",
            },
            component: () => import("./views/exchange/currency.vue"),
          },
          {
            path: "coinPair",
            meta: {
              name: "币对管理",
            },
            component: () => import("./views/exchange/coinPair.vue"),
          },
          {
            path: "exchange",
            meta: {
              name: "交易所管理",
            },
            component: () => import("./views/exchange/exchange.vue"),
          },
          {
            path: "broker",
            meta: {
              name: "券商管理",
            },
            component: () => import("./views/exchange/broker.vue"),
          },
          {
            path: "account",
            meta: {
              name: "做市账号",
            },
            component: () => import("./views/exchange/account.vue"),
          },
          {
            path: "pool",
            meta: {
              name: "币池账户",
            },
            component: () => import("./views/exchange/pool.vue"),
          },
          {
            path: "customer",
            meta: {
              name: "客户管理",
            },
            component: () => import("./views/exchange/customer.vue"),
          },
          {
            path: "options",
            meta: {
              name: "功能配置",
            },
            component: () => import("./views/exchange/options/index.vue"),
            children: [
              {
                path: "/",
                redirect: "kyc",
              },
              {
                path: "kyc",
                component: () => import("./views/exchange/options/kyc.vue"),
              },
              {
                path: "push",
                component: () => import("./views/exchange/options/push.vue"),
              },
              {
                path: "staking",
                component: () => import("./views/exchange/options/staking.vue"),
              },
            ],
          },
        ],
      },

      {
        path: "/template",
        meta: {
          name: "模板管理",
        },
        component: () => import("./views/template/index.vue"),
      },
      {
        path: "/delivery_status",
        meta: {
          name: "消息查询",
        },
        component: () => import("./views/template/delivery_status.vue"),
      },
      // {
      //   path: "/asset",
      //   meta: {
      //     name: "资金账号",
      //   },
      //   component: () => import("./views/asset/index.vue"),
      // },
      {
        path: "/usercenter",
        meta: {
          name: "个人中心",
        },
        component: () => import("./views/usercenter/index.vue"),
      },
      {
        path: "/system/white",
        meta: {
          name: "白名单管理",
        },
        component: () => import("./views/system/white.vue"),
      },
      {
        path: "/verify/currency",
        meta: {
          name: "币种审核",
        },
        component: () => import("./views/verify/currency.vue"),
      },
      {
        path: "/verify/coinPair",
        meta: {
          name: "币对审核",
        },
        component: () => import("./views/verify/coinPair.vue"),
      },
      {
        path: "/verify/contract",
        meta: {
          name: "合约审核",
        },
        component: () => import("./views/verify/contract.vue"),
      },
      {
        path: "/verify/business",
        meta: {
          name: "业务审批",
        },
        component: () => import("./views/verify/business.vue"),
      },
      {
        path: "/system/user",
        meta: {
          name: "用户管理",
        },
        component: () => import("./views/system/user.vue"),
      },
      {
        path: "/system/group",
        meta: {
          name: "角色管理",
        },
        component: () => import("./views/system/group.vue"),
      },
      {
        path: "/system/white",
        meta: {
          name: "白名单管理",
        },
        component: () => import("./views/system/white.vue"),
      },
      {
        path: "/platform",
        meta: {
          name: "平台管理",
        },
        component: () => import("./views/index/template.vue"),
        children: [
          {
            path: "quote",
            meta: {
              name: "指数管理",
            },
            component: () => import("./views/platform/quote.vue"),
          },
          {
            path: "transfer",
            meta: {
              name: "转账管理",
            },
            component: () => import("./views/platform/transfer.vue"),
          },
          {
            path: "currency",
            meta: {
              name: "币种管理",
            },
            component: () => import("./views/platform/currency.vue"),
          },
          {
            path: "currency/:token",
            meta: {
              name: "币种上架交易所",
            },
            component: () => import("./views/platform/currencyDetail.vue"),
          },
          {
            path: "limit",
            meta: {
              name: "限价管理",
            },
            component: () => import("./views/platform/limit.vue"),
          },
          {
            path: "order",
            meta: {
              name: "订单查询",
            },
            component: () => import("./views/platform/order.vue"),
          },
          {
            path: "order/:type",
            meta: {
              name: "合约订单查询",
            },
            component: () => import("./views/platform/order.vue"),
          },
          {
            path: "data",
            meta: {
              name: "流水查询",
            },
            component: () => import("./views/platform/data.vue"),
          },
        ],
      },
      /*{
        path: "/technology",
        meta: {
          name: "技术管理",
        },
        component: () => import("./views/index/template.vue"),
        children: [
          {
            path: "whiteList",
            meta: {
              name: "转账白名单",
            },
            component: () => import("./views/technology/whiteList.vue"),
          },
          {
            path: "query",
            meta: {
              name: "数据查询",
            },
            component: () => import("./views/technology/db-query.vue"),
          },
        ],
      },*/

      {
        path: "/403",
        meta: {
          name: "无权限",
        },
        component: () => import("./views/4xx/403.vue"),
      },
      {
        path: "/*",
        meta: {
          name: "未找到",
        },
        component: () => import("./views/4xx/404.vue"),
      },
    ],
  },
];

const router = new Router({
  routes,
  mode: "history",
});

router.beforeEach((to, from, next) => {
  iView.LoadingBar.start();
  next();
});

router.afterEach((route) => {
  iView.LoadingBar.finish();
  window.scrollTo(0, 0);
  let arr = ["Saas console"];
  if (route.meta.name) {
    arr.unshift(route.meta.name);
  }
  document.setTitle(arr.join("-"));
});

export default router;
