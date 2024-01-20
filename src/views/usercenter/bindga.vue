<style lang="less" scoped>
.settings {
  padding: 30px;
  padding-bottom: 0;
  p {
    padding-left: 10px;
    padding-bottom: 10px;
  }
}
.text {
  font-size: 16px;
  strong {
    font-size: 20px;
    color: #000;
  }
}
.img img {
  height: 60px;
  margin-right: 20px;
}
</style>
<template lang="pug">
.settings
  Timeline
    TimelineItem
      p.text {{$lang("1.在手机上下载并安装“Google Authenticator(身份验证器)”")}}
      p.img
        a(href="https://itunes.apple.com/us/app/google-authenticator/id388497605" target="_blank")
          img(src="./apple.png")
        a(href="https://play.google.com/store/apps/details?id=com.google.android.apps.authenticator2" target="_blank")
          img(src="./google.png")
    TimelineItem
      p.text {{$lang("2.使用“Google Authenticator(身份验证器)”扫描下方二维码")}}
      div(style="width:100%;overflow:hidden")
        Row(type="flex" align="middle")
          Col(span="12")
            p
              img(:src="qrcode")
          Col(span="12")
            p.text
              strong {{data.secretKey}}
    TimelineItem
      p.text {{$lang("3.请将16位密钥记录在纸上，并保存在安全的地方。如遇手机丢失，你可以通过该密钥恢复你的谷歌验证")}}
    TimelineItem
      p.text {{$lang("4.下方输入Google验证码，完成认证")}}
      Form(ref="bindGaForm", style="padding-left:10px" size="large", :model="formItem", :rules="bindValidate")
        FormItem(:label="$lang('邮箱验证码')+ '(' + data.email + ')'" prop="verifyCode")
          Input(@on-enter="submit" v-model="formItem.verifyCode" type="text" :placeholder="$lang('验证码')", :maxlength="6")
            span(slot="append" v-if="time") {{time}}s
            a(slot="append" v-else @click="getCode") {{$lang("获取验证码")}}
        FormItem(:label="$lang('谷歌验证码')" prop="gaCode")
          Input(@on-enter="submit" v-model="formItem.gaCode" :placeholder="$lang('验证码')", :maxlength="6")
        Button(type="primary" @click="submit" long :loading="loading") {{$lang('确定')}}
</template>
<script>
export default {
  data() {
    return {
      time: 0,
      isInit: false,
      loading: false,
      data: {
        authUrl: "",
        qrcode: "",
        secretKey: "",
        email: ""
      },
      formItem: {
        gaCode: "",
        verifyCode: ""
      },
      bindValidate: {
        gaCode: [
          {
            validator: (rule, value, callback) => {
              if (value === "") {
                callback(new Error(this.$lang("验证码")));
              } else if (!/^\d{6}$/.test(value)) {
                callback(new Error(this.$lang("验证码是6位数字")));
              } else {
                callback();
              }
            },
            trigger: "blur"
          }
        ],
        verifyCode: [
          {
            validator: (rule, value, callback) => {
              if (value === "") {
                callback(new Error(this.$lang("验证码")));
              } else if (!/^\d{6}$/.test(value)) {
                callback(new Error(this.$lang("验证码是6位数字")));
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
  watch: {
    time() {
      if (this.time) {
        setTimeout(() => {
          this.time--;
        }, 1000);
      }
    }
  },
  methods: {
    loadData() {
      this.$axios.post("/api/v1/security/bind_ga/before", {}).then(result => {
        this.data = result.data;
        this.isInit = true;
      });
    },
    getCode() {
      !this.time &&
        this.$axios
          .post("/api/v1/security/bind_ga/captcha/email", {})
          .then(result => {
            if (result.code == 0) {
              this.time = 60;
            }
          });
    },
    submit() {
      this.$refs["bindGaForm"].validate(valid => {
        if (valid) {
          !this.loading &&
            this.$axios
              .post("/api/v1/security/bind_ga", this.formItem)
              .then(result => {
                this.loading = false;
                if (result.code == 0) {
                  location.reload();
                }
              });
          this.loading = true;
        }
      });
    }
  },
  computed: {
    qrcode() {
      return "data:image/png;base64," + this.data.qrcode;
    }
  },
  created() {
    this.loadData();
  }
};
</script>