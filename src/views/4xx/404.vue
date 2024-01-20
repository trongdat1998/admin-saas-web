<style lang="less" scoped>
.wrapper {
  display: flex;
  align-items: center;
  height: calc(100vh - 150px);
}
.background {
  width: 100%;
  padding: 200px 0;
  font-size: 30px;
  text-align: center;
  position: relative;
  .text {
    position: relative;
    z-index: 2;
  }
}
</style>

<template lang="pug">
Main
  .wrapper
    .background 
      .text 
        Icon(type="ios-jet" size="100")
        div 404！
</template>
<style lang="less">
</style>
<script>
export default {
  methods: {
    back() {
      history.back();
    }
  }
};
</script>