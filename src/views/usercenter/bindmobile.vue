<template lang="pug">
Form(ref="bindMobileForm", :model="bindForm", :rules="bindValidate")
  FormItem(:label="$lang('手机号')" prop="phone")
    Input(@on-enter="bindMobile" v-model="bindForm.phone" :placeholder="$lang('手机号')")
      Select(v-model="bindForm.nationalCode" slot="prepend" style="width:120px" filterable)
        Option(:value="item.nationalCode" :label="item.nationalCode" v-for="item in areaList" :key="item.nationalCode+item.countryName")
          <span>{{item.nationalCode}}</span>
          <span style="float:right;color:#ccc">{{item.countryName}}</span> 
  FormItem(:label="$lang('手机验证码')" prop="phoneCaptcha")
    Input(@on-enter="bindMobile" v-model="bindForm.phoneCaptcha" type="text" :placeholder="$lang('验证码')", :maxlength="6")
      span(slot="append" v-if="mobileTime") {{mobileTime}}s
      a(slot="append" v-else @click="getPhoneCode") {{$lang("获取验证码")}}
  FormItem(:label="$lang('邮箱验证码')" prop="verifyCode")
    Input(@on-enter="bindMobile" v-model="bindForm.verifyCode" type="text" :placeholder="$lang('验证码')", :maxlength="6")
      span(slot="append" v-if="emailTime") {{emailTime}}s
      a(slot="append" v-else @click="getEmailCode") {{$lang("获取验证码")}}
  div(style="padding:10px 0px")
    Button(type="primary" @click="bindMobile" long :loading="loading") {{$lang('确定')}}
</template>
<script>
import v from '@/libs/validator'
export default {
  data() {
    return {
      areaList: [],
      loading: false,
      mobileTime: 0,
      emailTime: 0,
      bindForm: {
        phone: '',
        verifyCode: '',
        phoneCaptcha: '',
        nationalCode: 65,
      },
      bindValidate: {
        phone: [
          {
            validator: (rule, value, callback) => {
              if (value === '') {
                callback(new Error(this.$lang('手机号')))
              } else if (!v.isMobile(value, this.bindForm.nationalCode)) {
                callback(new Error(this.$lang('手机号不正确')))
              } else {
                callback()
              }
            },
            trigger: 'blur',
          },
        ],
        phoneCaptcha: [
          {
            validator: (rule, value, callback) => {
              if (value === '') {
                callback(new Error(this.$lang('验证码')))
              } else if (!/^\d{6}$/.test(value)) {
                callback(new Error(this.$lang('验证码是6位数字')))
              } else {
                callback()
              }
            },
            trigger: 'blur',
          },
        ],
        verifyCode: [
          {
            validator: (rule, value, callback) => {
              if (value === '') {
                callback(new Error(this.$lang('验证码')))
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
    }
  },
  methods: {
    getPhoneCode() {
      if (!v.isMobile(this.bindForm.phone, this.bindForm.nationalCode)) {
        return this.$refs.bindMobileForm.validateField('phone')
      }
      !this.mobileTime &&
        this.$axios
          .post('/api/v1/security/bind_phone/captcha/phone', this.bindForm)
          .then((result) => {
            if (result.code == 0) {
              this.mobileTime = 60
            }
          })
    },
    getEmailCode() {
      !this.emailTime &&
        this.$axios
          .post('/api/v1/security/bind_phone/captcha/email', {})
          .then((result) => {
            if (result.code == 0) {
              this.emailTime = 60
            }
          })
    },
    bindMobile() {
      this.$refs['bindMobileForm'].validate((valid) => {
        if (valid) {
          !this.loading &&
            this.$axios
              .post('/api/v1/security/bind_phone', this.bindForm)
              .then((result) => {
                this.loading = false
                if (result.code === 0) {
                  location.reload()
                }
              })
          this.loading = true
        }
      })
    },
  },
  watch: {
    mobileTime() {
      if (this.mobileTime) {
        setTimeout(() => {
          this.mobileTime--
        }, 1000)
      }
    },
    emailTime() {
      if (this.emailTime) {
        setTimeout(() => {
          this.emailTime--
        }, 1000)
      }
    },
  },
  created() {
    this.$axios.get('/api/v1/country/list').then((result) => {
      result.data.sort(function(a, b) {
        return a.indexName > b.indexName ? 1 : -1
      })

      this.areaList = result.data
    })
  },
}
</script>
