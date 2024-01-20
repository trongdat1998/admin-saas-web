<style lang="less" scoped>
.item {
  background: #f8f8f8;
  margin-bottom: 15px;
  overflow: hidden;
  padding: 20px;
  padding-bottom: 0;
  border-radius: 3px;
}
</style>
<template lang="pug">
Main.page-exchange
  Row.search(:gutter="15")
    Col(span="8")
      Select(v-model="searchForm.state" @on-change="load(1)")
        Option(:value="0") {{$lang("待审核")}}
        Option(:value="1") {{$lang("已通过")}}
        Option(:value="2") {{$lang("已拒绝")}}
    Col(span="13") &nbsp;
    Col(span="3")
  Table.user-table(:loading="loading" :columns="columns", :data="listData")
  Modal(v-model="createWin" width="900")
    Form(:labelWidth="120")
      Divider {{$lang('指数信息')}}
      Row(:gutter="40")
        Col(span="12")
          FormItem(:label="$lang('指数名称-展示')")
            Input(v-model="formData.displayIndexToken")
        Col(span="12")
          FormItem(:label="$lang('指数名称-强平')")
            Input(v-model="formData.indexToken")
      Row(:gutter="40")
        Col(span="24")
          Divider {{$lang('基本信息')}}
          FormItem(:label="$lang('合约名称')")
            Alert
              Checkbox(v-for="(item,index) in formData.symbolNameLocaleList", v-model="item.enable" :key="index") {{languages[item.locale]}}
        Col(span="12")
          FormItem(:label="$lang('合约类型')")
            RadioGroup(v-model="formData.isReverse" border)
              Radio(:label="0") {{$lang("正向合约")}}
              Radio(:label="1") {{$lang("反向合约")}}
          FormItem(:label="$lang('标的名称')")
            Input(v-model="formData.displayUnderlyingId")
          FormItem(:label="$lang('计价单位')")
            Input(v-model="formData.currency")
        Col(span="12")
          FormItem(:label="$lang('合约名称')" v-for="item in formData.symbolNameLocaleList" v-if="item.enable" :key="item.locale")
            Input(v-model="item.name" :placeholder="$lang('合约名称') + '(' + languages[item.locale] + ')' ")
          FormItem(:label="$lang('合约ID')")
            Input(v-model="formData.newSymbolId" :placeholder="$lang('合约ID')")
      Row(:gutter="40")
        Col(span="12")
          Divider {{$lang('详细配置')}}
          FormItem(:label="$lang('最小交易量')")
            Input(v-model="formData.minTradeQuantity")
          FormItem(:label="$lang('数量精度')")
            Input(v-model="formData.basePrecision")
          FormItem(:label="$lang('价格精度')")
            Input(v-model="formData.minPricePrecision")
          FormItem(:label="$lang('保证金精度')")
            Input(v-model="formData.marginPrecision")

          FormItem(:label="$lang('合约乘数')")
            Input(v-model="formData.contractMultiplier")
          FormItem(:label="$lang('合并深度')")
            Input(v-model="formData.digitMergeList" :placeholder="$lang('用逗号分隔')")
            div {{$lang('例如')}} 0.01,0.001,0.0001
          FormItem(:label="$lang('杠杆范围')" :placeholder="$lang('用逗号分隔')")
            Input(v-model="formData.leverageRange")
            div {{$lang('例如')}} 5,10,20
          FormItem(:label="$lang('超价浮动范围')")
            Row
              Col(span="11")
                Input(v-model="formData.overPriceUpRange")
                  span(slot="prepend") -
                  span(slot="append") %
              Col(span="2" style="text-align:center") -
              Col(span="11")
                Input(v-model="formData.overPriceDownRange" width="100%")
                  span(slot="prepend") +
                  span(slot="append") %
          FormItem(:label="$lang('市价浮动范围')")
            Row
              Col(span="11")
                Input(v-model="formData.marketPriceUpRange")
                  span(slot="prepend") -
                  span(slot="append") %
              Col(span="2" style="text-align:center") -
              Col(span="11")
                Input(v-model="formData.marketPriceDownRange" width="100%")
                  span(slot="prepend") +
                  span(slot="append") %
        Col(span="12")
          Divider {{$lang('风险限额')}}
          .item(v-for="item,index in formData.riskLimitList")
            FormItem(:label="$lang('基本风险限额')")
              Input(v-model="item.riskLimitAmount")
                span(slot="append") {{$lang('张')}}
            FormItem(:label="$lang('递增维持保证金')")
              Input(v-model="item.maintainMargin")
                span(slot="append") %
            FormItem(:label="$lang('递增起始保证金')")
              Input(v-model="item.initialMargin")
                span(slot="append") %
            FormItem(:label="$lang('最大杠杆')")
              Input(:value="daoshu(item.initialMargin)" readonly)
                span(slot="append") M
            FormItem
              Button(type="error" size="small" long @click="removeRisk(index)") {{$lang('删除')}}
          Button(@click="addRisk" long size="small") {{$lang('新增')}}
    div(slot="footer")
      Row(v-if="searchForm.state==0" :gutter="20")
        Col(span="12")
          Button(style="margin-bottom:15px" long type="error" size="default" @click="handleVerify(2)" :loading="loading") {{$lang('拒绝')}}
        Col(span="12")
          Button(long type="success" size="default" @click="handleVerify(1)" :loading="loading") {{$lang('通过')}}
      template(v-if="searchForm.state==1")
        Button(type="primary" size="default" @click="handleVerify(1)" :loading="loading" long) {{$lang('确定')}}
