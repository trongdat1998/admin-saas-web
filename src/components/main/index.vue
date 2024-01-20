<template lang="pug">
.v-main(:class="{'v-main-full':full}" :style="objectStyle()" v-if="userInfo.username")
  Row
    Col(span="22")
      Breadcrumb
        BreadcrumbItem Home
        BreadcrumbItem(v-for="(item,index) in matched" v-if="item" :key="item+index") {{$lang(item)}}
    Col(span="2" style="text-align:right")
      Dropdown.locale(trigger="click")
        Button(size="small") {{lang[$i18n.locale]}}
          Icon(type="ios-arrow-down")
        DropdownMenu(slot="list")
          DropdownItem(@click.native="setLocale(key)" v-for="(item,key) in lang" :key="key") {{item}}
  slot
</template>
<script>
import { mapState, mapActions } from "vuex";
export default {
  props: {
    full: {
      type: Boolean,
      default: false
    }
  },
  computed: {
     ...mapState(["lang","userInfo"])
  },
  methods: {
    ...mapActions(["setLocale"]),
    objectStyle(){
      let style = {}
      if(this.userInfo.watermark){
        style['background-image'] = `url(${this.userInfo.watermark})`
      }
      return style
    },
    open() {
      this.isopen = true;
      this.play();
      this.timestamp = 0;
    },
    close() {
      this.isopen = false;
    },
    play() {
      let t = Math.floor(new Date() / 60000);
      if (t != this.timestamp) {
        this.timestamp = t;
        document.getElementById("video").play();
      }
    },
    go(url) {
      this.$router.push(url);
    }
  },
  data() {
    return {
      title: "",
      matched:[],
      isopen: false,
      timestamp: 0,
      list: {
        kyc: 0,
        otc: 0,
        withdraw: 0
      }
    };
  },
  created() {
    this.title = this.$route.meta.name;
    this.matched = this.$route.matched.map(el=> el.meta.name)
  },
  beforeDestroy() {
    clearTimeout(this.timer);
  }
};
</script>
