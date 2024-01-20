<template lang="pug">
div
  Table(:columns="columns", :data="data", :loading="loading")
    template(slot-scope="{ row, index }", slot="view")
      Button(type="error", size="small", @click="showDetail(row)") {{ $lang('查看') }}
  Modal.page-exchange-win(
    v-model="viewWin",
    :title="$lang('订单详情')",
    width="800"
  )
    Row(:gutter="30")
      Col(span="8")
        List
          ListItem {{ $lang('合约') }} ： {{ detail.symbolName }}
          ListItem {{ $lang('时间') }} ： {{ newDate(detail.time).format() }}
          ListItem {{ $lang('类型') }} ： {{ this.$lang(this.priceTypes[detail.priceType]) }}
      Col(span="8")
        List
          ListItem {{ $lang('方向') }} ： {{ $lang(sides[detail.side]) }}
          ListItem {{ $lang('数量') }} ： {{ detail.origQty }}（{{ $lang('张') }}）
          ListItem {{ $lang('价格') }} ： {{ detail.priceType == 'MARKET_PRICE' ? '---' : detail.price + detail.unit }}
      Col(span="8")
        List
          ListItem {{ $lang('成交均价') }} ： {{ detail.avgPrice + detail.unit }}
          ListItem {{ $lang('已成交数量') }} ： {{ detail.executedQty }}
          ListItem {{ $lang('状态') }} ： {{ $lang(viwStatus[detail.status]) }}
    template(slot="footer")
      Button(type="primary", :loading="isloading", :disabled="isloading") {{ $lang('确定') }}
</template>
<script>
export default {
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
      detail: {},
      viewWin: false,
      priceTypes: {
        INPUT: "限价",
        OPPONENT: "对手价",
        QUEUE: "排队价",
        OVER: "超价",
        MARKET_PRICE: "市价",
      },
      viwStatus: {
        NEW: "订单已创建",
        PARTIALLY_FILLED: "部分成交",
        FILLED: "完全成交",
        CANCELED: "已取消",
        REJECTED: "已拒绝",
      },
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
      liquidation: {
        NO_LIQ: "非爆仓单",
        IOC: "爆仓强平单",
        ADL: "爆仓减仓单",
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
        {
          title: this.$lang("查看"),
          minWidth: 120,
          slot: "view",
        },
      ],
    };
  },
  methods: {
    showDetail(row) {
      this.viewWin = true;
      this.isloading = true;
      Object.keys(this.detail).forEach((el) => {
        this.detail[el] = "";
      });
      this.$axios
        .post(
          "/api/v1/swap/order/order_info",
          Object.assign({}, this.searchForm, { orderId: row.executedOrderId })
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