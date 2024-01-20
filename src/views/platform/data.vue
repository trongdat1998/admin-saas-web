<template lang="pug">
Main.page-exchange
  Row.search(:gutter="15")
    Col(span="4")
      Select(
        v-model="searchForm.orgId",
        style="width:100%",
        filterable,
        @on-change="search"
      )
        Option(value="21") 21
        Option(
          v-for="item in brokers",
          :value="item.brokerId",
          :key="item.brokerId"
        ) {{ item.brokerId }}-{{ item.name }}
    Col(span="4")
      Select(v-model="searchForm.category")
        Option(value="1") {{ $lang('币币账户') }}
        Option(value="4") {{ $lang('合约账户') }}
    Col(span="4")
      Select(v-model="searchForm.businessSubject")
        Option(v-for="(item, key) in typeList", :value="key * 1", :key="key") {{ item }}
    //- Col(span="4")
    //-   Select(v-model="searchForm.tokenId" filterable)
    //-     Option(v-for="item,index in tokens", :value="item.tokenId", :key="index") {{item.tokenName}}
    Col(span="12")
      Input(
        search,
        :placeholder="`${$lang('用户ID')} / ${$lang('用户手机')} / ${$lang('用户邮箱')}`",
        v-model="inputInfo",
        enter-button="",
        @on-search="search"
      )
  Table(:columns="columns", :data="listData", :loading="loading")
  Row.page-pages(v-show="searchForm.hasMore")
    Col(span="10") &nbsp;
    Col(span="4")
      Button(long, @click="more", type="primary", ghost) {{ $lang('点击加载更多') }}
    Col(span="10") &nbsp;
