<template lang="pug">
  Main.page-exchange
    Row.search(:grtter="15")
      Col(span="20") &nbsp;
      Col(span="4")
        Button(type="primary", ghost, @click="create", icon="md-add-circle", long) {{ $lang('新建') }}
    Table.user-table(:columns="columns", :data="listData", :loading="loadingTable")
    Modal.page-exchange-win(v-model="creatWin", :title="$lang('新建币池账户')", :loading="loading")
      Form(:model="createForm", :label-width="100")
        FormItem(:label="$lang('券商简称')")
          template(v-for="item in brokers", v-if="item.brokerId === searchForm.orgId") {{ item.brokerId }}-{{ item.name }}
        FormItem(:label="$lang('币池账户')")
          Input(v-model="createForm.accountId", placeholder="accountId")
          span {{ $lang('tip:币池账户创建，默认同步开通BTC') }}
      div(slot="footer")
        Button(@click="doCreate", :loading="loading", :disabled="loading", long, type="primary") {{ $lang('确定') }}
</template>
<script>
  export default {
    data() {
      return {
        loading: false,
        loadingTable: true,
        searchForm: {
          orgId: 6001,
        },
        maps: {},
        listData: [],
        brokers: [],
        creatWin: false,
        createForm: {
          orgId: "",
          accountId: "",
        },
        columns: [
          {
            title: this.$lang("券商ID"),
            minWidth: 140,
            key: "orgId",
          },
          {
            title: this.$lang("账户ID"),
            minWidth: 140,
            key: "accounts",
          },
          {
            title: this.$lang("币种"),
            minWidth: 140,
            key: "tokenId",
          },
        ],
      };
    },
    methods: {
      search() {
        this.loadData();
      },
      loadData() {
        this.loadingTable = true;
        this.$axios
          .post("/api/v1/margin/query_funding_account", this.searchForm)
          .then((result) => {
            this.loadingTable = false;
            if (result.code === 0) {
              this.listData = result.data;
            }
          });
      },
      create() {
        Object.assign(this.createForm, {
          orgId: "",
          accountId: "",
        });
        this.creatWin = true;
      },
      doCreate() {
        this.createForm.orgId = this.searchForm.orgId;
        this.loading = true;
        this.$axios
          .post("/api/v1/margin/bind_funding_account", this.createForm)
          .then((result) => {
            this.loading = false;
            if (result.code == 0) {
              this.creatWin = false;
              this.search();
            }
          });
      },
    },
    created() {
      this.$axios.post("/api/v1/broker/query_simple_brokers").then((result) => {
        if (result.code === 0) {
          this.brokers = result.data;
          this.brokers.forEach((el) => {
            this.maps[el.brokerId] = el.name;
          });
          this.searchForm.orgId = result.data[0].brokerId;
          this.search();
        }
      });
    },
  };
</script>
