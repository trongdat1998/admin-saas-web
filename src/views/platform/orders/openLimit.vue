<template lang="pug">
Table(:columns="columns", :data="data", :loading="loading")
</template>
<script>
export default {
  props: {
    loading: {
      type: Boolean,
      default: false
    },
    data: {
      type: Array,
      default() {
        return [];
      }
    }
  },
  data() {
    return {
      types: {
        INPUT: "限价",
        OPPONENT: "对手价",
        QUEUE: "排队价",
        OVER: "超价",
        MARKET_PRICE: "市价"
      },
      sides: {
        BUY_OPEN: "买入开多",
        SELL_OPEN: "卖出开空",
        BUY_CLOSE: "买入平空",
        SELL_CLOSE: "卖出平多"
      },
      status: {
        NEW: "订单已创建",
        PARTIALLY_FILLED: "部分成交",
        FILLED: "完全成交",
        CANCELED: "已取消",
        REJECTED: "已拒绝"
      },
      columns: [{
          minWidth: 190,
          title: this.$lang("订单ID"),
          key: "orderId"
        },
        {
          title: this.$lang("合约"),
          minWidth: 150,
          key: "symbolId"
        },
        {
          title: this.$lang("时间"),
          minWidth: 190,
          key: "time",
          render: (h, p) => h("div", this.newDate(p.row.time).format())
        },
        {
          title: this.$lang("杠杆"),
          minWidth: 100,
          key: "leverage",
          render: (h, p) => {
            return h("span", p.row.leverage>0 ? p.row.leverage + "X" :"--");
          }
        },
        {
          title: this.$lang("类型"),
          minWidth: 100,
          key: "priceType",
          render: (h, p) => {
            return h("span", this.$lang(this.types[p.row.priceType]));
          }
        },
        {
          title: this.$lang("方向"),
          minWidth: 100,
          key: "side",
          render: (h, p) => {
            return h("span", this.$lang(this.sides[p.row.side]));
          }
        },
        {
          title: this.$lang("数量"),
          minWidth: 100,
          key: "origQty",
          render: (h, p) => {
            return h("span", p.row.origQty + "张");
          }
        },
        {
          title: this.$lang("价格"),
          minWidth: 120,
          key: "price",
          render: (h, p) => {
            return h("span", p.row.price + p.row.unit);
          }
        },
        {
          title: this.$lang("成交均价"),
          minWidth: 140,
          key: "avgPrice",
          render: (h, p) => {
            return h("span", p.row.avgPrice + p.row.unit);
          }
        },
        {
          title: this.$lang("已成交量"),
          minWidth: 140,
          key: "executedQty",
          render: (h, p) => {
            return h("span", p.row.executedQty + "张");
          }
        },
        {
          title: this.$lang("保证金"),
          minWidth: 160,
          key: "margin",
          render: (h, p) => {
            return h("span", p.row.margin + p.row.quoteTokenId);
          }
        },
        {
          title: this.$lang("状态"),
          minWidth: 120,
          key: "status",
          render: (h, p) => {
            return h("span", this.$lang(this.status[p.row.status]));
          }
        }
      ]
    };
  }
};
</script>