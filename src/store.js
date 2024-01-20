import Vue from 'vue'
import Vuex from 'vuex'
import { cookie } from '@/libs/common'
Vue.use(Vuex)
let languages = []
;[
  {
    showName: 'English',
    language: 'en-us',
    icon: 'https://static.nucleex.com/static/locales/en-us.png',
    jsLoadUrl: '',
    currency: '$.USD',
  },
  {
    showName: '简体中文',
    language: 'zh-cn',
    icon: 'https://static.nucleex.com/static/locales/zh-cn.png',
    jsLoadUrl: ' ',
    currency: '￥.CNY',
  },
  {
    showName: '繁体中文',
    language: 'zh-hk',
    icon: 'https://static.nucleex.com/static/locales/zh-hk.png',
    jsLoadUrl: '',
    currency: 'HK$.HKD',
  },
  {
    showName: '한국어',
    language: 'ko-kr',
    icon: 'https://static.nucleex.com/static/locales/ko-kr.png',
    jsLoadUrl: '',
    currency: '₩.KRW',
  },
  {
    showName: '日本語',
    language: 'ja-jp',
    icon: 'https://static.nucleex.com/static/locales/ja-jp.png',
    jsLoadUrl: '',
    currency: '￥.JPY',
  },
  {
    showName: 'Tiếng Việt',
    language: 'vi-vn',
    icon: 'https://static.nucleex.com/static/locales/vi-vn.png',
    jsLoadUrl: '',
    currency: '₫.VND',
  },
  {
    showName: 'Русский',
    language: 'ru-ru',
    icon: 'https://static.nucleex.com/static/locales/ru-ru.png',
    jsLoadUrl: '',
    currency: '₽.RUB',
  },
  {
    showName: 'España',
    language: 'es-es',
    icon:
      'https://static.nucleex.com/bhop/image/xANoNAtAKpwXKh3-2lwWbxSg3LqL4BUPkRjN7hBBZ4k.png',
    jsLoadUrl: '',
    currency: '$.USD',
  },
  {
    showName: 'Türkçe',
    language: 'tr-tr',
    icon:
      'https://static.nucleex.com/bhop/image/J3QyJ6z7CM9PIi5MaW6R1uc9GJBkpdz8OYaD41BLeMA.png',
    jsLoadUrl: '',
    currency: '$.USD',
  },
  {
    showName: 'العربية',
    language: 'ar-sa',
    icon:
      'https://static.nucleex.com/bhop/image/SW3cI68E4Q9AU7gQwocvYGS9ZB1LCwOQfDzbPF7-8t4.png',
    jsLoadUrl: '',
    currency: '$.USD',
  },
  {
    showName: 'Indonesia',
    language: 'in-id',
    icon: '/public/static/in-id.png',
    jsLoadUrl: '',
    currency: '$.USD',
  },
  {
    showName: 'កម្ពុជា',
    language: 'km-kh',
    icon:
      'https://static.nucleex.com/banner/S4tzxjYy8WTkxn-FOGYHmzlnxJc9MMMtQz0P7Ety9JE.png',
    jsLoadUrl: '',
    currency: '$.USD',
  },
].forEach((el) => {
  languages[el.language] = el.showName
})
export default new Vuex.Store({
  state: {
    lang: {
      'zh-cn': '中文',
      'en-us': 'English',
    },
    languages: languages,
    height: 0,
    username: '',
    orgName: '',
    userInfo: {},
  },
  mutations: {
    setUserInfo(state, payload) {
      state.userInfo = payload
    },
    setHeight(state, height) {
      state.height = height
    },
  },
  actions: {
    setHeight({ commit }) {
      commit('setHeight', document.documentElement.clientHeight)
    },
    setUserName({ commit }, data) {
      commit('setUserInfo', data)
    },
    setLocale(state, lang) {
      let tmp = location.hostname.split('.')
      if (tmp.length > 3) {
        cookie('locale', lang, {
          path: '/',
          day: 3000,
        })
      } else {
        cookie('locale', lang, {
          path: '/',
          day: 3000,
          domain: location.hostname.replace(tmp.shift() + '.', ''),
        })
      }
      location.reload()
    },
  },
})
