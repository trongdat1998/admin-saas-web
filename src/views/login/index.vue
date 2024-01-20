<style lang="less">
.vertical-center-modal {
  display: flex;
  align-items: center;
  justify-content: center;

  .ivu-modal {
    top: 0;
  }
}
</style>

<template lang="pug">
.page-login
  Dropdown.locale(trigger="click")
    a(href="javascript:void(0)") {{lang[$i18n.locale]}}
      Icon(type="ios-arrow-down")
    DropdownMenu(slot="list")
      DropdownItem(@click.native="setLocale(key)" v-for="(item,key) in lang" :key="key") {{item}}
  .loginBox
    .logo
      img(src="../../assets/wlogo.png")
      .text {{$lang('欢迎登录')}}
      p {{$lang('SAAS管理平台')}}
    Form(ref="formValidate", :model="formItem", :rules="ruleValidate")
      FormItem(:label="$lang('账号')" prop="username")
        Input(@on-enter="submit" v-model="formItem.username" prefix="md-person" , :placeholder="$lang('账号')")
      FormItem(:label="$lang('密码')" prop="password")
        Input(@on-enter="submit" v-model="formItem.password" type="password" prefix="md-lock", :placeholder="$lang('密码')")
      FormItem
        Button(type="primary" @click="submit" long ghost icon="md-send", :loading="loading") {{$lang('登录')}}
    a(href="/password/find")  {{$lang('忘记密码')}} ？
  SenseRecaptchaComp(v-if="captchaType == captchaTypes.sense", ref="captchaRef", @success="post", @error="onCaptchaError")
  GoogleRecaptchaComp(v-if="captchaType == captchaTypes.google", ref="captchaRef", @success="post", @error="onCaptchaError")
  Modal(v-model="gaWinStatus", :title="$lang(isMobile ? '手机验证码' :'谷歌验证码')" class-name="vertical-center-modal", :mask-closable="false")
    Alert(type="error" v-show="error") {{$lang("验证码不正确")}}
    Input(v-model='advFormItem.verifyCode', :maxlength="6" @on-keyup="keyup" :autofocus="gaWinStatus" v-if="isMobile")
      div(slot="append")
        span(v-if="time") {{time}}s
        a(v-else @click="getMoileCode") {{$lang("获取验证码")}}
    div(v-else)
      Input(v-model='advFormItem.verifyCode', :maxlength="6" @on-keyup="keyup" :autofocus="gaWinStatus")
    template(slot="footer")
      Button(type="primary" long @click="advPost", :loading="loading") {{$lang('确定')}}
</template>
<script>
import md5 from 'md5'
import { senseId, captchaType, captchaTypes } from '@/libs/consts'
import { mapState, mapActions } from 'vuex'
import SenseRecaptchaComp from '@/components/common/senseRecaptchaComp'
import GoogleRecaptchaComp from '@/components/common/googleRecaptchaComp'
export default {
  components: {
    GoogleRecaptchaComp,
    SenseRecaptchaComp,
  },
  data() {
    return {
      captchaType,
      captchaTypes,
      gaWinStatus: false,
      loading: false,
      error: false,
      time: 0,
      formItem: {
        username: '',
        password: '',
        captchaId: senseId,
        captchaResponse: '',
      },
      advFormItem: {
        requestId: '',
        authType: 1,
        verifyCode: '',
      },
      ruleValidate: {
        username: [
          {
            validator: (rule, value, callback) => {
              if (value === '') {
                callback(new Error(this.$lang('账号')))
              } else if (
                !/^[a-zA-Z0-9.!#$%&'*+\/=?^_`{|}~-]+@[a-zA-Z0-9](?:[a-zA-Z0-9-]{0,61}[a-zA-Z0-9])?(?:\.[a-zA-Z0-9](?:[a-zA-Z0-9-]{0,61}[a-zA-Z0-9])?)*$/.test(
                  value
                )
              ) {
                callback(new Error(this.$lang('账号不正确')))
              }
              callback()
            },
            trigger: 'blur',
          },
        ],
        password: [
          {
            validator: (rule, value, callback) => {
              if (value === '') {
                callback(new Error(this.$lang('密码')))
              }
              callback()
            },
            trigger: 'blur',
          },
        ],
      },
    }
  },
  computed: {
    ...mapState(['lang']),
    isMobile() {
      return this.advFormItem.authType === 2
    },
  },
  watch: {
    time() {
      if (this.time) {
        setTimeout(() => {
          this.time--
        }, 1000)
      }
    },
  },
  methods: {
    ...mapActions(['setLocale']),
    getMoileCode() {
      !this.time &&
        this.$axios
          .post('/api/v1/user/send_sms_verify_code', this.advFormItem)
          .then((result) => {
            if (result.code == 0) {
              this.time = 60
            }
          })
    },
    submit() {
      this.$refs['formValidate'].validate((valid) => {
        if (valid) {
          this.$refs.captchaRef.execute()
        }
      })
    },
    post(response) {
      this.loading = true
      let data = Object.assign({}, this.formItem, response)
      data.password = md5(this.formItem.password)
      this.$axios.post('/api/v1/user/login', data).then((result) => {
        this.loading = false
        if (result.code === 0) {
          if (result.data.bindGA || result.data.bindPhone) {
            this.gaWinStatus = true
            this.advFormItem.verifyCode = ''
            result.data.authType = result.data.bindGA ? 1 : 2
            Object.assign(this.advFormItem, result.data)

            if (this.advFormItem.authType === 2) {
              this.getMoileCode()
            }
          } else {
            this.next()
          }
        }
      })
    },
    next() {
      let redirectUrl = sessionStorage.redirectUrl
      if (redirectUrl) {
        sessionStorage.removeItem('redirectUrl')
      } else {
        redirectUrl = '/'
      }
      location.href = redirectUrl
    },
    advPost() {
      this.loading = true
      if (/^\d{6}$/.test(this.advFormItem.verifyCode)) {
        this.$axios
          .post('/api/v1/user/authorize_advance', this.advFormItem)
          .then((result) => {
            this.loading = false
            if (result.code === 0) {
              this.next()
            }
          })
      } else {
        this.error = true
      }
    },
    keyup() {
      this.error = false
      this.advFormItem.verifyCode = this.advFormItem.verifyCode.replace(
        /\D/g,
        ''
      )
      if (this.advFormItem.verifyCode.length == 6) {
        this.advPost()
      }
    },
    onCaptchaError() {
      this.$refs.captchaRef.reset()
    },
  },
}
</script>
