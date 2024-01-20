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
        INPUT: "限价",
        OPPONENT: "对手价",
        QUEUE: "排队价",
        OVER: "超价",
        MARKET_PRICE: "市价",
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
          title: this.$lang("杠杆"),
          minWidth: 100,
          key: "leverage",
          render: (h, p) => {
            return h("span", p.row.leverage > 0 ? p.row.leverage + "X" : "--");
          },
        },
        {
          title: this.$lang("类型"),
          minWidth: 100,
          key: "priceType",
          render: (h, p) => {
            return h("span", this.$lang(this.types[p.row.priceType]));
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
          title: this.$lang("委托数量"),
          minWidth: 100,
          key: "origQty",
          render: (h, p) => {
            return h("span", p.row.origQty + "张");
          },
        },
        {
          title: this.$lang("委托价格"),
          minWidth: 120,
          key: "price",
          render: (h, p) => {
            return h("span", p.row.price + p.row.unit);
          },
        },
        {
          title: this.$lang("实际委托价"),
          minWidth: 180,
          key: "executedPrice",
          render: (h, p) => {
            return h("span", p.row.executedPrice + p.row.unit);
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