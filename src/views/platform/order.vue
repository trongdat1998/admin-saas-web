<template lang="pug">
Main.page-exchange
  Row.search(:gutter="15")
    //-   Select(v-model="searchForm.symbolId" @on-change="change" filterable)
    //-     Option(value="all") {{$lang('全部')}}
    //-     Option(:value="item.symbolId" v-for="item in symbols" :key="item.symbolId") {{item.symbolId}}
    Col(span="4")
      Select(v-model="type" @on-change="change")
        Option(value="current") {{$lang('当前持仓')}}
        Option(value="openLimit") {{$lang('未成交-普通委托')}}
        Option(value="openStop") {{$lang('未成交-计划委托')}}
        Option(value="openProfitLoss") {{$lang('未成交-止盈止损')}}
        Option(value="tradeLimit") {{$lang('历史委托-普通委托')}}
        Option(value="tradeStop") {{$lang('历史委托-计划委托')}}
        Option(value="tradeProfitLoss") {{$lang('历史委托-止盈止损')}}
        Option(value="myTrade") {{$lang('历史成交')}}
    Col(span="20")
      Input(search :placeholder="`${$lang('用户ID')} / ${$lang('用户手机')} / ${$lang('用户邮箱')}`" v-model="inputInfo", enter-button="" @on-search="search")
  currentOrder(:data="listData", :loading="loading" v-if="type=='current'")
  openLimitOrder(:data="listData", :loading="loading" v-else-if="type=='openLimit'")
  openStopOrder(:data="listData", :loading="loading" v-else-if="type=='openStop'")
  tradeLimitOrder(:data="listData", :loading="loading" v-else-if="type=='tradeLimit'" :searchForm="postForm" :inputInfo='inputInfo')
  tradeStopOrder(:data="listData", :loading="loading" v-else-if="type=='tradeStop'")
  myTradeOrder(:data="listData", :loading="loading" v-else-if="type=='myTrade'")
  openProfitLossOrder(:data="listData", :loading="loading" v-else-if="type=='openProfitLoss'")
  tradeProfitLossOrder(:data="listData", :searchForm="postForm" :loading="loading" v-else-if="type=='tradeProfitLoss'")
  Row(:gutter="20" style="padding-top:30px")
    Col(span="10")
      ButtonGroup
        Button(@click="getFirstData" icon="ios-arrow-back")
        Button(@click="getNextData" icon="ios-arrow-forward")
</template>
<script>
import { formatParams } from "@/libs/common.js";
import currentOrder from "./orders/current.vue";
import openLimitOrder from "./orders/openLimit.vue";
import openStopOrder from "./orders/openStop.vue";
import openProfitLossOrder from "./orders/openProfitLoss.vue";
import tradeLimitOrder from "./orders/tradeLimit.vue";
import tradeStopOrder from "./orders/tradeStop.vue";
import tradeProfitLossOrder from "./orders/tradeProfitLoss.vue";
import myTradeOrder from "./orders/myTrade.vue";
export default {
  components: {
    currentOrder,
    openLimitOrder,
    openStopOrder,
    tradeLimitOrder,
    tradeStopOrder,
    myTradeOrder,
    openProfitLossOrder,
    tradeProfitLossOrder
  },
  data() {
    return {
      brokers:[],
      inputInfo: this.$route.query.userId || "",
      type: this.$route.params.type ? this.$route.params.type : "myTrade",
      types: {
        current: {
          url: "current_orders",
          tag: "PositionId"
        },
        openLimit: {
          url: "open_orders",
          futuresOrderType: "LIMIT",
          tag: "OrderId",
          profitLossOrder: false
        },
        openStop: {
          url: "open_orders",
          futuresOrderType: "STOP",
          tag: "OrderId",
          profitLossOrder: false
        },
        tradeLimit: {
          url: "trade_orders",
          futuresOrderType: "LIMIT",
          tag: "OrderId",
          profitLossOrder: false
        },
        tradeStop: {
          url: "trade_orders",
          futuresOrderType: "STOP",
          tag: "OrderId",
          profitLossOrder: false
        },
        myTrade: {
          url: "my_trades",
          tag: "TradeId"
        },
        openProfitLoss: {
          url: "open_orders",
          futuresOrderType: "STOP",
          tag: "OrderId",
          profitLossOrder: true
        },
        tradeProfitLoss: {
          url: "trade_orders",
          futuresOrderType: "STOP",
          tag: "OrderId",
          profitLossOrder: true
        }
      },
      searchForm: {
        symbolId: "all",
        orgId:"",
        limit: 100,
        type: "",
        userId: "",
        phone: "",
        email: ""
      },
      postForm: {},
      loading: false,
      tag: "",
      fromId: 0,
      listData: [],
      symbols: []
    };
  },
  methods: {
    change(type) {
      this.$router.replace("/platform/order/" + type);
      this.search();
    },
    search() {
      this.tag = this.types[this.type].tag;
      this.listData = [];
      this.postForm = Object.assign(
        {},
        this.searchForm,
        formatParams(this.inputInfo),
        this.types[this.type]
      );

      this.postForm["from" + this.tag] = 0;
      this.postForm["end" + this.tag] = 0;

      if (this.searchForm.symbolId === "all") {
        this.postForm.symbolId = "";
      }

      this.loadData();
    },
    getFirstData() {
      this.postForm["from" + this.tag] = 0;
      this.postForm["end" + this.tag] = this.listData.length
        ? this.listData[0][
            this.tag.replace(this.tag[0], this.tag[0].toLowerCase())
          ]
        : 0;
      this.loadData();
    },
    getNextData() {
      this.postForm["end" + this.tag] = 0;
      this.postForm["from" + this.tag] = this.listData.length
        ? this.listData[this.listData.length - 1][
            this.tag.replace(this.tag[0], this.tag[0].toLowerCase())
          ]
        : 0;
      this.loadData();
    },
    loadData() {
      this.loading = true;
      this.$axios
        .post(`/api/v1/swap/order/${this.types[this.type].url}`, this.postForm)
        .then(result => {
          this.loading = false;
          if (result.code == 0) {
            this.listData = result.data.map(el => {
              el.list = [];
              return el;
            });
          }
        });
    }
  },
  created() {
    // this.$axios
    //   .post("/api/v1/swap/query", {
    //     current: 1,
    //     pageSize: 1000
    //   })
    //   .then(result => {
    //     if (result.code === 0) {
    //       this.symbols = result.data.list ? result.data.list : [];
    //     }
    //   });
    this.$axios.post("/api/v1/broker/query_simple_brokers").then((result) => {
      if (result.code === 0) {
        this.brokers = result.data;
        this.searchForm.orgId = this.brokers[0].brokerId;
        this.search();
      }
    });

  }
};
</script>
