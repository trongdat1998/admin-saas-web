<style lang="less" scoped>
.info {
  max-width: 970px;
  padding-top: 60px;
  margin: 0 auto;
  p {
    font-size: 16px;
    padding-bottom: 20px;
  }
  .tr {
    text-align: right;
  }
  .background {
    background: url(./b.jpg) center no-repeat;
    background-size: 100% auto;
    padding: 60px 0;
    text-align: center;
    margin-bottom: 30px;
    position: relative;
    .head {
      position: relative;
      z-index: 5;
      color: #fff;
      font-size: 20px;
      span {
        margin: 0 15px;
      }
      a {
        color: #fff;
        text-decoration: underline;
      }
    }
    &:after {
      background: rgba(0, 0, 0, 0.5);
      content: " ";
      position: absolute;
      top: 0;
      left: 0;
      right: 0;
      bottom: 0;
    }
  }
}
.tip {
  font-size: 12px;
  margin-bottom: 20px;
}
</style>

<template lang="pug">
Main
  .info
    .background
      .head
        Avatar(style="color:#f56a00;background:#fff;") {{username.toLocaleUpperCase()[0]}}
        span.text {{username}}
        a(@click="logout") {{$lang("退出")}}
    Progress(:percent="percent" status="active" hide-info style="margin-bottom:30px")
    Timeline
      TimelineItem.line
        Row
          Col(span="8")
            p {{$lang("邮箱")}}
          Col(span="8")
            p {{username}}
          Col.tr(span="8")
            p
              span {{$lang("已绑定")}}
      TimelineItem.line
        Row
          Col(span="8")
            p {{$lang("手机")}}
          Col(span="8")
            p(v-if="userInfo.bindPhone") {{userInfo.phone}}
            p(v-else)  &nbsp;
          Col.tr(span="8")
            p
              span(v-if="userInfo.bindPhone") {{$lang("已绑定")}}
              a(v-else @click="mobile=true") {{$lang("未绑定")}}
      TimelineItem.line
        Row
          Col(span="8")
            p {{$lang("谷歌二次验证")}}
          Col(span="8")
            p &nbsp;
          Col.tr(span="8")
            p
              span(v-if="userInfo.bindGA") {{$lang("已绑定")}}
              a(v-else @click="ga=true") {{$lang("未绑定")}}
      TimelineItem
        Row
          Col(span="8")
            p {{$lang("登录密码")}}
          Col(span="8")
            p *************
          Col.tr(span="8")
            p
              a(@click="password=true") {{$lang("修改")}}
  Modal(v-model="ga" width="600" footer-hide)
    BindGa
  Modal(v-model="mobile" width="400" footer-hide :title="$lang('绑定手机')")
    BindMobile
  Modal(v-model="password" width="400" footer-hide :title="$lang('修改密码')")
    Password
  Modal(v-model="guide" width="400" footer-hide, :mask-closable="false" :title="$lang('安全管理')")
    Alert.tip(type="error") {{$lang("为了加强系统安全性，请先绑定手机或谷歌二次验证")}}
    Row(:gutter="20")
      Col(:span="12")
        Button(long type="success" @click="mobile=true") {{$lang('绑定手机')}}
      Col(:span="12")
        Button(long type="success" @click="ga=true") {{$lang('谷歌二次验证')}}
</template>
<script>
import { mapState } from "vuex";
import BindGa from "./bindga.vue";
import BindMobile from "./bindmobile.vue";
import Password from "./password.vue";
export default {
  data() {
    return {
      ga: false,
      mobile: false,
      password: false,
      guide: false
    };
  },
  watch:{
    userInfo(){
      if(!this.userInfo.bindPhone&&!this.userInfo.bindGA&&this.userInfo.isinit){
        this.guide = true
      }
    }
  },
  computed: {
    ...mapState(["userInfo"]),
    username() {
      return this.userInfo.username || "";
    },
    percent() {
      let c = 2;
      if (this.userInfo.bindPhone) {
        c++;
      }
      if (this.userInfo.bindGA) {
        c++;
      }
      return (c * 100) / 4;
    }
  },
  methods: {
    logout() {
      this.$axios.get("/api/v1/user/logout").then(() => location.reload());
    }
  },
  components: { BindGa, BindMobile, Password }
};
</script>
