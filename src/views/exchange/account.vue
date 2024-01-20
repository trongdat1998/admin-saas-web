<template lang="pug">
Main.page-exchange
  Row.search(:grtter="15")
    Col(span="20") &nbsp;
    Col(span="4")
      Button(
        type="primary",
        ghost,
        @click="create",
        icon="md-add-circle",
        long
      ) {{ $lang('新建') }}
  Table.user-table(
    :columns="columns",
    :data="listData",
    :loading="loadingTable"
  )
  div(style="padding-top:30px")
    ButtonGroup
      Button(
        icon="ios-arrow-back",
        @click="search",
        :disabled="searchForm.fromId == 0"
      )
      Button(
        icon="ios-arrow-forward",
        @click="next",
        :disabled="listData.length < searchForm.limit"
      )

  // 创建修改券商
  Modal.page-exchange-win(
    v-model="creatWin",
    :title="$lang('做市账号')",
    :loading="loading"
  )
    Form(:model="createForm", :label-width="100")
      FormItem(:label="$lang('券商简称')")
        template(
          v-for="item in brokers",
          v-if="item.brokerId === searchForm.orgId"
        ) {{ item.brokerId }}-{{ item.name }}
      FormItem(:label="$lang('类型')")
        Select(v-model="createForm.type", @on-change="loadSymbol")
          Option(v-for="(item, key) in type", :value="key", :key="'a' + key") {{ item }}
      FormItem(:label="$lang('币对')")
        Button(:loading="remoteLoading", v-if="remoteLoading", long) &nbsp;
        Select(v-model="createForm.symbolId", filterable, v-else)
          Option(
            v-for="(item, key) in symbols",
            :value="item.symbolId",
            :key="'a' + key"
          ) {{ item.baseTokenId }}/{{ item.quoteTokenId }}
      FormItem(:label="$lang('做市账号')")
        Input(v-model="createForm.accountId", placeholder="accountId")
      FormItem(:label="$lang('Maker买费率')")
        Input(v-model="createForm.makerBuyFee", placeholder="makerBuyFee")
      FormItem(:label="$lang('Maker卖费率')")
        Input(v-model="createForm.makerSellFee", placeholder="makerSellFee")
      FormItem(:label="$lang('Taker买费率')")
        Input(v-model="createForm.takerBuyFee", placeholder="takerBuyFee")
      FormItem(:label="$lang('Taker卖费率')")
        Input(v-model="createForm.takerSellFee", placeholder="takerSellFee")
    div(slot="footer")
      Button(
        @click="doCreate",
        :loading="loading",
        :disabled="loading",
        long,
        type="primary"
      ) {{ $lang('确定') }}
  Modal(v-model="removeWin", width="360")
    p(slot="header", style="color:#f60;text-align:center")
      Icon(type="ios-information-circle")
      span {{ $lang('删除') }}
    div(style="text-align:center") {{ $lang('您确定执行此操作吗？') }}
    div(slot="footer")
      Button(
        type="error",
        long,
        @click="remove",
        :disabled="loading",
        :loading="loading"
      ) {{ $lang('确定') }}
</template>
<script>
export default {
  data() {
    return {
      remoteLoading: false,
      removeWin: false,
      loading: false,
      loadingTable: true,
      // 搜索关键字，包含非数字的字符串，处理为券商简称
      searchForm: {
        orgId: 6001,
        fromId: 0,
        limit: 100,
      },
      maps: {},
      type: {
        1: this.$lang('币币'),
        4: this.$lang('期货'),
      },
      listData: [],
      brokers: [],
      symbols: [],
      creatWin: false,
      // create创建 / edit修改
      createForm: {
        orgId: '',
        symbolId: '',
        accountId: '',
        type: '1',
        takerBuyFee: 0,

        takerSellFee: 0,

        makerBuyFee: 0,

        makerSellFee: 0,
      },
      reomveForm: { orgId: '', id: '' },
      columns: [
        {
          title: this.$lang('券商ID'),
          minWidth: 140,
          key: 'orgId',
        },
        {
          title: this.$lang('券商简称'),
          minWidth: 140,
          key: 'orgId',
          render: (h, params) => h('span', this.maps[params.row.orgId]),
        },
        /*{
          title: this.$lang("类型"),
          minWidth: 140,
          key: "category",
          render: (h, params) => h("span", this.type[params.row.category]),
        },*/
        {
          title: this.$lang('币对'),
          minWidth: 140,
          key: 'symbolId',
        },
        {
          title: this.$lang('做市账号'),
          minWidth: 180,
          key: 'accountId',
        },
        {
          title: this.$lang('Maker买费率'),
          minWidth: 140,
          key: 'makerBuyFeeRate',
        },
        {
          title: this.$lang('Maker卖费率'),
          minWidth: 140,
          key: 'makerSellFeeRate',
        },
        {
          title: this.$lang('Taker买费率'),
          minWidth: 140,
          key: 'takerBuyFeeRate',
        },
        {
          title: this.$lang('Taker卖费率'),
          minWidth: 140,
          key: 'takerSellFeeRate',
        },
        {
          title: this.$lang('操作'),
          minWidth: 140,
          render: (h, params) =>
            h(
              'a',
              {
                on: {
                  click: () => {
                    this.showRemove(params.row)
                  },
                },
              },
              this.$lang('删除')
            ),
        },
      ],
    }
  },
  created() {
    this.$axios.post('/api/v1/broker/query_simple_brokers').then((result) => {
      if (result.code === 0) {
        this.brokers = result.data
        this.brokers.forEach((el) => {
          this.maps[el.brokerId] = el.name
        })
        this.searchForm.orgId = result.data[0].brokerId
        this.search()
      }
    })
  },
  methods: {
    search() {
      this.searchForm.fromId = 0
      this.loadData()
    },
    next() {
      this.searchForm.fromId = this.listData[this.listData.length - 1].id
      this.loadData()
    },
    loadData() {
      this.loadingTable = true
      this.$axios
        .post('/api/v1/broker/query_symbol_market_list', this.searchForm)
        .then((result) => {
          this.loadingTable = false
          if (result.code === 0) {
            this.listData = result.data
          }
        })
      this.loadSymbol()
    },
    loadSymbol() {
      this.remoteLoading = true
      this.createForm.symbolId = ''
      this.symbols = []
      this.$axios
        .post('/api/v1/broker_symbol/query', {
          current: 1,
          pageSize: 10000,
          brokerId: this.searchForm.orgId,
          category: this.createForm.type,
        })
        .then((result) => {
          this.remoteLoading = false
          if (result.code == 0) {
            this.createForm.symbolId = result.data.list[0].symbolId
            this.symbols = result.data.list
          }
        })
    },
    create() {
      Object.assign(this.createForm, {
        orgId: '',
        symbolId: '',
        accountId: '',
      })
      this.creatWin = true
    },
    showRemove(row) {
      this.removeWin = true
      Object.assign(this.reomveForm, row)
    },

    remove() {
      this.loading = true
      this.$axios
        .post('/api/v1/broker/delete_market_account', this.reomveForm)
        .then((result) => {
          this.loading = false
          if (result.code == 0) {
            this.removeWin = false
            this.search()
          }
        })
    },

    doCreate() {
      this.createForm.orgId = this.searchForm.orgId
      this.loading = true
      this.$axios
        .post('/api/v1/broker/save_symbol_market_account', this.createForm)
        .then((result) => {
          this.loading = false
          if (result.code == 0) {
            this.creatWin = false
            this.search()
          }
        })
    },
  },
}
</script>
