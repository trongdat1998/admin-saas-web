<template lang="pug">
  Main.page-exchange
    Row.search(:gutter="15")
      Col(span="8")
        Select(v-model="searchForm.state" @on-change="load(1)")
          Option(:value="0") {{$lang("待审核")}}
          Option(:value="1") {{$lang("已通过")}}
          Option(:value="2") {{$lang("已拒绝")}}
      Col(span="16")
        Input(
          v-model="searchForm.symbol",
          :placeholder="$lang('输入币对ID')",
          search,
          enter-button="",
          @on-search="load(1)"
        )
    Table.user-table(
      :loading="loading",
      :columns="columns",
      :data="listData",
      :max-height="height - (total > searchForm.pageSize ? 270 : 215)"
    )
    .page-pages(v-if="total > searchForm.pageSize")
      Page(:page-size="searchForm.pageSize", :total="total", @on-change="load")
    Modal(
      v-model="addWin",
      :title="$lang('上币申请')",
      width="800",
      :mask-closable="false"
    )
      Form(:model="formData", :labelWidth="120")
        FormItem(:label="$lang('币对')")
          Tag {{ formData.baseToken }} / {{ formData.quoteToken }}
        FormItem(:label="$lang('价格精度')")
          Input(
            size="default",
            v-model="formData.minPricePrecision",
            placeholder="minPricePrecision"
          )
            span(slot="append") {{ formData.quoteToken }}
          div {{ $lang('最小价格精度建议不大于8位。示例：0.01') }}
          Alert(
            type="error",
            v-if="tokenDetail.symbolId && tokenDetail.minPricePrecision != rowData.minPricePrecision"
          ) 修改前：{{ tokenDetail.minPricePrecision }}
        FormItem(:label="$lang('数量精度')")
          Input(
            size="default",
            v-model="formData.basePrecision",
            placeholder="basePrecision"
          )
            span(slot="append") {{ formData.baseToken }}
          div {{ $lang('挂单数量的精度，同时用于市价卖单；撮合最小成交量。示例：0.01') }}
          Alert(
            type="error",
            v-if="tokenDetail.symbolId && tokenDetail.basePrecision != rowData.basePrecision"
          ) 修改前：{{ tokenDetail.basePrecision }}
        FormItem(:label="$lang('最小交易数量')")
          Input(
            size="default",
            v-model="formData.minTradeQuantity",
            placeholder="minTradeQuantity"
          )
            span(slot="append") {{ formData.baseToken }}
          div {{ $lang('挂单数量的最小数量，最小数量控制在0.5$附近。示例：0.01') }}
          Alert(
            type="error",
            v-if="tokenDetail.symbolId && tokenDetail.minTradeQuantity != rowData.minTradeQuantity"
          ) 修改前：{{ tokenDetail.minTradeQuantity }}
        FormItem(:label="$lang('交易额精度')")
          Input(
            size="default",
            v-model="formData.quotePrecision",
            placeholder="quotePrecision"
          )
            span(slot="append") {{ formData.quoteToken }}
          div {{ $lang('交易额的精度，仅市价买单使用。示例：0.01') }}
          Alert(
            type="error",
            v-if="tokenDetail.symbolId && tokenDetail.quotePrecision != rowData.quotePrecision"
          ) 修改前：{{ tokenDetail.quotePrecision }}
        FormItem(:label="$lang('最小交易额')")
          Input(
            size="default",
            v-model="formData.minTradeAmt",
            placeholder="minTradeAmount"
          )
            span(slot="append") {{ formData.quoteToken }}
          div {{ $lang('只限制市价买单最小交易额。示例：0.01') }}
          Alert(
            type="error",
            v-if="tokenDetail.symbolId && tokenDetail.minTradeAmt != rowData.minTradeAmt"
          ) 修改前：{{ tokenDetail.minTradeAmt }}
        FormItem(:label="$lang('深度合并')")
          Input(
            size="default",
            v-model="formData.mergeDigitDepth",
            :placeholder="$lang('多个深度合并，用逗号分隔')"
          )
          Alert(
            type="error",
            v-if="tokenDetail.symbolId && tokenDetail.mergeDigitDepth != rowData.mergeDigitDepth"
          ) 修改前：{{ tokenDetail.mergeDigitDepth }}
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
        total: 0,
        searchForm: {
          current: 1,
          pageSize: 100,
          state: 0,
          brokerId: "",
          symbol: "",
        },
        editIndex: null,
        editForm: {
          symbolId: "",
          brokerId: 0,
          toBrokerId: 0,
        },
        addWin: false,
        tokenDetail: {},
        rowData: {},
        formData: {},
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
            minWidth: 160,
            title: this.$lang("券商简称"),
            key: "orgName",
          },

          {
            minWidth: 160,
            title: this.$lang("券商ID"),
            key: "brokerId",
          },
          {
            minWidth: 160,
            title: this.$lang("币对名称"),
            render: (h, params) => {
              return h(
                "span",
                params.row.baseToken + "/" + params.row.quoteToken
              );
            },
          },
          {
            minWidth: 80,
            title: this.$lang("操作"),
            fixed: "right",
            align: "center",
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
      editBrokerId(row, index) {
        this.editForm.brokerId = row.brokerId;
        this.editForm.toBrokerId = row.brokerId;
        this.editForm.symbolId = row.symbolId;
        this.editIndex = index;
      },

      submitEditBrokerId() {
        this.$axios
          .post("/api/v1/broker_symbol/change/broker", this.editForm)
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
      verify(row) {
        this.$axios
          .get("/api/v1/broker_symbol/detail", {
            params: {
              symbolId: row.symbolId,
            },
          })
          .then((result) => {
            this.$set(this, "tokenDetail", Object.assign({}, result.data));
            this.$set(this, "formData", Object.assign({}, result.data));
            this.$set(this, "rowData", row);

            // this.tokenDetail = Object.assign({},result.data)
            // this.formData = Object.assign({},result.data)
            // this.rowData = row
            Object.assign(this.formData, row);
            this.addWin = true;
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
        this.formData.icoUrl = result.data.url;
      },
      beforeUpload() {
        this.spinShow = true;
      },
      openStatus() {
        this.$axios
          .post("/api/v1/exchange_symbol/allow_show", this.formData)
          .then((result) => {
            if (result.code == 0) {
              this.$Notice.success({
                title: this.$lang("成功为商家开启" + this.formData.symbolId),
              });
            }
          });
      },

      handleVerify(state) {
        let json = {
          curState: this.formData.state,
          toState: state,
        };

        !this.loading &&
        this.$axios
          .post(
            "/api/v1/broker_symbol/application/audit",
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
          .post("/api/v1/broker_symbol/application/list", this.searchForm)
          .then((result) => {
            this.loading = false;
            this.listData = result.data.list ? result.data.list : [];
            this.total = result.data.total;
          });
      },
    },
  };
</script>
