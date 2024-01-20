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
      columns: [
        {
          title: this.$lang("合约"),
          minWidth: 150,
          key: "symbolId"
        },
        {
          title: this.$lang("杠杆"),
          minWidth: 100,
          key: "leverage",
          render: (h, p) => {
            return h("span", p.row.leverage > 0 ? p.row.leverage + "X" : "--");
          }
        },
        {
          title: this.$lang("仓位方向"),
          minWidth: 100,
          render: (h, p) => {
            return h("span", this.$lang(p.row.isLong == 1 ? "多仓" : "空仓"));
          }
        },
        {
          title: this.$lang("仓位"),
          minWidth: 100,
          render: (h, p) => {
            return h("span", p.row.total + this.$lang("张"));
          }
        },
        {
          title: this.$lang("可平仓位数量"),
          minWidth: 130,
          render: (h, p) => {
            return h("span", p.row.available + this.$lang("张"));
          }
        },
        {
          title: this.$lang("仓位价值"),
          minWidth: 160,
          key: "positionValues",
          render: (h, p) => {
            return h("span", p.row.positionValues  + p.row.quoteTokenId);
          }
        },
        {
          title: this.$lang("仓位保证金"),
          minWidth: 220,
          key: "margin",
          render: (h, p) => {
            return h("span", p.row.margin + p.row.quoteTokenId);
          }
        },
        {
          title: this.$lang("开仓均价"),
          minWidth: 140,
          key: "avgPrice",
          render: (h, p) => {
            return h("span", p.row.avgPrice  + p.row.unit);
          }
        },
        {
          title: this.$lang("预估强平价"),
          minWidth: 150,
          key: "liquidationPrice",
          render: (h, p) => {
            return h("span", p.row.liquidationPrice  + p.row.unit);
          }
        },
        {
          title: this.$lang("保证金率"),
          minWidth: 200,
          key: "leverage",
          render: (h, p) => {
            return h("span", (p.row.marginRate*100).cutFixed(2) + "%");
          }
        },
        {
          title: this.$lang("未实现盈亏"),
          minWidth: 210,
          key: "unrealisedPnl",
          render: (h, p) => {
            return h("span", p.row.unrealisedPnl + p.row.quoteTokenId);
          }
        },
        {
          title: this.$lang("收益率"),
          minWidth: 160,
          key: "unrealisedPnl",
          render: (h, p) => {
            return h("span", (p.row.profitRate*100).cutFixed(2) + "%");
          }
        },
        {
          title: this.$lang("标的指数"),
          minWidth: 140,
          key: "indices",
          render: (h, p) => {
            return h("span", p.row.indices);
          }
        }
      ]
    };
  }
};
</script>