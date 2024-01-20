<template lang="pug">
Main.page-exchange
  Row.search(:grtter="15")
    Col(span="24")
      Input(
        :placeholder="$lang('请输入') + $lang('手机或邮箱')",
        v-model="searchForm.receiver",
        search,
        :enter-button="$lang('')",
        @on-search="loadData"
      )

  Table.user-table(
    :columns="columns",
    :data="listData",
    :loading="loadingTable"
  )
</template>
<script>
export default {
  data() {
    return {
      loading: false,
      loadingTable: false,

      searchForm: {
        receiver: "",
      },
      listData: [],

      columns: [
        {
          minWidth: 120,
          title: this.$lang("券商ID"),
          key: "orgId",
        },
        {
          minWidth: 120,
          title: this.$lang("接收号码"),
          key: "receiver",
        },
        {
          minWidth: 120,
          title: this.$lang("发送渠道"),
          key: "channel",
        },
        {
          minWidth: 120,
          title: this.$lang("接收状态"),
          key: "deliveryStatus",
        },
        {
          minWidth: 120,
          title: this.$lang("状态描述"),
          key: "description",
        },
        {
          minWidth: 120,
          title: this.$lang("内容描述"),
          key: "content",
        },
        {
          minWidth: 120,
          title: this.$lang("发送时间"),
          render: (h, p) => {
            return h(
              "span",
              this.newDate(p.row.created).format("yyyy/MM/dd hh:mm:ss")
            );
          },
        },
        {
          minWidth: 120,
          title: this.$lang("接收时间"),
          render: (h, p) => {
            return h(
              "span",
              p.row.deliveriedAt > 0
                ? this.newDate(p.row.deliveriedAt).format("yyyy/MM/dd hh:mm:ss")
                : "---"
            );
          },
        },
        {
          minWidth: 120,
          title: this.$lang("业务类型"),
          key: "bizType",
        },
      ],
    };
  },
  created() {},
  methods: {
    loadData() {
      this.loadingTable = true;

      this.$axios
        .post("/api/v1/sms_sign/list_devlivery_records", this.searchForm)
        .then((result) => {
          this.loadingTable = false;
          if (result.code === 0) {
            this.listData = result.data ? result.data : [];
          }
        });
    },
  },
};
</script>
