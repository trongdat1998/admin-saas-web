<template lang="pug">
Main
  .manage-menu
    router-link.button(to="/exchange/options/kyc") {{$lang('KYC配置')}}
    router-link.button(to="/exchange/options/push") {{$lang('Push通知配置')}}
    router-link.button(to="/exchange/options/staking") {{$lang('理财配置')}}
  router-view
</template>
<style lang="less" scoped>
.manage-menu {
  border-bottom: 1px solid #dcdee2;
  font-size: 14px;
  margin-bottom: 15px;
  a {
    padding: 15px 20px;
    display: inline-block;
    margin-right: 16px;
    color: #515a6e;
    &.router-link-active {
      border-bottom: 2px solid #2d8cf0;
      position: relative;
      margin-bottom: -1px;
      color: #2d8cf0;
    }
  }
}
</style>
