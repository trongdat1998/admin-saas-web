<template lang="pug">
.v-side-wrap(:class="{'v-side-wrap-close':menuClose}")
  .v-side
    .logo
      img(:src="logo")
      p {{userInfo.orgName}}
    .menu
      ul
        li.user
          Tooltip(placement="right")
            a.master
              .block
                Icon(type="md-contact") {{userInfo.username?userInfo.username.toLocaleUpperCase()[0]:""}}
                span.text {{userInfo.username}}
            .v-menu-salver(slot="content")
              router-link.salver(to="/usercenter") {{$lang('个人中心')}}
              a.salver(@click="logout") {{$lang('退出登录')}}
        li(v-for="(item,index) in list" v-if="item.status")
          Tooltip(placement="right" :disabled="!menuClose" v-if="item.children")
            a.master(:to="item.link", :class="className(index)" @click.prevent='!menuClose && switchMenu(index)' :title="$lang(item.name)")
              .block
                Icon(:type="item.type")
                span.text {{$lang(item.name)}}
                b
            .v-menu-salver(slot="content")
              router-link(:to="_item.link" v-for="_item in item.children", :key="_item.id + _item.link", :title="$lang(_item.name)" v-if="_item.status" @click.native='switchMenu(index)') {{$lang(_item.name)}}
          router-link.master(v-else :to="item.link", :class="className(index)" @click.native='switchMenu(index)'  :title="$lang(item.name)")
            .block
              Icon(:type="item.type")
              span.text {{$lang(item.name)}}
              b
          div.sub-menu(:style="objStyle(item,index)" v-show="!menuClose")
            div(:ref="item.name" v-if="item.children")
              router-link.salver(:to="_item.link" v-for="_item in item.children", :key="_item.id + _item.link", :title="$lang(_item.name)" v-if="_item.status")
                span {{$lang(_item.name)[0]}}
                | {{$lang(_item.name)}}
</template>
<script>
import { mapState } from "vuex";
export default {
  props: {
    list: {
      type: Array,
      default() {
        return [];
      }
    }
  },
  data() {
    return {
      height: 0,
      currentIndex: 0
    };
  },
  methods: {
    className(index) {
      return {
        "master-open": index == this.currentIndex,
        "master-current": index == this.currentIndex
      };
    },
    objStyle(item, index) {
      if (index == this.currentIndex && this.$refs[item.name]) {
        return {
          height: `${this.$refs[item.name][0].offsetHeight}px`
        };
      } else {
        return {
          height: 0
        };
      }
    },
    switchMenu(index) {
      this.currentIndex = index;
    },
    logout() {
      this.$axios.get("/api/v1/user/logout").then(() => location.reload());
    }
  },
  computed: {
    ...mapState(["userInfo", "logo", "menuClose"])
  },
  watch: {
    menuClose() {
      if (!this.menuClose) {
        let back = this.currentIndex;
        this.currentIndex = 0;
        setTimeout(() => {
          this.currentIndex = back;
        }, 50);
      }
    },
    list() {
      this.list.forEach((el, index) => {
        if (el.children) {
          el.children.forEach(_el => {
            if (new RegExp("^" + _el.link).test(this.$route.path)) {
              setTimeout(() => {
                this.switchMenu(index);
              }, 200);
            }
          });
        }
      });
    }
  }
};
</script>