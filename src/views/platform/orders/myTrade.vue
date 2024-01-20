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
      sides: {
        BUY_OPEN: this.$lang("买入开多"),
        SELL_OPEN: this.$lang("卖出开空"),
        BUY_CLOSE: this.$lang("买入平空"),
        SELL_CLOSE: this.$lang("卖出平多"),
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
          title: this.$lang("用户ID"),
          minWidth: 190,
          key: "userId",
          render: (h, params) =>
            h("User", {
              props: {
                uid: params.row.userId,
              },
            }),
        },
        {
          title: this.$lang("方向"),
          minWidth: 100,
          key: "side",
          render: (h, p) => {
            return h("span", this.sides[p.row.side]);
          },
        },
        {
          title: this.$lang("成交数量"),
          minWidth: 160,
          key: "origQty",
          render: (h, p) => {
            return h("span", p.row.quantity + this.$lang("张"));
          },
        },
        {
          title: this.$lang("持仓盈亏"),
          minWidth: 160,
          key: "pnl",
          render: (h, p) => {
            return h("span", p.row.pnl + p.row.quoteTokenId);
          },
        },

        {
          title: this.$lang("成交价格"),
          minWidth: 160,
          key: "price",
          render: (h, p) => {
            return h("span", p.row.price + p.row.unit);
          },
        },
        {
          title: this.$lang("手续费"),
          minWidth: 160,
          key: "fee",
          render: (h, p) => {
            return h("span", p.row.fee + p.row.feeTokenName);
          },
        },
      ],
    };
  },
};
</script>