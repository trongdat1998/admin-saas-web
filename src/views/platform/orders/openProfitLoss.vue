<template lang="pug">
Table(:columns="columns", :data="data", :loading="loading")
</template>
<script>
export default {
  props: {
    loading: {
      type: Boolean,
      default: false,
    },
    data: {
      type: Array,
      default() {
        return [];
      },
    },
  },
  data() {
    return {
      types: {
        STOP_COMMON: "普通",
        STOP_LONG_PROFIT: "多仓止盈",
        STOP_LONG_LOSS: "多仓止损",
        STOP_SHORT_PROFIT: "空仓止盈",
        STOP_SHORT_LOSS: "空仓止损",
      },
      sides: {
        BUY_OPEN: "买入开多",
        SELL_OPEN: "卖出开空",
        BUY_CLOSE: "买入平空",
        SELL_CLOSE: "卖出平多",
      },
      status: {
        ORDER_NEW: "等待委托",
        ORDER_FILLED: "已委托",
        ORDER_REJECTED: "委托失败",
        ORDER_CANCELED: "委托取消",
      },
      columns: [
        {
          minWidth: 190,
          title: this.$lang("订单ID"),
          key: "orderId",
        },
        {
          title: this.$lang("合约"),
          minWidth: 150,
          key: "symbolId",
        },
        {
          title: this.$lang("时间"),
          minWidth: 190,
          key: "time",
          render: (h, p) => h("div", this.newDate(p.row.time).format()),
        },
        {
          minWidth: 190,
          title: this.$lang("最后更新"),
          render: (h, params) =>
            h(
              "span",
              params.row.updated > 0
                ? this.newDate(params.row.updated).format()
                : "----"
            ),
        },
        {
          title: this.$lang("类型"),
          minWidth: 100,
          key: "planOrderType",
          render: (h, p) => {
            return h("span", this.$lang(this.types[p.row.planOrderType]));
          },
        },
        {
          title: this.$lang("方向"),
          minWidth: 100,
          key: "side",
          render: (h, p) => {
            return h("span", this.$lang(this.sides[p.row.side]));
          },
        },
        {
          title: this.$lang("触发价格"),
          minWidth: 120,
          key: "triggerPrice",
          render: (h, p) => {
            return h("span", p.row.triggerPrice + p.row.unit);
          },
        },
        {
          title: this.$lang("状态"),
          minWidth: 120,
          key: "status",
          render: (h, p) => {
            return h("span", this.$lang(this.status[p.row.status]));
          },
        },
      ],
    };
  },
};
</script>