</template>
<script>
import { formatParams } from '@/libs/common.js'
import { mapState } from 'vuex'
export default {
  computed: {
    ...mapState(['tokens']),
  },
  data() {
    return {
      brokers: [],
      searchForm: {
        orgId: '',
        category: '1',
        tokenId: '',
        userId: '',
        phone: '',
        email: '',
        fromId: 0,
        pageSize: 100,
        next: true,
        businessSubject: 0,
        hasMore: false,
      },
      inputInfo: this.$route.query.userId || '',
      loading: false,

      typeList: {
        0: this.$lang('全部'),
        1: this.$lang('交易'),
        2: this.$lang('交易手续费'),
        3: this.$lang('转账'),
        4: this.$lang('充值'),
        14: this.$lang('手续费收入'),
        21: this.$lang('资金归集'),
        22: this.$lang('清算费'),
        23: this.$lang('系统成本'),
        24: this.$lang('SAAS费'),
        25: this.$lang('佣金'),
        26: this.$lang('营收'),
        27: this.$lang('maker奖励'),
        28: this.$lang('期货等的盈亏'),
        30: this.$lang('交割'),
        31: this.$lang('强平'),
        32: this.$lang('期货等的资金费率结算'),
        33: this.$lang('提现实际打出去的值'),
        34: this.$lang('托管平台收取的手续费'),
        35: this.$lang('券商收取的手续费'),
        36: this.$lang('券商给的兑换'),
        37: this.$lang('为得到券商给的兑换所付出的值'),
        38: this.$lang('实际支付的矿工费'),
        39: this.$lang('ROLLBACK 提现实际打出去的值'),
        40: this.$lang('ROLLBACK 托管平台收取的手续费'),
        41: this.$lang('ROLLBACK 券商收取的手续费'),
        42: this.$lang('ROLLBACK 券商给的兑换'),
        43: this.$lang('ROLLBACK 为得到券商给的兑换所付出的值'),
        44: this.$lang('ROLLBACK 实际支付的矿工费'),
        45: this.$lang('券商给的兑换，把兑换归还给券商'),
        46: this.$lang('手续费收入'),
        47: this.$lang('用户借的矿工费支出'),
        50: this.$lang('ICO 解锁资产'),
        51: this.$lang('内部转账'),
        52: this.$lang('转账'),
        53: this.$lang('大客户主用户转入虚拟用户'),
        54: this.$lang('大客户虚拟用户转出到主用户'),
        55: this.$lang('发红包'),
        56: this.$lang('抢红包'),
        57: this.$lang('退回红包'),
        65: this.$lang('otc 买入'),
        66: this.$lang('otc卖出'),
        67: this.$lang('活动奖励'),
        68: this.$lang('邀请返佣'),
        69: this.$lang('注册送礼'),
        70: this.$lang('空投'),
        71: this.$lang('挖矿奖励'),
        72: this.$lang('会长奖励'),
        73: this.$lang('OTC手续费'),
        74: this.$lang('管理员转账'),
        76: this.$lang('清退券商使用'),
        99: this.$lang('点卡'),
        100: this.$lang('点卡赠送币'),
        101: this.$lang('点卡保证金'),
        102: this.$lang('点卡支付流水类型'),
        103: this.$lang('点卡退款'),
        110: 110,
        120: this.$lang('购买理财'),
        121: this.$lang('理财利息'),
        122: this.$lang('赎回理财本金'),
        130: this.$lang('普通支付'),
        131: this.$lang('划款'),
        132: this.$lang('退款'),
        133: this.$lang('映射'),
        200: this.$lang('OTC交易'),
        501: this.$lang('逐仓杠杆交易 - 出借人放款'),
        502: this.$lang('逐仓杠杆交易 - 出借人收款'),
        503: this.$lang('逐仓杠杆交易 - 借款'),
        504: this.$lang('逐仓杠杆交易 - 还款'),
        505: this.$lang('全仓杠杆交易 - 出借人放款'),
        506: this.$lang('全仓杠杆交易 - 出借人收款'),
        507: this.$lang('全仓杠杆交易 - 借款'),
        508: this.$lang('全仓杠杆交易 - 还款'),
      },

      viewTypeList: {
        0: this.$lang('全部'),
        1: this.$lang('交易'),
        2: this.$lang('交易手续费'),
        3: this.$lang('转账'),
        4: this.$lang('充值'),
        14: this.$lang('手续费收入'),
        21: this.$lang('资金归集'),
        22: this.$lang('清算费'),
        23: this.$lang('系统成本'),
        24: this.$lang('SAAS费'),
        25: this.$lang('佣金'),
        26: this.$lang('营收'),
        27: this.$lang('maker奖励'),
        28: this.$lang('期货等的盈亏'),
        30: this.$lang('交割'),
        31: this.$lang('强平'),
        32: this.$lang('期货等的资金费率结算'),
        33: this.$lang('提现实际打出去的值'),
        34: this.$lang('托管平台收取的手续费'),
        35: this.$lang('券商收取的手续费'),
        36: this.$lang('券商给的兑换'),
        37: this.$lang('为得到券商给的兑换所付出的值'),
        38: this.$lang('实际支付的矿工费'),
        39: this.$lang('ROLLBACK 提现实际打出去的值'),
        40: this.$lang('ROLLBACK 托管平台收取的手续费'),
        41: this.$lang('ROLLBACK 券商收取的手续费'),
        42: this.$lang('ROLLBACK 券商给的兑换'),
        43: this.$lang('ROLLBACK 为得到券商给的兑换所付出的值'),
        44: this.$lang('ROLLBACK 实际支付的矿工费'),
        45: this.$lang('券商给的兑换，把兑换归还给券商'),
        46: this.$lang('手续费收入'),
        47: this.$lang('用户借的矿工费支出'),
        50: this.$lang('ICO 解锁资产'),
        51: this.$lang('内部转账'),
        52: this.$lang('转账'),
        53: this.$lang('大客户主用户转入虚拟用户'),
        54: this.$lang('大客户虚拟用户转出到主用户'),
        55: this.$lang('发红包'),
        56: this.$lang('抢红包'),
        57: this.$lang('退回红包'),
        65: this.$lang('otc 买入'),
        66: this.$lang('otc卖出'),
        67: this.$lang('活动奖励'),
        68: this.$lang('邀请返佣'),
        69: this.$lang('注册送礼'),
        70: this.$lang('空投'),
        71: this.$lang('挖矿奖励'),
        72: this.$lang('会长奖励'),
        73: this.$lang('OTC手续费'),
        74: this.$lang('管理员转账'),
        76: this.$lang('清退券商使用'),
        99: this.$lang('点卡'),
        100: this.$lang('点卡赠送币'),
        101: this.$lang('点卡保证金'),
        102: this.$lang('点卡支付流水类型'),
        103: this.$lang('点卡退款'),
        110: 110,
        120: this.$lang('购买理财'),
        121: this.$lang('理财利息'),
        122: this.$lang('赎回理财本金'),
        130: this.$lang('普通支付'),
        131: this.$lang('划款'),
        132: this.$lang('退款'),
        133: this.$lang('映射'),
        200: this.$lang('OTC交易'),
        501: this.$lang('逐仓杠杆交易 - 出借人放款'),
        502: this.$lang('逐仓杠杆交易 - 出借人收款'),
        503: this.$lang('逐仓杠杆交易 - 借款'),
        504: this.$lang('逐仓杠杆交易 - 还款'),
        505: this.$lang('全仓杠杆交易 - 出借人放款'),
        506: this.$lang('全仓杠杆交易 - 出借人收款'),
        507: this.$lang('全仓杠杆交易 - 借款'),
        508: this.$lang('全仓杠杆交易 - 还款'),
      },
      columns: [
        {
          type: 'index',
          minWidth: 60,
        },
        {
          title: 'UID',
          minWidth: 160,
          key: 'userId',
        },
        {
          title: this.$lang('时间'),
          minWidth: 190,
          render: (h, params) =>
            h('span', this.newDate(params.row.created).format()),
        },
        {
          title: this.$lang('类型'),
          minWidth: 160,
          key: 'businessSubject',
          render: (h, params) =>
            h(
              'span',
              this.viewTypeList[params.row.businessSubject]
                ? this.viewTypeList[params.row.businessSubject]
                : params.row.businessSubject
            ),
        },
        {
          title: this.$lang('数量'),
          minWidth: 160,
          key: 'changed',
        },
        {
          title: this.$lang('余额'),
          minWidth: 160,
          key: 'total',
        },
        {
          title: this.$lang('币种'),
          minWidth: 160,
          key: 'tokenId',
        },
      ],
      listData: [],
    }
  },
  methods: {
    search() {
      this.searchForm.fromId = 0
      this.listData = []
      this.loadData()
    },
    loadData() {
      this.loading = true
      this.searchForm.hasMore = false
      let searchForm = Object.assign(
        this.searchForm,
        formatParams(this.inputInfo)
      )

      if (searchForm.orgId == '21') {
        searchForm.userId = this.inputInfo
      }
      this.$axios.post('/api/v1/balance/flows', searchForm).then((result) => {
        if (result.code == 0) {
          if (result.data.length == this.searchForm.pageSize) {
            this.searchForm.hasMore = true
          }
          this.listData = [
            ...this.listData,
            ...result.data.map((el) => {
              el.list = []
              return el
            }),
          ]
        }
        this.loading = false
      })
    },
    more() {
      this.searchForm.fromId = this.listData[
        this.listData.length - 1
      ].balanceFlowId
      this.loadData()
    },
  },
  created() {
    this.$axios.post('/api/v1/broker/query_simple_brokers').then((result) => {
      if (result.code === 0) {
        this.brokers = result.data
        this.searchForm.orgId = this.brokers[0].brokerId
        this.loadData()
      }
    })
  },
}
</script>
