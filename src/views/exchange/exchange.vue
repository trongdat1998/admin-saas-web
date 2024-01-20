<template lang="pug">
Main.page-exchange
  Table.user-table(:columns="columns", :data="listData", :loading="loadingTable")
    template(slot-scope="{ row }" slot="link")
      Icon.copy(size="24" type="ios-copy-outline" :data-clipboard-text="row.adminWebUrl")
  .page-pages(v-if="total>searchForm.pageSize")
    Page(:current.sync="searchForm.current", :total="total", :pageSize="searchForm.pageSize" @on-change="loadData")
</template>
<script>
import ClipboardJS from "clipboard";
export default {
  components: { },
  data() {
    return {
      loading: false,
      loadingTable: true,
      total: 0,

      // 搜索关键字，包含非数字的字符串，处理为交易所简称
      searchKeyword: "",
      searchForm: {
        current: 1,
        pageSize: 1000,
        exchangeName: "",
        exchangeId: ""
      },
      listData: [],
      columns: [
        {
          title: this.$lang("交易所ID"),
          minWidth: 80,
          key: "exchangeId"
        },
        {
          title: this.$lang("交易所简称"),
          minWidth: 160,
          key: "exchangeName"
        },
        {
          title: this.$lang("创建时间"),
          minWidth: 160,
          key: "createdAt",
          render: (h, params) =>
            h("span", this.newDate(params.row.createdAt).format())
        },
        {
          title: this.$lang("云链接"),
          minWidth: 90,
          slot: "link",
          key: "adminWebUrl"
        },

        {
          title: this.$lang("交易所费率"),
          minWidth: 120,
          key: "saasFee"
        },
      ],
      brokers: []
    };
  },
  created() {
    this.loadData();
    this.$axios.post("/api/v1/broker/query_simple_brokers").then(result => {
      if (result.code === 0) {
        this.brokers = result.data;
      }
    });
  },
  mounted() {
    let clipboard = new ClipboardJS(".copy");
    clipboard.on("success", () => {
      this.$Message.success(this.$lang("已复制"));
    });
  },
  methods: {
    loadData() {
      this.loadingTable = true;
      this.searchForm.exchangeName = /\D/.test(this.searchKeyword)
        ? this.searchKeyword
        : "";
      this.searchForm.exchangeId = !/\D/.test(this.searchKeyword)
        ? this.searchKeyword * 1
        : "";
      this.$axios
        .post("/api/v1/exchange/query_exchanges", this.searchForm)
        .then(result => {
          this.loadingTable = false;
          if (result.code === 0) {
            this.listData = result.data.list.map(el => {
              el.list = [];
              return el;
            });
            this.total = result.data.total;
          }
        });
    },

  }
};
</script>
