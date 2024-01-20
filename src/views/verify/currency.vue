<template lang="pug">
  Main.page-exchange
    Row.search(:gutter="15")
      Col(span="8")
        Select(v-model="searchForm.state" @on-change="load(1)")
          Option(:value="0") {{$lang("待审核")}}
          Option(:value="1") {{$lang("已通过")}}
          Option(:value="2") {{$lang("已拒绝")}}
      Col(span="4")
        Input(v-model="searchForm.token", :placeholder="$lang('输入币种ID/简称/全称')")
      Col(span="12")
        Input(v-model="searchForm.contractAddress", :placeholder="$lang('合约地址')" search,
          enter-button="",
          @on-search="load(1)")
    Table.user-table(
      :loading="loading",
      :columns="columns",
      :data="listData",
      :max-height="height - (total > searchForm.pageSize ? 370 : 315)"
    )
      template(slot-scope="{ row, index }", slot="tokenName") {{ row.tokenName }}
        Tag(v-if="row.isPrivateToken", color="primary") {{ $lang('私有') }}
      template(slot-scope="{ row }", slot="type")
        Tag(v-if="row.createAt == row.updateAt", color="success", type="border") {{ $lang('新增') }}
        Tag(v-else, type="border") {{ $lang('更新') }}
    .page-pages(v-if="total > searchForm.pageSize")
      Page(:page-size="searchForm.pageSize", :total="total", @on-change="load")
    Modal(
      v-model="addWin",
      :title="$lang('上币申请')",
      width="1000",
      :mask-closable="false"
    )
      Form(:model="formData", :labelWidth="160")
        FormItem(:label="$lang('代币类型')")
          Select(v-model="formData.tokenType", size="default")
            Option(v-for="(item, key) in tokenTypes", :key="key", :value="~~key") {{ item }}
        Divider {{ $lang('基础配置') }}
        FormItem(:label="$lang('币种ID')")
          Input(size="default", v-model="formData.tokenId")
        FormItem(:label="$lang('币种简称')")
          Input(size="default", v-model="formData.tokenName")
        FormItem(:label="$lang('币种全称')")
          Input(size="default", v-model="formData.tokenFullName")
          Alert(
            type="error",
            v-if="tokenDetail.tokenId && tokenDetail.tokenFullName != rowData.tokenFullName"
          ) {{ $lang('修改前') }}：{{ tokenDetail.tokenFullName }}
        FormItem(:label="$lang('公允价值')")
          Input(
            size="default",
            v-model="formData.fairValue",
            :placeholder="$lang('token的市场价值')"
          )
            span(slot="append") USDT
          Alert(
            type="error",
            v-if="tokenDetail.tokenId && tokenDetail.fairValue != rowData.fairValue"
          ) {{ $lang('修改前') }}：{{ tokenDetail.fairValue }}
        FormItem(:label="$lang('标识')")
          Input(size="default", v-model="formData.iconUrl")
            Upload(
              slot="suffix",
              action="/api/v1/broker_token/icon",
              name="uploadFile",
              :on-success="uploadSuccess",
              :beforeUpload="beforeUpload",
              :data="{ label: 'wechat' }",
              :show-upload-list="false"
            )
              Icon(type="md-cloud-upload", v-show="!spinShow")
              Icon.spin-icon-load(type="ios-loading", v-show="spinShow")
          Alert(
            type="error",
            v-if="tokenDetail.tokenId && tokenDetail.iconUrl != rowData.iconUrl"
          )
            Row(style="text-align:center;padding-top:10px")
              Col(span="10")
                img(width="50", :src="tokenDetail.iconUrl")
              Col(span="2")
                Icon(type="md-arrow-round-forward", size="30")
              Col(span="10")
                img(width="50", :src="rowData.iconUrl")
        FormItem(:label="$lang('合约地址')", v-if="formData.tokenType != 1")
          Input(
            size="default",
            v-model="formData.contractAddress",
            placeholder="contractAddress"
          )
            span(slot="append")
              a(
                :href="'https://etherscan.io/address/' + formData.contractAddress",
                target="_blank",
                v-if="formData.contractAddress && formData.tokenType == 2"
              ) {{ $lang('查看') }}
          Alert(
            type="error",
            v-if="tokenDetail.tokenId && tokenDetail.contractAddress != rowData.contractAddress"
          ) {{ $lang('修改前') }}：{{ tokenDetail.contractAddress }}
        FormItem(:label="$lang('白皮书地址')")
          Input(
            size="default",
            v-model="formData.whitePaperUrl",
            placeholder="whitePaperUrl"
          )
            span(slot="append")
              a(
                :href="tokenDetail.whitePaperUrl",
                target="_blank",
                v-if="tokenDetail.whitePaperUrl"
              ) {{ $lang('查看') }}
          Alert(
            type="error",
            v-if="tokenDetail.tokenId && tokenDetail.whitePaperUrl != rowData.whitePaperUrl"
          ) {{ $lang('修改前') }}：{{ tokenDetail.whitePaperUrl }}

        FormItem(:label="$lang('官网')")
          Input(
            size="default",
            v-model="formData.officialWebsiteUrl",
            placeholder="officialWebsiteUrl"
          )
            span(slot="append")
              a(
                :href="tokenDetail.officialWebsiteUrl",
                target="_blank",
                v-if="tokenDetail.officialWebsiteUrl"
              ) {{ $lang('查看') }}
          Alert(
            type="error",
            v-if="tokenDetail.tokenId && tokenDetail.officialWebsiteUrl != rowData.officialWebsiteUrl"
          ) {{ $lang('修改前') }}：{{ tokenDetail.officialWebsiteUrl }}
        FormItem(:label="$lang('当前流通量')")
          Input(
            size="default",
            v-model="formData.currentTurnover",
            placeholder="currentTurnover"
          )
          Alert(
            type="error",
            v-if="tokenDetail.tokenId && tokenDetail.currentTurnover != rowData.currentTurnover"
          ) {{ $lang('修改前') }}：{{ tokenDetail.currentTurnover }}
        FormItem(:label="$lang('最大发行量')")
          Input(
            size="default",
            v-model="formData.maxQuantitySupplied",
            placeholder="maxQuantitySupplied"
          )
          Alert(
            type="error",
            v-if="tokenDetail.tokenId && tokenDetail.maxQuantitySupplied != rowData.maxQuantitySupplied"
          ) {{ $lang('修改前') }}：{{ tokenDetail.maxQuantitySupplied }}
        FormItem(:label="$lang('发行时间')")
          DatePicker(
            type="date",
            :value="formData.publishTime",
            placeholder="publishTime",
            @on-change="changeTime",
            style="width:100%",
            size="default"
          )
          Alert(
            type="error",
            v-if="tokenDetail.tokenId && tokenDetail.publishTime != rowData.publishTime"
          ) {{ $lang('修改前') }}：{{ tokenDetail.publishTime }}
        Divider {{ $lang('token介绍') }}
        Alert
          Checkbox(
            v-for="(item, index) in introductions",
            v-model="item.enable",
            :key="index"
          ) {{ languages[item.language] }}
        Alert(type="error", v-if="tokenDetail.tokenId") {{ $lang('修改前选中语言') }}：
          Tag(
            v-for="item in tokenDetail.introductions",
            v-if="item.enable",
            :key="item.language",
            color="error"
          ) {{ languages[item.language] }}
        FormItem(
          :label="languages[item.language]",
          v-for="(item, index) in introductions",
          :key="'a' + index",
          v-if="item.enable"
        )
          Input(:rows="6", v-model="item.content", type="textarea")
          Alert(
            type="error",
            v-if="tokenDetail.tokenId && item.content != beforeContet(item.language)"
          ) {{ $lang('修改前') }}：{{ beforeContet(item.language) }}
        Divider {{ $lang('充值/提现配置') }}
        FormItem(:label="$lang('最小充币数量')")
          Input(
            size="default",
            v-model="formData.minDepositingAmt",
            :placeholder="$lang('充币资产价值不能小于15$')"
          )
            span(slot="append") {{ formData.tokenName }}
          Alert(
            type="error",
            v-if="tokenDetail.tokenId && tokenDetail.minDepositingAmt != rowData.minDepositingAmt"
          ) {{ $lang('修改前') }}：{{ tokenDetail.minDepositingAmt }}
        FormItem(:label="$lang('最小提币数量')")
          Input(
            size="default",
            v-model="formData.minWithdrawingAmt",
            :placeholder="$lang('提币资产价值不能小于15$')"
          )
            span(slot="append") {{ formData.tokenName }}
          Alert(
            type="error",
            v-if="tokenDetail.tokenId && tokenDetail.minWithdrawingAmt != rowData.minWithdrawingAmt"
          ) {{ $lang('修改前') }}：{{ tokenDetail.minWithdrawingAmt }}
        FormItem(:label="$lang('平台提币手续费')")
          Input(size="default", v-model="formData.platformFee")
            Select(
              size="default",
              v-model="formData.feeToken",
              slot="append",
              style="width: 80px"
            )
              Option(:value="0", v-if="formData.tokenType === 2") ETH
              Option(:value="1", v-if="formData.tokenType === 4") EOS
              Option(:value="3", v-if="formData.tokenType === 10") TRX
              Option(:value="2") {{ formData.tokenName }}
        Divider {{ $lang('其他') }}
        FormItem(:label="$lang('链上确认数')")
          Input(size="default", v-model="formData.confirmCount")
        FormItem(:label="$lang('可提现确认数')")
          Input(size="default", v-model="formData.canWithdrawConfirmCount")
        FormItem(:label="$lang('币种支持精度')")
          Input(
            size="default",
            v-model="formData.minPrecision",
            :placeholder="$lang('填写整数')"
          )
        FormItem(:label="$lang('交易哈希查询地址')")
          Input(size="default", v-model="formData.exploreUrl")
        //- FormItem(:label="$lang('是否需要TAG')")
        //-   iSwitch(size="default" v-model='formData.needTag' :true-value="1" :false-value="0")
        FormItem(:label="$lang('状态')")
          span {{ $lang('Bass') }}&nbsp;
          iSwitch(size="default", v-model="formData.isBaas" @on-change="changeBass")
          span &nbsp;&nbsp;{{ $lang('私有币种') }}&nbsp;
          iSwitch(size="default", v-model="formData.isPrivateToken" @on-change="changePrivate")
          span &nbsp;&nbsp;{{ $lang('测试') }}&nbsp;
          iSwitch(size="default", v-model="formData.isTest")
          span &nbsp;&nbsp;{{ $lang('聚合') }}&nbsp;
          iSwitch(size="default", v-model="formData.isAggregate")
      div(slot="footer")
        Row(v-if="searchForm.state == 0", :gutter="20")
          Col(span="12")
            Button(
              style="margin-bottom:15px",
              long,
              type="error",
              size="default",
              @click="handleVerify(2)",
              :loading="loading"
            ) {{ $lang('拒绝') }}
          Col(span="12")
            Button(
              long,
              type="success",
              size="default",
              @click="handleVerify(1)",
              :loading="loading"
            ) {{ $lang('通过') }}
        template(v-if="searchForm.state == 1")
          Button(
            type="primary",
            size="default",
            @click="handleVerify(1)",
            :loading="loading",
            long
          ) {{ $lang('确定') }}
