// 极验行为验证
<template lang="pug">
  div
</template>
<script>
import { senseId } from '@/libs/consts.js'
export default {
  props: {
    type: {
      type: Number,
      default: 0,
      required: false,
    },
  },
  data() {
    return {
      senseId,
      senseInstance: null,
    }
  },
  computed: {},
  methods: {
    init() {
      const _this = this
      if (typeof window.initGeetest !== 'function') {
        const URL = `https://static.geetest.com/static/tools/gt.js?_t=${new Date().getTime()}`
        const scriptHeat = document.createElement('script')
        scriptHeat.type = 'text/javascript'
        scriptHeat.onload = () => {
          _this.initGeetest()
        }
        scriptHeat.src = URL
        const s = document.getElementsByTagName('script')[0]
        s.parentNode.insertBefore(scriptHeat, s)
      } else {
        this.initGeetest()
      }
    },
    initGeetest() {
      const _this = this
      this.$axios
        .post('/api/v1/basic/geev3/register', {
          captchaId: this.senseId,
        })
        .then((ret) => {
          window.initGeetest(
            {
              ...ret.data,
              product: 'bind',
              width: '300px',
            },
            (sense) => {
              _this.senseInstance = sense
              // 配置类型,默认3
              sense.onReady(() => {
                _this.enable = true
              })
              sense.onError((error) => {
                _this.$emit('error', error)
              })
              sense.onSuccess(() => {
                const geeResult = _this.senseInstance.getValidate()
                _this.$emit('success', {
                  captchaId: _this.senseId,
                  captchaResponse: geeResult.geetest_validate,
                  challenge: geeResult.geetest_challenge,
                })
              })
              _this.senseInstance = sense
            }
          )
        })
    },
    // 执行验证
    sense() {
      debugger
      this.senseInstance && this.senseInstance.verify()
    },
    execute() {
      this.sense()
    },
    // 重置验证
    reset() {
      this.senseInstance && this.senseInstance.reset()
    },
  },
  mounted() {
    this.init()
  },
}
</script>
