<template lang="pug">
a.v-user
  template(v-if="showSlot")
    slot
  template(v-else) {{uid}}
</template>
<script>
export default {
  data(){
    return{
      showSlot: true
    }
  },
  props: {
    uid: {
      type: [String,Number],
      default: ""
    }
  },mounted() {
    this.showSlot = this.$slots.default !== undefined;
  }
};
</script>