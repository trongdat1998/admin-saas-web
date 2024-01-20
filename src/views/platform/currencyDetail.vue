<template lang="pug">
Main.page-exchange
  Table(:columns="columns", :data="listData" :loading="loadingTable")
    template(slot-scope="{row, index }" slot="rechange")
      Tag(v-if="row.allowDeposit" color="primary") {{ $lang('已启用') }}
      Tag(v-else) {{ $lang('未启用') }}
    template(slot-scope="{row, index }" slot="withdraw")
      Tag(v-if="row.allowWithdraw" color="primary") {{ $lang('已启用') }}
      Tag(v-else) {{ $lang('未启用') }}
    template(slot-scope="{row, index }" slot="visible")
      Tag(v-if="row.status" color="primary") {{ $lang('已启用') }}
      Tag(v-else) {{ $lang('未启用') }}
</template>
<script>
export default {
  data() {
    return {
      listData:[],
      columns: [
        {
          title: this.$lang("序号"),
          type: "index"
        },
        {
          title: this.$lang("交易所ID"),
          key: "exchangeId",
          sortable: true
        },
        {
          title: this.$lang("券商ID"),
          key: "brokerId",
          sortable: true
        },
        {
          title: this.$lang("券商简称"),
          key: "brokerName"
        },
        {
          title: this.$lang("币种"),
          key: "tokenId"
        },
        {
          title: this.$lang("币种简称"),
          key: "tokenName"
        },
        {
          title: this.$lang("充值状态"),
          key:"allowDeposit",
          slot: "rechange",
          sortable: true
        },
        {
          title: this.$lang("提现状态"),
          slot: "withdraw",
          key:"allowWithdraw",
          sortable: true
        },
        {
          title: this.$lang("页面可见状态"),
          slot: "visible",
          key:"status",
          sortable: true
        },
        {
          title: this.$lang("币种开通时间"),
          key: "created",
          sortable: true,
          render: (h, p) =>h("span", this.newDate(p.row.created).format())
        }
      ]
    };
  },
  created() {
    this.loadData();
  },
  methods: {
    loadData() {
      this.loadingTable = true;
      this.$axios
        .post("/api/v1/broker_token/query", {
          current: 1,
          pageSize: 500,
          category: 1,
          tokenId: this.$route.params.token
        })
        .then(result => {
          this.loadingTable = false;
          if (result.code == 0) {
            this.listData = result.data.list;
          }
        });
    }
  }
};
</script>
