import App from "./app.vue";
import components from "./components";
import router from "./router";
import Vue from "vue";
import VueI18n from "vue-i18n";
import iView from "view-design";
import store from "./store";
import {
  lang,
  cookie
} from "./libs/common";

import en from "view-design/dist/locale/en-US";
import zh from "view-design/dist/locale/zh-CN";
import "./libs/common.less";

import axios from "axios";

Vue.use(VueI18n);
Vue.use(iView, {
  transfer: true
});
Vue.locale = () => {};

const i18n = new VueI18n({
  silentTranslationWarn: true,
  locale: lang(), // 语言标识
  //this.$i18n.locale // 通过切换locale的值来实现语言切换
  messages: {
    "zh-cn": Object.assign(require("./locale/zh"), zh), // 中文语言包
    "en-us": Object.assign(require("./locale/en"), en) // 英文语言包
  }
});

Object.keys(components).forEach(key => {
  Vue.component(key, components[key]);
});

window.newDate = str => {
  return new Date(Number(str))
}

Object.defineProperty(Vue.prototype, "newDate", {
  value(str) {
      return window.newDate(str);
  }
});


document.setTitle = function (title) {
  document.title = title;
};

// 添加响应拦截器
axios.interceptors.response.use(function (response) {
  let cost = new Date().getTime() - response.config.timestamp;
  if (!/\/analyze/.test(response.config.url)) {
    let obj = {
      type: 'api_call',
      cost: cost,
      request_url: response.config.url,
      http_code: response.status
    }
    if (response.data && response.data.msg) {
      obj.error_code = response.data.code
      obj.error_message = response.data.msg
    }
  }

  if (response.data.code === 5 || response.data.code === 13) {
    if (response.data.code === 13) {
      alert(response.data.msg);
    }
    if (!/\/login/.test(location.href)) {
      sessionStorage.setItem("redirectUrl", location.href);
      location.href = "/login";
    }
  } else if (response.data.code >= 100000) {
    //大于100000不展示报错信息
  } else if (response.data.code === 40002) {
    vm.$Message.error(response.data.msg);
  } else if (response.data.code === 40003) {
    location.href = "/usercenter";
  } else {
    if (response.data.code !== 0) {
      if (response.data.code === 2) {
        response.data.data.forEach(el => {
          vm.$Message.error(el.field + ":" + el.message);
        });
      } else {
        vm.$Message.error(response.data.msg);
      }
    }
  }
  return response.data;
}, function () {
  var e = document.getElementById("broker-loading");
  e && (e.className += " error")
});

axios.defaults.transformRequest = [
  function (data) {
    return JSON.stringify(data);
  }
];
axios.defaults.responseType = "json";
axios.defaults.headers["Accept-Language"] = lang()
axios.defaults.headers.post["Content-Type"] = "application/json;charset=UTF-8";
axios.interceptors.request.use(config => {
  let c_token = cookie("c_token");
  if (c_token) {
    config.url = [config.url, ["c_token", c_token].join("=")].join(config.url.indexOf("?") > -1 ? "&" : "?");
  }
  config.timestamp = new Date().getTime()
  return config;
});


Object.defineProperty(Vue.prototype, "$lang", {
  value(name, text) {
    let t = this.$t(`default['${name}']`, {
      text
    });
    if (/default/.test(t)) {
      return name
    } else {
      return t
    }
  }
});

Vue.prototype.$axios = axios;

let vm = new Vue({
  el: "#app",
  router,
  i18n,
  store,
  render: h => h(App)
});

// 放在axios下面
