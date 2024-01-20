<template lang="pug">
Main.page-exchange
  Row.search(:grtter="15")
    Col(span="20") &nbsp;
    Col(span="4")
      Button(type="primary", @click="create", icon="md-add-circle", long ghost) {{ $lang('新建') }}
  Table.user-table(
    :columns="columns",
    :data="listData",
    :loading="loadingTable"
  )

  // 创建修改券商    
  Modal.page-exchange-win(
    v-model="creatWinStatus",
    :title="$lang(createForm.brokerId ? '修改' : '新建')",
    @on-ok="doNext"
  )
    Form(:model="createForm", :label-width="100")
      FormItem(:label="$lang('券商')")
        Input(
          v-model="createForm.brokerName",
          :placeholder="$lang('请输入', $lang('券商'))",
          :disabled="!!createForm.brokerId"
        )
      FormItem(:label="$lang('签名')")
        Input(
          v-model="createForm.sign",
          :placeholder="$lang('请输入', $lang('请输入短信签名'))"
        )
</template>
<script>
export default {
  data() {
    return {
      loadingTable: true,
      listData: [],
      creatWinStatus: false,
      searchForm: {
        pageSize: 1000,
        fromId: 0,
        lastId: 0,
        next: true,
      },
      createForm: {
        brokerName: "",
        sign: "",
        brokerId: "",
      },
      columns: [
        {
          title: this.$lang("券商ID"),
          key: "brokerId",
        },
        {
          title: this.$lang("券商简称"),
          key: "brokerName",
        },
        {
          title: this.$lang("签名"),
          key: "sign",
        },
        {
          title: this.$lang("操作"),
          width: 120,
          render: (h, params) => {
            return h(
              "a",
              {
                on: {
                  click: () => {
                    this.creatWinStatus = true;
                    this.nextType = "edit";
                    Object.assign(this.createForm, params.row);
                  },
                },
              },
              this.$lang("修改")
            );
          },
        },
      ],
    };
  },
  created() {
    this.loadData();
  },
  methods: {
    loadData() {
      this.loadingTable = true;
      this.$axios
        .post("/api/v1/sms_sign/list", this.searchForm)
        .then((result) => {
          this.loadingTable = false;
          if (result.code === 0) {
            this.listData = result.data ? result.data : [];
          }
        });
    },
    create() {
      this.creatWinStatus = true;
      Object.assign(this.createForm, {
        brokerName: "",
        sign: "",
        brokerId: null,
      });
    },
    doNext() {
      this.$axios
        .post("/api/v1/sms_sign/create", this.createForm)
        .then((result) => {
          if (result.code === 0) {
            this.$Notice.success({
              title: this.$lang("成功"),
            });
          }
          this.loadData();
        });
    },
  },
};
</script>