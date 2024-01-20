<style lang="less" scoped>
.box {
  display: flex;
  min-height: 300px;
  align-items: center;
  justify-content: center;
  border: 1px dashed #ccc;
  padding: 50px;
}
</style>

<template lang="pug">
Main.page-exchange
  Tabs(:animated="false" v-model="createForm.accountType" @on-click="change")
    TabPane(:label="item" v-for="(item,key) in type", :name="key" :key="key")
      template(v-if="isInit")
        template(v-if="isBind")
          Alert {{$lang("券商简称")}}：{{brokerName}} &nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;Account ID：{{accountId}}
          Table.user-table(:columns="columns", :data="listData", :loading="loadingTable")
        .box(@click="bind" v-else)
          Button(icon="md-add" type="primary" @click="bind") {{$lang("绑定资金子账户")}}（{{item}}）
        
  // 绑定资金子账户    
  Modal.page-exchange-win(v-model="creatWinStatus", :title="$lang('绑定资金子账户')" @on-ok="doNext")
    Form(:model='createForm', :label-width='120')
      FormItem(:label="$lang('类型')")
        Input(:value='type[createForm.accountType]', readonly)
      FormItem(:label="$lang('券商简称')")
        Input(v-model='createForm.brokerName', :placeholder="$lang('请输入',$lang('券商简称'))")
      FormItem(label="Account ID")
        Input(v-model='createForm.accountId', :placeholder="$lang('子账号需要在券商端注册后才能绑定')")
</template>
<script>
export default {
  data() {
    return {
      loadingTable: true,
      listData: [],
      creatWinStatus: false,
      isInit: false,
      isBind: false,
      accountId: "",
      brokerName: "",
      searchForm: {
        pageSize: 1000,
        fromId: 0,
        lastId: 0,
        next: true
      },
      type: {
        7: this.$lang("运营账户"),
        22: this.$lang("营收账户")
      },
      createForm: {
        accountId: "",
        accountType: "7",
        brokerName: ""
      },
      columns: [
        {
          title: this.$lang("币种"),
          key: "tokenId"
        },
        {
          title: this.$lang("全称"),
          key: "tokenFullName"
        },
        {
          title: this.$lang("可用"),
          key: "available"
        },
        {
          title: this.$lang("冻结"),
          key: "locked"
        }
      ]
    };
  },
  created() {
    this.loadData();
  },
  methods: {
    change() {
      this.isInit = false;
      this.loadData();
    },
    loadData() {
      this.loadingTable = true;
      this.$axios.post("/api/v1/platform_account/assets", this.createForm).then(result => {
        if (result.code === 0) {
          this.isInit = true;
          this.loadingTable = false;
          this.listData = result.data.list;
          this.isBind = result.data.isBind;
          this.accountId = result.data.accountId;
          this.brokerName = result.data.brokerName;
        }
      });
    },
    create() {
      this.creatWinStatus = true;
      Object.assign(this.createForm, {
        brokerName: "",
        sign: "",
        brokerId: null
      });
    },
    bind() {
      this.creatWinStatus = true;
    },
    doNext() {
      this.$axios.post("/api/v1/platform_account/bind", this.createForm).then(result => {
        if (result.code === 0) {
          this.loadData();
        }
      });
    }
  }
};
</script>