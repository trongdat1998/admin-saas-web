<template lang="pug">
Main.page-exchange
  Row.search(:gutter="15")
    Col(span="20") &nbsp;
    // Col(span="4")
      // Button(type="primary", long, @click="createBonus", ghost) {{ $lang('币多多转账') }}
    Col(span="4")
      Button(
        type="primary",
        long,
        @click="create",
        ghost,
        icon="md-add-circle"
      ) {{ $lang('新建') }}
  Table.user-table(
    :loading="loadingTable",
    :columns="columns",
    :data="listData"
  )
    template(slot-scope="{row, index }", slot="type") {{ $lang(types[row.bizType]) }}
    template(slot-scope="{row, index }", slot="verifyHistories")
      template(v-if="row.status == 1")
        | {{ $lang(status[row.status]) }}：{{ $lang(row.verifyHistories.length + 1 + '级待审核') }}<br>{{ $lang('审核人') }}：{{ row.verifyUsers[row.verifyHistories.length].adminUserName }}
      template(v-else) {{ $lang(status[row.status]) }}
    template(slot-scope="{row, index }", slot="edit")
      a(@click.prevent="view(row)") {{ $lang('查看') }}
  Row(:gutter="20", style="padding-top:30px")
    Col(span="10")
      ButtonGroup
        Button(
          @click="getFirstRecordData",
          :disabled="searchForm.lastId == 0",
          icon="ios-skip-backward"
        )
        Button(
          @click="getNextRecordData",
          :disabled="listData.length < searchForm.pageSize",
          icon="ios-arrow-forward"
        )
  Modal(
    v-model="viewWin",
    width="700",
    :title="$lang(formData.id ? '查看' : '新建')",
    :mask-closable="false"
  )
    Form(:labelWidth="120")
      FormItem(:label="$lang('标题')")
        Input(
          :disabled="!!formData.id",
          v-model="formData.title",
          :placeholder="$lang('标题')"
        )
      FormItem(:label="$lang('描述')")
        Input(
          :disabled="!!formData.id",
          v-model="formData.description",
          :placeholder="$lang('描述')",
          type="textarea",
          :rows="4"
        )
      FormItem(:label="$lang('批量')")
        iSwitch(:disabled="!!formData.id", v-model="isbat")
          span(slot="open") {{ $lang('是') }}
          span(slot="close") {{ $lang('否') }}

      FormItem(:label="$lang('转出账户') + '(From)'")
        Input(
          type="textarea",
          v-model="batValue",
          :rows="10",
          v-if="isbat",
          placeholder="每行一个Aid,数据格式：[Aid],[数量],[token]"
        )
        template(v-else)
          Row(
            v-for="(item, index) in formData.transferOutAccounts",
            :key="'a' + index",
            style="margin-bottom:10px"
          )
            Col(span="8")
              Input(
                :disabled="!!formData.id",
                v-model="item.accountId",
                placeholder="accountId"
              )
            Col(span="1") &nbsp;
            Col(span="6")
              Input(
                :disabled="!!formData.id",
                v-model="item.amount",
                :placeholder="$lang('数量')",
                filterable
              )
            Col(span="1") &nbsp;
            Col(span="5")
              Select(
                :disabled="!!formData.id",
                v-model="item.tokenId",
                style="width:100%",
                filterable
              )
                Option(:value="item", :key="item", v-for="item in tokens") {{ item }}
            Col(span="1") &nbsp;
            Col(span="2", v-if="!formData.id")
              Button(
                icon="md-close",
                type="error",
                @click="remove(index)",
                long,
                ghost
              )
          Row
            Col(span="24", v-if="!formData.id")
              Button(
                icon="md-add",
                long,
                type="primary",
                @click="newOne",
                ghost
              )
      FormItem(:label="$lang('转入账户') + '(To)'")
        Input(
          :disabled="!!formData.id",
          v-model="formData.transferInAccount",
          placeholder="accountId"
        )
      template(v-for="(item, key) in errorMsg", v-if="showError")
        Alert(type="error", v-if="Array.isArray(item) && item.length") {{ errors[key] }} : {{ item.join(', ') }}
        Alert(type="error", v-if="!Array.isArray(item) && item") {{ errors[key] }} : {{ item }}

    div(slot="footer")
      Button(
        v-if="formData.id",
        @click="viewWin = false",
        :loading="loading",
        long
      ) {{ $lang('关闭') }}
      Button(
        v-else,
        type="primary",
        size="default",
        @click="submit",
        :loading="loading",
        long
      ) {{ $lang('确定') }}
  Modal(
    v-model="gaWin",
    :title="$lang(userInfo.bindGA ? '谷歌验证码' : '手机验证码')",
    class-name="vertical-center-modal",
    :mask-closable="false"
  )
    Alert(type="error", v-show="codeError") {{ $lang('验证码不正确') }}
    div(v-if="userInfo.bindGA")
      Input(v-model="formData.verifyCode", :maxlength="6", @on-keyup="keyup")
    Input(
      v-model="formData.verifyCode",
      :maxlength="6",
      @on-keyup="keyup",
      v-else
    )
      div(slot="append")
        span(v-if="time") {{ time }}s
        a(v-else, @click="getMoileCode") {{ $lang('获取验证码') }}
    template(slot="footer")
      Button(type="primary", long, @click="advPost", :loading="loading") {{ $lang('确定') }}
