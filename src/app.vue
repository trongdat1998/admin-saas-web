<template lang="pug">
div(id="main")
  router-view
</template>
<script>
import { mapActions } from "vuex";
export default {
  methods: {
    ...mapActions(["setHeight"])
  },
  mounted() {
    let _this = this;
    window.addEventListener("resize", function() {
      _this.setHeight();
    });
    _this.setHeight();
  }
};
</script>