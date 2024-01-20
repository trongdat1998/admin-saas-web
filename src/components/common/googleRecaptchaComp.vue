// google行为验证
<template>
  <div class="recaptcha-wrapper">
    <vue-recaptcha
      badge="inline"
      :sitekey="siteKey"
      ref="recaptcha"
      @verify="onVerify"
      @expired="onExpired"
      @error="onError"
      :load-recaptcha-script="true"
      recaptcha-host="www.recaptcha.net"
      size="invisible"
    />
  </div>
</template>
<script>
import VueRecaptcha from 'vue-recaptcha'
import { siteKey } from '../../libs/consts'
export default {
  data: function() {
    return {
      siteKey,
    }
  },
  components: {
    'vue-recaptcha': VueRecaptcha,
  },
  methods: {
    execute: function() {
      this.$refs.recaptcha.execute()
    },
    onVerify: function(response) {
      this.$emit('success', {
        captchaId: this.siteKey,
        captchaResponse: response,
      })
    },
    onExpired: function() {
      this.$emit('error', 'expired')
    },
    onError: function(err) {
      this.$emit('error', err)
    },
    reset() {
      this.$refs.recaptcha.reset() // Direct call reset method
    },
  },
}
</script>
<style lang="less" scoped>
.recaptcha-wrapper {
  position: absolute;
  bottom: 0;
  right: 0;
  width: 256px;
  height: auto;
}
</style>
