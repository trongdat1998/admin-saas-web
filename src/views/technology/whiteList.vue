<template lang="pug">
Main.page-exchange
  Row.search(:gutter="15")
    Col(span="24")
      Input(
        :placeholder="$lang('请输入') + $lang('券商简称')",
        v-model="searchKeyword",
        search,
        enter-button="",
        @on-search="loadData"
      )
  Table.user-table(
    :columns="columns",
    :data="listData",
    :loading="loadingTable",
  )
  .page-pages(v-if="total > searchForm.pageSize")
    Page(
      :current.sync="searchForm.current",
      :total="total",
      :pageSize="searchForm.pageSize",
      @on-change="loadData"
    )
  // 创建修改
  Modal.page-exchange-win(v-model="creatWinStatus", :title="$lang(createForm.brokerId ? '修改' : '新建')")
    Form(:model="createForm", :label-width="100")
      FormItem(:label="$lang('券商ID')")
        Input(v-model="createForm.brokerId", :disabled="true")
      FormItem(:label="$lang('白名单币种')")
        Input(
          v-model="createForm.content",
          type="textarea",
          :rows="4"
          :placeholder="$lang('每行对应一个币种')"
        )
    Button(slot="footer", @click="submit", type="primary", :disabled="loading", :loading="loading") {{ $lang('确定') }}
</template>
<script>
import expandRow from "./table-expand.vue";
export default {
  components: { expandRow },
  data() {
    return {
      loading: false,
      loadingTable: true,
      loadingTablesub: false,
      total: 0,
      // 搜索关键字，包含非数字(/D)的字符串，处理为券商简称
      searchKeyword: "",
      searchForm: {
        current: 1,
        brokerName: "",
        brokerId: "",
        pageSize: 1000,
      },
      listData: [],
      creatWinStatus: false,
      // 创建/修改
      createForm: {
        brokerId: "",
        content: "",
      },
      columns: [
        {
          type: "expand",
          render: (h, params) => {
            return h(expandRow, {
              props: {
                row: params.row,
              },
            });
          },
        },
        {
          title: this.$lang("券商"),
          minWidth: 200,
          key: "brokerId",
          sortable: true,
          sortType: "desc",
          render: (h, params) =>
            h("span", [params.row.brokerId, params.row.name].join("-")),
        },
        {
          title: this.$lang("创建时间"),
          minWidth: 160,
          key: "createdAt",
          render: (h, params) =>
            h("span", this.newDate(params.row.createdAt).format()),
        },
        {
          title: this.$lang("操作"),
          minWidth: 50,
          fixed: "right",
          render: (h, params) => {
            return h("div", [
              params.row.verifying
                ? h("span", this.$lang("审核中"))
                : h(
                "a",
                {
                  on: {
                    click: () => {
                      this.getDetail(params.row.brokerId);
                      this.creatWinStatus = true;
                      this.createForm.brokerId = params.row.brokerId;
                    },
                  },
                },
                this.$lang("修改")
                ),
            ]);
          },
        },

      ],
      contractWin: false,
      trust: "",
      contractForm: {
        name: "",
        brokerId: "",
        exchangeId: "",
        bind: true,
        trust: "",
      },
      exchanges: [],
    };
  },
  mounted() {
  },

  filters: {
  },

  methods: {
    getDetail(brokerId) {
      this.$axios
        .post("/api/v1/operate/get_transfer_whitelist", {
          brokerId: brokerId,
        })
        .then((result) => {
          let ret = result.data.iniValue.split(',').join('\n');
          this.createForm.content = ret;
        });
    },
    loadData() {
      this.loadingTable = true;
      this.searchForm.brokerName = /\D/.test(this.searchKeyword)
        ? this.searchKeyword
        : "";
      this.searchForm.brokerId = !/\D/.test(this.searchKeyword)
        ? this.searchKeyword * 1
        : "";
      this.$axios
        .post("/api/v1/operate/query_transfer_whitelist", this.searchForm)
        .then((result) => {
          this.loadingTable = false;
          if (result.code === 0) {
            this.listData = result.data.list
            this.total = result.data.total;
          }
        });
    },
    create() {
      Object.assign(this.createForm, {
        brokerId: "",
        content: "",
      });
      this.creatWinStatus = true;
    },
    submit() {
      let content = this.createForm.content;
      let symbols = content.split("\n");
      let ret = [];
      if (symbols.length) {
        ret = symbols.filter(item => {
          if (item.trim().length) {
            return item;
          }
        });
      }
      Object.assign(this.createForm, {content: ret.join(',').toUpperCase()});
      this.loading = true;
      this.$axios
        .post("/api/v1/operate/set_transfer_whitelist_verify",
          this.createForm
        )
        .then((result) => {
          this.loading = false;
          if (result.code === 0) {
            this.creatWinStatus = false;
            this.$Notice.success({
              title: this.$lang("成功"),
            });
          }
          this.loadData();
        });
    },
  },
  created() {
    this.loadData();
  },
};
</script>
