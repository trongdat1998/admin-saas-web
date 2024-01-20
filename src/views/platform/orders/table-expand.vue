<style scoped lang="less">
.expand-row {
  border-top: 1px solid #e1e1e1;
  td{
    padding: 4px 10px;
    height: 36px;
    background: #fff;
  }
}
</style>
<template lang="pug">
div
  table(width="100%" cellspacing="0" cellpadding="0" border="0")
    tr.expand-row
      td {{$lang("时间")}}
      td {{$lang("价格")}}
      td {{$lang("数量")}}
      td {{$lang("手续费")}}
    tr.expand-row(v-for="item in list" :key="item.time")
      td {{newDate(item.time).format()}}
      td {{item.price}}
      td {{item.quantity}}
      td {{item.fee}}{{item.feeTokenName}}
</template>
<script>
export default {
  props: {
    list: {
      type: Array,
      default() {
        return [];
      }
    }
  }
};
</script>