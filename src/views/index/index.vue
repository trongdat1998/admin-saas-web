<template lang="pug">
.page-index
  MenuList(v-model='close', :list="menu")
  .page-index-right(:class="{'page-index-right-close':close}")
    router-view
</template>
<style lang="less">
@import "../../libs/mixin";
.page-index {
  min-width: 1040px;
  width: 100%;
  min-height: 100vh;
  position: relative;
  &-right {
    position: relative;
    padding: 24px;
    overflow: hidden;
    margin-left: 260px;
  }
}
</style>
<script>
import menu from "@/libs/menu.js";
import { mapActions } from "vuex";
export default {
  data() {
    return {
      close: localStorage.menuStatus === "true" || false,
      menu: []
    };
  },
  methods: {
    ...mapActions(["setUserName"]),
    watermark(str) {
      let canvas = document.createElement("canvas");
      canvas.width = 260;
      canvas.height = 120;
      let ctx = canvas.getContext("2d");
      ctx.textAlign = "left";
      ctx.textBaseline = "top";
      ctx.font = "14px Arial";
      ctx.globalAlpha = 0.1;
      ctx.fillStyle = "#666";
      ctx.rotate((15 * Math.PI) / 180);
      ctx.fillText(str, 10, 10);
      return canvas.toDataURL("image/png");
    }
  },
  created() {
    this.$axios.post("/api/v1/user/login_user_info").then(result => {
      result.data.isinit = true;
      result.data.watermark = this.watermark(result.data.username);
      if (result.code === 0) {
        this.setUserName(result.data);
        if (result.data.needBind) {
          this.$router.replace("/usercenter");
        }
      }
    });

    this.$axios.post("/api/v1/role_auth/user/auth_path/list").then(result => {
      let list = result.data;
      menu.forEach(el => {
        if (list.some(id => el.id === id)) {
          el.status = true;
          if (el.children) {
            el.children.forEach(_el => {
              if (list.some(id => _el.id === id)) {
                _el.status = true;
              }
            });
          }
        } else {
          el.status = false;
        }
      });
      this.menu = menu;
    });
  },
  watch: {
    close() {
      localStorage.menuStatus = this.close;
    }
  }
};
</script>