</template>
<script>
import { mapState } from "vuex";
export default {
  computed: {
    ...mapState(["userInfo"]),
  },
  watch: {
    time() {
      if (this.time) {
        setTimeout(() => {
          this.time--;
        }, 1000);
      }
    },
  },
  data() {
    return {
      isbat: false,
      batValue: "",
      gaWin: false,
      time: 0,
      status: {
        1: "待审核",
        2: "已通过",
        3: "已拒绝",
      },
      types: {
        1: "saas转账",
        2: "交易所修改",
        3: "券商修改",
      },
      showError: false,
      codeError: false,
      errors: {
        transferInAccountError: this.$lang("转入账号错误"),
        errorTransferOutAccounts: this.$lang("转出错误账号数组"),
        insufficientBalanceAccounts: this.$lang("转出账号余额不足列表"),
        moreBrokers: this.$lang("不允许跨券商"),
      },
      errorMsg: {
        errorTransferOutAccounts: [],
        insufficientBalanceAccounts: [],
        moreBrokers: [],
        transferInAccountError: "",
      },
      viewWin: false,
      detail: {},
      tokens: [],
      formData: {
        id: "",
        title: "",
        description: "",
        tokenId: "BTC",
        transferInAccount: "", //必填
        authType: "1", //验证类型
        verifyCode: "", //check时，此字段为空,
        moreBrokers: false,
        transferOutAccounts: [
          {
            accountId: "",
            amount: "",
            tokenId: "",
          },
        ],
      },
      searchForm: {
        lastId: 0,
        pageSize: 100,
      },
      columns: [
        {
          minWidth: 160,
          title: this.$lang("时间"),
          key: "createdAt",
          render: (h, p) => h("span", this.newDate(p.row.createdAt).format()),
        },
        {
          minWidth: 160,
          title: this.$lang("类型"),
          slot: "type",
        },
        {
          minWidth: 160,
          title: this.$lang("标题"),
          key: "title",
        },
        {
          minWidth: 160,
          title: this.$lang("申请人"),
          key: "adminUserName",
        },
        {
          minWidth: 160,
          title: this.$lang("状态"),
          slot: "verifyHistories",
        },
        {
          minWidth: 160,
          align: "right",
          title: this.$lang("操作"),
          slot: "edit",
        },
      ],
      listData: [],
      loading: false,
      loadingTable: false,
    };
  },
  methods: {
    remove(index) {
      this.formData.transferOutAccounts = this.formData.transferOutAccounts.filter(
        (el, _index) => index !== _index
      );
    },
    keyup() {
      this.codeError = false;
      this.formData.verifyCode = this.formData.verifyCode.replace(/\D/g, "");
    },
    getMoileCode() {
      !this.time &&
        this.$axios
          .post("/api/v1/user/send_saas_sms_verify_code", this.advFormItem)
          .then((result) => {
            if (result.code == 0) {
              this.time = 60;
            }
          });
    },
    newOne() {
      this.formData.transferOutAccounts.push({
        accountId: "",
        amount: "",
        tokenId: "",
      });
    },

    createBonus() {
      this.create();
      this.loading = true;
      this.$axios
        .post("/api/v1/saas_transfer/create_finance_transfer", {})
        .then((result) => {
          this.loading = false;
          if (result.code == 0) {
            Object.assign(this.formData, result.data);
          }
        });
    },

    create() {
      this.viewWin = true;
      this.batValue = false;
      Object.assign(this.formData, {
        id: "",
        title: "",
        description: "",
        tokenId: "BTC",
        transferInAccount: "", //必填
        authType: "1", //验证类型
        verifyCode: "", //check时，此字段为空,
        moreBrokers: false,
        transferOutAccounts: [
          {
            accountId: "",
            amount: "",
            tokenId: "",
          },
        ],
      });
    },
    advPost() {
      this.formData.authType = this.userInfo.bindGA ? 1 : 2;
      if (/^\d{6}$/.test(this.formData.verifyCode)) {
        this.loading = true;
        this.$axios
          .post("/api/v1/saas_transfer/create", this.formData)
          .then((result) => {
            this.loading = false;
            if (result.code == 0) {
              this.viewWin = false;
              this.gaWin = false;
              this.load();
            }
          });
      } else {
        this.codeError = true;
      }
    },
    submit() {
      if (this.isbat) {
        this.formData.transferOutAccounts = [];
        let allData = this.batValue.trim().split("\n");
        let errorLimit = [];
        if (allData.length > 100) {
          return this.$Message.error("批量处理最大支持100条");
        } else {
          allData.forEach((el, index) => {
            let arr = el.trim().split(",");
            if (arr.length == 3) {
              this.formData.transferOutAccounts.push({
                accountId: arr[0],
                amount: arr[1],
                tokenId: arr[2],
              });
            } else {
              errorLimit.push(index + 1);
            }
          });
        }
        if (errorLimit.length) {
          return this.$Message.error(
            "第" + errorLimit.join(",") + "行数据错误"
          );
        }
      }

      this.loading = true;
      this.showError = false;
      this.$axios
        .post("/api/v1/saas_transfer/check", this.formData)
        .then((result) => {
          this.loading = false;
          if (result.code == 0) {
            this.gaWin = true;
            this.formData.reqId = result.data.reqId;
          } else if (result.code == 100008) {
            this.showError = true;
            Object.assign(
              this.errorMsg,
              {
                errorTransferOutAccounts: [],
                insufficientBalanceAccounts: [],
                moreBrokers: [],
                transferInAccountError: "",
              },
              result.data
            );
          }
        });
    },
    view(row) {
      this.create();
      this.loading = true;
      this.$axios
        .post("/api/v1/saas_transfer/detail", { id: row.id })
        .then((result) => {
          this.loading = false;
          if (result.code == 0) {
            Object.assign(this.formData, result.data);
          }
        });
    },
    load() {
      this.loadingTable = true;
      this.listData = [];
      this.$axios
        .post("/api/v1/saas_transfer/record_list", this.searchForm)
        .then((result) => {
          this.loadingTable = false;
          if (result.code == 0) {
            this.listData = result.data;
          }
        });
    },
    getFirstRecordData() {
      this.searchForm.lastId = 0;
      this.load();
    },
    getNextRecordData() {
      this.searchForm.lastId = this.listData.slice(-1)[0].id;
      this.load();
    },
  },
  created() {
    this.$axios.post("/api/v1/saas_transfer/tokens", {}).then((result) => {
      if (result.code == 0) {
        this.tokens = result.data;
      }
    });
    this.load();
  },
};
</script>
