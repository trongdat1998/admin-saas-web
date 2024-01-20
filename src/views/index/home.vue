<style lang="less" scoped>
.wrapper{
  display: flex;
  align-items: center;
  height: calc(100vh - 150px);
}
.background {
  width: 100%;
  padding: 200px 0;
  font-size: 40px;
  text-align: center;
  color: #fff;
  background: url(./background.jpg);
  position: relative;
  &:after {
    background: rgba(0, 0, 0, 0.5);
    content: " ";
    position: absolute;
    top: 0;
    left: 0;
    right: 0;
    bottom: 0;
  }
  .text{
      position: relative;
      z-index: 2;
  }
}
</style>

<template lang="pug">
Main
  .wrapper
    .background
      .text {{$lang('欢迎登录 SAAS 管理系统')}}
</template>
<style lang="less">
</style>
<script>
export default {
  data() {
    return {};
  }
};
</script>
