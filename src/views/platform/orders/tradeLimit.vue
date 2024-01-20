<template lang="pug">
div
  Table(
    :columns="columns",
    :data="data",
    :loading="loading",
    @on-expand="expand"
  )
    template(slot-scope="{ row, index }", slot="status")
      template(v-if="row.liquidationType === 'IOC'")
        Button(type="error", size="small", @click="showDetail(row)") {{ $lang(status[row.status]) }} - {{ $lang('强平') }}
      template(v-else-if="row.liquidationType === 'ADL'")
        Tag(color="warning", type="border") {{ $lang(status[row.status]) }} - {{ $lang('减仓') }}
      template(v-else) {{ $lang(status[row.status]) }}
  Modal.page-exchange-win(
    v-model="viewWin",
    :title="$lang('强平订单持仓详情')",
    width="800"
  )
    Row(:gutter="30")
      Col(span="8")
        List
          ListItem {{ $lang('合约') }}: {{ detail.symbolName }}
          ListItem {{ $lang('仓位保证金') }}:{{ detail.margin }}{{ detail.quoteTokenId }}
          ListItem {{ $lang('标的指数') }}:{{ detail.indices }}
      Col(span="8")
        List
          ListItem {{ $lang('方向') }}:{{ $lang(detail.isLong == 1 ? '多仓' : '空仓') }}
          ListItem {{ $lang('开仓均价') }}:{{ detail.avgPrice }}{{ detail.unit }}
      Col(span="8")
        List
          ListItem {{ $lang('仓位') }}:{{ detail.total }}{{ $lang('张') }}
          ListItem {{ $lang('预估强平价') }}:{{ detail.liquidationPrice }}{{ detail.unit }}
    template(slot="footer")
      Button(type="primary", :loading="isloading", :disabled="isloading") {{ $lang('确定') }}
</template>
<script>
import expandRow from "./table-expand.vue";
import { formatParams } from "@/libs/common.js";
export default {
  components: { expandRow },
  props: {
    loading: {
      type: Boolean,
      default: false,
    },
    inputInfo: {
      type: String,
      default: "",
    },
    data: {
      type: Array,
      default() {
        return [];
      },
    },
    searchForm: {
      type: Object,
      default() {
        return {};
      },
    },
  },
  data() {
    return {
      isloading: false,
      detail: {
        accountId: "122216245228131", //账户id
        positionId: "122216245228131", //position id
        symbolId: "BTC111", //期货token id
        symbolName: "BTC111", //期货token name

        leverage: "12", //杠杆。 leverage =1/保证金率 = 1/(仓位保证金/仓位价值)
        total: "123", //仓位(手)
        positionValues: "10", //仓位价值（USDT）。仓位价值（USDT） =total*price(当前价格)
        margin: "0.82", //仓位保证金（USDT）
        minMargin: "0.82", //最多减少保证金（USDT） // --- todo

        avgPrice: "11.00", //开仓均价。开仓均价 = 累计开仓价值 / （仓位 * 合约乘数）
        liquidationPrice: "11.01", //预估强平价
        marginRate: "0.1", //保证金率。保证金率 = 仓位保证金/仓位价值
        indices: "123.00000", //交割指数

        available: "12.000", //可平量
        isLong: "1", //仓位方向: 1=多仓，0=空仓
        realisedPnl: "1000.00", //已实现盈亏
        unrealisedPnl: "1000.00", //未实现盈亏
        unit: "USDT", //coin token unit
      },
      viewWin: false,
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
        NEW: "订单已创建",
        PARTIALLY_FILLED: "部分成交",
        FILLED: "完全成交",
        CANCELED: "已取消",
        REJECTED: "已拒绝",
      },
      liquidation: {
        NO_LIQ: "非爆仓单",
        IOC: "爆仓强平单",
        ADL: "爆仓减仓单",
      },

      columns: [
        {
          type: "expand",
          width: 50,
          render: (h, params) => {
            return h(expandRow, {
              props: {
                list: params.row.list,
              },
            });
          },
        },
        {
          minWidth: 190,
          title: this.$lang("订单ID"),
          key: "orderId",
        },
        {
          title: this.$lang("合约"),
          minWidth: 160,
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
          title: this.$lang("数量"),
          minWidth: 100,
          key: "origQty",
          render: (h, p) => {
            return h("span", p.row.origQty + this.$lang("张"));
          },
        },
        {
          title: this.$lang("价格"),
          minWidth: 120,
          key: "price",
          render: (h, p) => {
            return h(
              "span",
              p.row.priceType === "MARKET_PRICE"
                ? "---"
                : p.row.price + p.row.unit
            );
          },
        },
        {
          title: this.$lang("成交均价"),
          minWidth: 140,
          key: "avgPrice",
          render: (h, p) => {
            return h("span", p.row.avgPrice + p.row.unit);
          },
        },
        {
          title: this.$lang("已成交量"),
          minWidth: 140,
          key: "executedQty",
          render: (h, p) => {
            return h("span", p.row.executedQty + this.$lang("张"));
          },
        },
        {
          title: this.$lang("状态"),
          minWidth: 140,
          slot: "status",
        },
      ],
    };
  },
  methods: {
    expand(row, status) {
      if (status) {
        let json = Object.assign(
          {},
          this.searchForm,
          formatParams(this.inputInfo),
          {
            orderId: row.orderId,
            fromTradeId: 0,
            limit: 10000,
          }
        );
        this.$axios
          .post("/api/v1/swap/order/match_info", json)
          .then((result) => {
            this.data.forEach((el) => {
              if (el.orderId == row.orderId) {
                el = Object.assign(el, {
                  list: result.data,
                  _expanded: true,
                });
              }
            });
          });
      } else {
        this.data.forEach((el) => {
          if (el.orderId == row.orderId) {
            el = Object.assign(el, {
              _expanded: false,
            });
          }
        });
      }
    },

    showDetail(row) {
      this.viewWin = true;
      this.isloading = true;
      Object.keys(this.detail).forEach((el) => {
        this.detail[el] = "";
      });
      this.$axios
        .post(
          "/api/v1/swap/order/query_liquidation_position",
          Object.assign({}, this.searchForm, { orderId: row.orderId })
        )
        .then((result) => {
          this.isloading = false;
          if (result.code === 0) {
            Object.assign(this.detail, result.data);
          }
        });
    },
  },
};
</script>