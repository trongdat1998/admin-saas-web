<template lang="pug">
Main.page-exchange
  Table.user-table(:columns="columns", :data="listData", :loading="loadingTable")
  Modal(v-model="nextWin" :title="$lang('涨跌幅限制')")
    Form(:labelWidth="120")
      FormItem(:label="$lang('买入最低价')")
        Input(v-model='nextForm.buyMinPrice', :placeholder="$lang('买入最低价')")
      FormItem(:label="$lang('卖出最低价')")
        Input(v-model='nextForm.sellMinPrice', :placeholder="$lang('卖出最低价')")
      FormItem(:label="$lang('买入最高价')")
        Input(v-model='nextForm.buyMaxPrice', :placeholder="$lang('买入最高价')")
      FormItem(:label="$lang('卖出最高价')")
        Input(v-model='nextForm.sellMaxPrice', :placeholder="$lang('卖出最低价')")
    template(slot="footer")
      Button(type="error" @click="doNext" long :loading="loading" :disabled="loading") {{$lang('确定')}}
</template>
<script>
export default {
  created() {
    this.$axios
      .post("/api/v1/exchange/query_exchanges", {
        current: 1,
        pageSize: 1000
      })
      .then(result => {
        if (result.data.list && result.data.list.length) {
          this.exchangList = result.data.list;
          this.searchForm.exchangeId =
            sessionStorage.exchangeId || this.exchangList[0].exchangeId;
          this.loadData();
        }
      });
  },
  methods: {
    loadData() {
      sessionStorage.exchangeId = this.searchForm.exchangeId;
      this.loadingTable = true;
      this.$axios
        .get("/api/v1/platform/ex_symbol/limit_price/query", {
          params: this.searchForm
        })
        .then(result => {
          this.loadingTable = false;
          this.listData = result.data;
        });
    },
    doNext() {
      this.loading = true;
      this.$axios
        .post("/api/v1/platform/ex_symbol/limit_price/update", this.nextForm)
        .then(result => {
          this.loading = false;
          if (result.code === 0) {
            this.nextWin = false;
            this.loadData();
          }
        });
    }
  },
  data() {
    return {
      nextWin: false,
      exchangList: [],
      loadingTable: true,
      loading: false,
      searchForm: {
        exchangeId: "",
        symbolId: ""
      },
      nextForm: {
        exchangeId: "",
        symbolId: "",
        buyMinPrice: "",
        buyMaxPrice: "",
        sellMinPrice: "",
        sellMaxPrice: ""
      },
      columns: [
        {
          minWidth: 140,
          title: this.$lang("交易所"),
          key: "exchangeId"
        },
        {
          minWidth: 140,
          title: this.$lang("币对"),
          key: "symbolId"
        },
        {
          minWidth: 140,
          title: this.$lang("买入最低价"),
          key: "buyMinPrice",
          render: (h, params) =>
            h(
              "span",
              params.row.buyMinPrice === "" ? "----" : params.row.buyMinPrice
            )
        },
        {
          minWidth: 140,
          title: this.$lang("卖出最低价"),
          key: "sellMinPrice",
          render: (h, params) =>
            h(
              "span",
              params.row.sellMinPrice === "" ? "----" : params.row.sellMinPrice
            )
        },
        {
          minWidth: 140,
          title: this.$lang("买入最高价"),
          key: "buyMaxPrice",
          render: (h, params) =>
            h(
              "span",
              params.row.buyMaxPrice === "" ? "----" : params.row.buyMaxPrice
            )
        },
        {
          minWidth: 140,
          title: this.$lang("卖出最高价"),
          key: "sellMaxPrice",
          render: (h, params) =>
            h(
              "span",
              params.row.sellMaxPrice === "" ? "----" : params.row.sellMaxPrice
            )
        },
        {
          minWidth: 140,
          title: this.$lang("操作"),
          align:"right",
          render: (h, params) => {
            return h(
              "a",
              {
                on: {
                  click: () => {
                    this.nextWin = true;
                    Object.assign(this.nextForm, params.row);
                  }
                }
              },
              this.$lang("修改")
            );
          }
        }
      ],
      listData: []
    };
  }
};
</script>