</template>
<script>
import { mapState } from "vuex";
export default {
  computed: {
    ...mapState(["languages", "height"]),
  },
  created() {
    this.$axios
      .post("/api/v1/broker/query_simple_brokers", {})
      .then((result) => {
        if (result.data && result.data.length) {
          this.brokerList = result.data;
        }
      });
    this.load();
  },
  data() {
    return {
      brokerList: [],
      editIndex: null,
      editForm: {
        tokenId: "",
        brokerId: 0,
        toBrokerId: 0,
      },
      tokenTypes: {
        1: this.$lang("主网代币"),
        2: this.$lang("ETH代币"),
        4: this.$lang("EOS代币"),
        10: this.$lang("TRX代币"),
        11: this.$lang("NEO代币"),
        12: this.$lang("HECO代币"),
        13: this.$lang("BSC代币"),
        14: this.$lang("SPL代币"),
        15: this.$lang("CHZ链代币"),
        16: this.$lang("CCHAIN链代币"),
      },
      total: 0,
      searchForm: {
        brokerId: "",
        token: "",
        contractAddress: "",
        current: 1,
        pageSize: 100,
        state: 0,
      },
      addWin: false,
      tokenDetail: {},
      introductions: [],
      rowData: {},
      formData: {
        needTag: 0,
        isPrivateToken: false,
        isBaas: false,
        isAggregate: false,
        isTest: false,
      },
      loading: false,
      listData: [],
      spinShow: false,
      columns: [
        {
          type: "index",
          width: 60,
          align: "center",
        },
        {
          minWidth: 160,
          title: this.$lang("时间"),
          key: "updateAt",
          render: (h, p) => {
            return h("span", this.newDate(p.row.updateAt).format());
          },
        },
        {
          minWidth: 120,
          title: this.$lang("券商简称"),
          key: "orgName",
          ellipsis: true,
        },

        {
          minWidth: 120,
          title: this.$lang("券商ID"),
          key: "brokerId",
        },
        {
          minWidth: 120,
          title: this.$lang("币种ID"),
          key: "tokenId",
        },
        {
          minWidth: 160,
          title: this.$lang("币种简称"),
          slot: "tokenName",
        },
        {
          minWidth: 120,
          title: this.$lang("币种全称"),
          key: "tokenFullName",
          ellipsis: true,
        },
        {
          minWidth: 100,
          title: this.$lang("图标"),
          render: (h, params) => {
            return h("img", {
              attrs: {
                src: params.row.iconUrl,
                width: 20,
              },
            });
          },
        },
        {
          minWidth: 280,
          title: this.$lang("合约地址"),
          key: "contractAddress",
          ellipsis: true,
        },

        {
          align: "center",
          fixed: "right",
          minWidth: 90,
          title: this.$lang("类型"),
          slot: "type",
        },

        {
          minWidth: 80,
          title: this.$lang("操作"),
          align: "center",
          fixed: "right",
          render: (h, params) => {
            return h(
              "a",
              {
                on: {
                  click: () => {
                    this.verify(params.row);
                  },
                },
              },
              this.$lang(this.searchForm.state == 0 ? "审核" : "查看")
            );
          },
        },
      ],
    };
  },
  methods: {
    beforeContet(language) {
      let str = "";
      this.tokenDetail.introductions.forEach((el) => {
        if (el.language == language) {
          str = el.content;
        }
      });
      return str;
    },
    editExchangeId(row, index) {
      this.editForm.brokerId = row.brokerId;
      this.editForm.toBrokerId = row.brokerId;
      this.editForm.tokenId = row.tokenId;
      this.editIndex = index;
    },

    submitEditExchangeId() {
      this.$axios
        .post("/api/v1/broker_token/change_token_apply_broker", this.editForm)
        .then((result) => {
          if (result.code == 0) {
            this.$Notice.success({
              title: this.$lang("请求成功"),
            });
            this.load(this.searchForm.current);
            this.editIndex = null;
          }
        });
    },
    initFormData() {
      this.introductions = [];

      Object.keys(this.languages).forEach((el) => {
        this.introductions.push({
          content: "",
          language: el,
          enable: el === this.$i18n.locale,
        });
      });
    },
    getTokenDetail(row) {
      return this.$axios.get("/api/v1/broker_token/detail", {
        params: {
          tokenId: row.tokenId,
          brokerId: row.brokerId,
        },
      });
    },

    getNewTokenDetail(row) {
      return this.$axios.get("/api/v1/broker_token/application", {
        params: {
          tokenId: row.tokenId,
          brokerId: row.brokerId,
        },
      });
    },

    changeTime(date) {
      this.formData.publishTime = date;
    },
    verify(row) {
      this.$axios
        .all([this.getTokenDetail(row), this.getNewTokenDetail(row)])
        .then((res) => {
          if (res[0] && res[1] && res[0].code == 0 && res[1].code == 0) {
            this.$set(this, "tokenDetail", Object.assign({}, res[0].data));
            this.$set(this, "formData", Object.assign({}, res[1].data));
            this.$set(this, "rowData", res[1].data);
            this.initFormData();
            res[1].data.introductions.forEach((el) => {
              this.introductions.forEach((_el) => {
                if (el.language == _el.language) {
                  Object.assign(_el, el);
                }
              });
            });
            this.addWin = true;
          }
        });
    },
    uploadSuccess(result) {
      this.spinShow = false;
      if (result.code != 0) {
        return;
      }
      this.$Notice.success({
        title: this.$lang("成功"),
      });
      this.formData.iconUrl = result.data.url;
    },
    beforeUpload() {
      this.spinShow = true;
    },

    openStatus() {
      this.$axios
        .post("/api/v1/exchange_token/allow_show", this.formData)
        .then((result) => {
          if (result.code == 0) {
            this.$Notice.success({
              title: this.$lang("成功为商家开启" + this.formData.tokenId),
            });
          }
        });
    },
    changeBass(ret) {
      if (ret) {
        this.formData.isPrivateToken = ret;
      }
    },
    changePrivate(ret) {
      if (!ret) {
        this.formData.isBaas = ret;
      }
    },
    handleVerify(state) {
      let json = {
        curState: this.formData.state,
        toState: state,
      };
      this.formData.introductions = this.introductions;
      !this.loading &&
        this.$axios
          .post(
            "/api/v1/broker_token/apply_audit",
            Object.assign(Object.assign({}, this.formData), json)
          )
          .then((result) => {
            this.loading = false;
            if (result.code === 0) {
              this.addWin = false;
              if (state == 1) {
                this.openStatus();
              }
              this.load();
            }
          });
      this.loading = true;
    },
    load(page = 1) {
      this.loading = true;
      this.searchForm.current = page;
      this.$axios
        .post("/api/v1/broker_token/apply_list", this.searchForm)
        .then((result) => {
          this.loading = false;
          this.listData = result.data.list ? result.data.list : [];
          this.total = result.data.total;
        });
    },
  },
};
</script>
