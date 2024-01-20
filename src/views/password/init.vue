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
    &.error {
      height: 60px;
      color: #e53935;
    }
  }
}
</style>
<template lang="pug">
.page-login
  Dropdown.locale(trigger="click") 
    a(href="javascript:void(0)") {{lang[$i18n.locale]}}
      Icon(type="ios-arrow-down")
    DropdownMenu(slot="list")
      DropdownItem(@click.native="setLocale('zh-cn')") 中文
      DropdownItem(@click.native="setLocale('en-us')") English
  template(v-if="isInit")
    template(v-if="isOk")
      .loginBox(v-if="step==2" key="second")
        .logo.logo2
          img(src="../../assets/wlogo.png")
          .text {{$lang('设置密码')}}
        Form(ref="stepTwo", :model="formItem", :rules="stepTwoValidate")
          FormItem(:label="$lang('登录密码')" prop="password")
            Input(@on-enter="submit" v-model="formItem.password", type="password" :placeholder="$lang('请输入',$lang('登录密码'))")
          FormItem(:label="$lang('确认密码')" prop="confirmedPassword")
            Input(@on-enter="submit" v-model="formItem.confirmedPassword", type="password" :placeholder="$lang('请输入',$lang('确认密码'))")
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
    .loginBox(v-else)
      .logo
        img(src="../../assets/wlogo.png")
        .text {{$lang('验证失败')}}
      dl.success
        dt.error
          Icon(type="md-alert" size="40")
        dd {{msg}}
</template>
<script>
import md5 from "md5";
export default {
  data() {
    return {
      isInit: false,
      isOk: false,
      msg: "",
      step: 2,
      loading: false,
      formItem: {
        password: "",
        confirmedPassword: "",
        token: this.$route.params.token,
        adminUserId: this.$route.params.uid
      },
      stepTwoValidate: {
        password: [
          {
            validator: (rule, value, callback) => {
              if (value === "") {
                callback(new Error("请输入登录密码"));
              } else if (
                value.length < 8 ||
                value.length > 20 ||
                !/(?=.*[a-z])(?=.*[A-Z])(?=.*[0-9])/.test(value)
              ) {
                callback(new Error("密码8-20位字符，必须包含大小写字母和数字"));
              } else {
                if (this.formItem.confirmedPassword !== "") {
                  this.$refs.stepTwo.validateField("confirmedPassword");
                }
                callback();
              }
            },
            trigger: "blur"
          }
        ],
        confirmedPassword: [
          {
            validator: (rule, value, callback) => {
              if (value === "") {
                callback(new Error("请输入确认密码"));
              } else if (value != this.formItem.password) {
                callback(new Error("两次密码输入不一致"));
              } else {
                callback();
              }
            },
            trigger: "blur"
          }
        ]
      }
    };
  },
  computed: {
    lang() {
      return this.$store.state.lang;
    }
  },
  methods: {
    setLocale(lang) {
      this.$store.commit("setLocale", lang);
    },
    verify() {
      this.$axios
        .post("/api/v1/user/valid_token", this.formItem)
        .then(result => {
          this.isInit = true;
          if (result.code === 0) {
            this.isOk = true;
          } else {
            this.msg = result.msg;
          }
        });
    },
    submit() {
      this.$refs["stepTwo"].validate(valid => {
        if (valid) {
          this.loading = true;
          this.$axios
            .post("/api/v1/user/init_password", {
              password: md5(this.formItem.password),
              token: this.$route.params.token,
              adminUserId: this.$route.params.uid
            })
            .then(result => {
              this.loading = false;
              if (result.code === 0) {
                this.$Message.success(this.$lang("成功"));
                this.step = 3;
              }
            });
        }
      });
    }
  },
  created() {
    this.verify();
  }
};
</script>