</template>
<script>
import { mapState } from "vuex";
export default {
  computed: {
    ...mapState(["lang", "languages"])
  },
  data() {
    return {
      createWin: false,
      searchForm: {
        current: 1,
        pageSize: 1000,
        state: 0,
      },
      columns: [
        {
          minWidth: 160,
          title: this.$lang("时间"),
          key: "createdAt",
          sortable: true,
          sortType: "desc",
          render: (h, p) => {
            return h("span", this.newDate(p.row.createdAt).format());
          }
        },
        {
          minWidth: 160,
          title: this.$lang("券商简称"),
          key: "brokerName"
        },

        {
          minWidth: 100,
          title: this.$lang("券商ID"),
          key: "brokerId"
        },
         {
          minWidth: 160,
          title: this.$lang("合约ID"),
          key: "symbolId"
        },
        {
          title: this.$lang("合约名称"),
          minWidth: 160,
          key: "symbolName",
          render: (h, params) => {
            let text = ""
            params.row.symbolNameLocaleList.filter(el=>{
              if(!text&&el.locale ==="en-us"){
                text = el.name
              }
              if(el.locale == this.$i18n.locale){
                text = el.name
              }
            })
            return h("span",text)
          }
        },
        // {
        //   title: this.$lang("合约类型"),
        //   minWidth: 160,
        //   render: (h, params) => {
        //     if (params.row.isReverse === 0) {
        //       return h("span", this.$lang("正向合约"));
        //     } else {
        //       return h("span", this.$lang("反向合约"));
        //     }
        //   }
        // },
        {
          minWidth: 120,
          title: this.$lang("状态"),
          key: "state",
          render: (h, params) => {
            let color = "default";
            let text = "申请中";
            if (params.row.state === 1) {
              color = "primary";
              text = "已通过";
            } else if (params.row.state === 2) {
              color = "error";
              text = "已拒绝";
            }
            return h(
              "Tag",
              {
                attrs: {
                  color
                }
              },
              this.$lang(text)
            );
          }
        },
        {
          minWidth: 80,
          title: this.$lang("操作"),
          fixed: "right",
          render: (h, params) => {
            return h(
              "a",
              {
                on: {
                  click: () => {
                    this.newOne();
                    let symbolNameLocaleList = [];

                    this.formData.symbolNameLocaleList.forEach(el => {
                      let temp = params.row.symbolNameLocaleList.filter(
                        _el => el.locale == _el.locale
                      );

                      if (temp.length) {
                        temp[0].enable = temp[0].name ? true : false;
                        symbolNameLocaleList.push(Object.assign(el, temp[0]));
                      } else {
                        symbolNameLocaleList.push(el);
                      }
                    });

                    Object.assign(this.formData, params.row, {
                      symbolNameLocaleList: symbolNameLocaleList
                    });

                    this.formData.newSymbolId = params.row.symbolId

                  }
                }
              },
              this.$lang(params.row.state == 0 ? "审核" : "查看")
            );
          }
        }
      ],
      listData: [],
      loading: false,
      formData: {
        id: "",
        state: "",
        newSymbolId:"",
        displayIndexToken:"",
        indexToken:"",
        minTradeAmount: "",
        displayUnderlyingId: "",
        minTradeQuantity: "",
        digitMergeList: "",
        basePrecision: "",
        minPricePrecision: "",
        currency: "",
        contractMultiplier: "",
        leverageRange: "",
        overPriceUpRange: "",
        overPriceDownRange: "",
        marketPriceDownRange: "",
        marketPriceUpRange: "",
        isPerpetualSwap: 1,
        isReverse: 1,
        marginPrecision: "",
        symbolNameLocaleList: [],
        riskLimitList: []
      }
    };
  },
  methods: {
    addRisk() {
      this.formData.riskLimitList.push({
        riskLimitAmount: "",
        maintainMargin: "",
        initialMargin: ""
      });
    },
    removeRisk(index) {
      this.formData.riskLimitList = this.formData.riskLimitList.filter(
        (el, _index) => index != _index
      );
    },
    newOne() {
      this.createWin = true;
      Object.assign(this.formData, {
        id: "",
        state: "",
        displayIndexToken:"",
        indexToken:"",
        minTradeAmount: "",
        displayUnderlyingId: "",
        minTradeQuantity: "",
        digitMergeList: "",
        basePrecision: "",
        minPricePrecision: "",
        currency: "",
        contractMultiplier: "",
        leverageRange: "",
        overPriceUpRange: "",
        overPriceDownRange: "",
        marketPriceDownRange: "",
        marketPriceUpRange: "",
        isPerpetualSwap: 1,
        isReverse: 1,
        marginPrecision: "",
        symbolNameLocaleList: [],
        riskLimitList: []
      });

      Object.keys(this.lang).forEach(el => {
        if (el != "ko-kr") {
          this.formData.symbolNameLocaleList.push({
            locale: el,
            name: "",
            enable: el === this.$i18n.locale
          });
        }
      });
    },
    daoshu(n) {
      return n ? 100 / n : 0;
    },
    handleVerify(state) {
      let json = {
        curState: this.formData.state,
        toState: state
      };
      this.formData.introductions = this.introductions
      !this.loading &&
        this.$axios
          .post(
            "/api/v1/exchange_swap/application/audit",
            Object.assign(Object.assign({}, this.formData), json)
          )
          .then(result => {
            this.loading = false;
            if (result.code === 0) {
              this.createWin = false
              this.load();
            }
          });
      this.loading = true;
    },
    load() {
      this.$axios
        .post("/api/v1/exchange_swap/application/list", this.searchForm)
        .then(result => {
          if (result.code == 0) {
            this.listData = result.data.list;
          }
        });
    }
  },
  created() {
    this.load();
  }
};
</script>
