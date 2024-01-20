<template lang="pug">
.page-login
  Dropdown.locale(trigger="click")
    a(href="javascript:void(0)") {{lang[$i18n.locale]}}
      Icon(type="ios-arrow-down")
    DropdownMenu(slot="list")
      DropdownItem(@click.native="setLocale(key)" v-for="(item,key) in lang" :key="item") {{item}}

  .loginBox(v-if="step==1" key="first")
    .logo
      img(src="../../assets/wlogo.png")
      .text {{$lang('找回密码')}}
    Form(ref="stepOne", :model="formItem", :rules="stepOneValidate")
      FormItem(:label="$lang('账号')" prop="email")
        Input(@on-enter="verifyEmail" v-model="formItem.email" prefix="md-person" , :placeholder="$lang('请输入',$lang('账号'))")
      FormItem(:label="$lang('验证码')" prop="captcha")
        Input(@on-enter="verifyEmail" v-model="formItem.captcha" type="text" prefix="md-lock", :placeholder="$lang('请输入',$lang('验证码'))", :maxlength="6")
          span(slot="append" v-if="time") {{time}}s
          a(slot="append" v-else @click="getCode") {{$lang("获取验证码")}}
      FormItem
        Button(type="primary" @click="verifyEmail" long ghost icon="ios-fastforward", :loading="loading") {{$lang('下一步')}}
  .loginBox(v-if="step==2" key="second")
    .logo.logo2
      img(src="../../assets/wlogo.png")
      .text {{$lang('设置密码')}}
    Form(ref="stepTwo", :model="formItem", :rules="stepTwoValidate")
      FormItem(:label="$lang('新密码')" prop="password")
        Input(@on-enter="submit" v-model="formItem.password", type="password" :placeholder="$lang('请输入',$lang('新密码'))")
      FormItem(:label="$lang('确认密码')" prop="repassword")
        Input(@on-enter="submit" v-model="formItem.repassword", type="password" :placeholder="$lang('请输入',$lang('确认密码'))")
      FormItem
        Button(type="primary" @click="submit" long ghost :loading="loading") {{$lang('确定')}}

  .loginBox(v-if="step==3" key="three")
    .logo.logo2
      img(src="../../assets/wlogo.png")
      .text {{$lang('成功')}}
    dl.success
      dt
        Icon(type="md-checkmark-circle" size="40")
      dd
        Button(to="/login" type="primary" long ghost) {{$lang('登录')}}
    
  SenseRecaptchaComp(v-if="captchaType == captchaTypes.sense", ref="captchaRef", @success="post", @error="onCaptchaError")
  GoogleRecaptchaComp(v-if="captchaType == captchaTypes.google", ref="captchaRef", @success="post", @error="onCaptchaError")
 
</template>
<script>
import md5 from 'md5'
import v from '@/libs/validator'
import { senseId, captchaType, captchaTypes } from '@/libs/consts'
import SenseRecaptchaComp from '@/components/common/senseRecaptchaComp'
import GoogleRecaptchaComp from '@/components/common/googleRecaptchaComp'
export default {
  components: {
    SenseRecaptchaComp,
    GoogleRecaptchaComp,
  },
  data() {
    return {
      captchaType,
      captchaTypes,
      step: 1,
      loading: false,
      time: 0,
      formItem: {
        email: '',
        captcha: '',
        password: '',
        repassword: '',
        resetPwToken: '',
        captchaId: senseId,
        captchaResponse: '',
      },
      stepOneValidate: {
        email: [
          {
            validator: (rule, value, callback) => {
              if (value === '') {
                callback(new Error(this.$lang('请输入你的账号')))
              } else if (!v.isEmail(value)) {
                callback(new Error(this.$lang('账号是登录时的邮箱')))
              } else {
                callback()
              }
            },
            trigger: 'blur',
          },
        ],
        captcha: [
          {
            validator: (rule, value, callback) => {
              if (value === '') {
                callback(new Error(this.$lang('请输入你的验证码')))
              } else if (!/^\d{6}$/.test(value)) {
                callback(new Error(this.$lang('验证码是6位数字')))
              } else {
                callback()
              }
            },
            trigger: 'blur',
          },
        ],
      },
      stepTwoValidate: {
        password: [
          {
            validator: (rule, value, callback) => {
              if (value === '') {
                callback(new Error(this.$lang('请输入新密码')))
              } else if (
                value.length < 8 ||
                value.length > 20 ||
                !/(?=.*[a-z])(?=.*[A-Z])(?=.*[0-9])/.test(value)
              ) {
                callback(
                  new Error(
                    this.$lang('密码8-20位字符，必须包含大小写字母和数字')
                  )
                )
              } else {
                if (this.formItem.repassword !== '') {
                  this.$refs.stepTwo.validateField('repassword')
                }
                callback()
              }
            },
            trigger: 'blur',
          },
        ],
        repassword: [
          {
            validator: (rule, value, callback) => {
              if (value === '') {
                callback(new Error(this.$lang('请输入确认密码')))
              } else if (value != this.formItem.password) {
                callback(new Error(this.$lang('两次密码输入不一致')))
              } else {
                callback()
              }
            },
            trigger: 'blur',
          },
        ],
      },
    }
  },
  computed: {
    lang() {
      return this.$store.state.lang
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
    setLocale(lang) {
      this.$store.commit('setLocale', lang)
    },
    getCode() {
      if (!v.isEmail(this.formItem.email)) {
        return this.$refs.stepOne.validateField('email')
      }
      this.$refs.captchaRef.execute()
    },
    post(response) {
      const params = Object.assign({}, this.formItem, response)
      this.$axios
        .post('/api/v1/user/reset_password/email_captcha', params)
        .then((result) => {
          if (result.code == 0) {
            this.time = 60
          }
        })
    },
    verifyEmail() {
      this.$refs['stepOne'].validate((valid) => {
        if (valid) {
          this.loading = true
          this.$axios
            .post(
              '/api/v1/user/reset_password/verify_email_captcha',
              this.formItem
            )
            .then((result) => {
              this.loading = false
              if (result.code === 0) {
                this.formItem.resetPwToken = result.data
                this.step = 2
              }
            })
        }
      })
    },
    submit() {
      this.$refs['stepTwo'].validate((valid) => {
        if (valid) {
          this.loading = true
          this.$axios
            .post('/api/v1/user/reset_password', {
              email: this.formItem.email,
              resetPwToken: this.formItem.resetPwToken,
              password: md5(this.formItem.password),
            })
            .then((result) => {
              this.loading = false
              if (result.code === 0) {
                this.$Message.success(this.$lang('成功'))
                this.step = 3
              }
            })
        }
      })
    },
    onCaptchaError() {
      this.$refs.captchaRef.reset()
    },
  },
}
</script>
<style lang="less" scoped>
.logo {
  background: #e53935 !important;
  box-shadow: 0 12px 20px -10px rgba(244, 67, 54, 0.28),
    0 4px 20px 0px rgba(0, 0, 0, 0.12), 0 7px 8px -5px rgba(244, 67, 54, 0.2) !important;
}
.logo2 {
  background: linear-gradient(60deg, #66bb6a, #43a047) !important;
  box-shadow: 0 12px 20px -10px rgba(76, 175, 80, 0.28),
    0 4px 20px 0px rgba(0, 0, 0, 0.12), 0 7px 8px -5px rgba(76, 175, 80, 0.2) !important;
}
.success {
  text-align: center;
  dt {
    height: 80px;
    color: #66bb6a;
  }
}
</style>
