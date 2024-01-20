<template lang="pug">
  Main.page-exchange
    Row.search(:gutter="15")
      Col(span="3")
        Select(v-model="searchForm.category" @on-change="loadData" style="width:100%")
          Option(:value="1") {{$lang("币币")}}
          Option(:value="4") {{$lang("合约")}}
      Col(span="4")
        Input(v-model="searchForm.symbol" search, :placeholder="$lang('输入symbol')" enter-button @on-search="search")
      Col(span="4")
        Button(:type="searchForm.owner?'primary':'default'" long  @click="viewSelf") {{$lang('查看已支持币对')}}
      Col(span="3")
        Button(long @click="deleteQuoteWin=true" type="error") {{$lang('删除行情')}}
      Col(span="3")
        Button(long, @click="batchAction") {{$lang('批量操作')}}

    Modal(v-model="deleteQuoteWin" :title="$lang('删除行情数据')" footer-hide)
      Form(:labelWidth="100")
        FormItem(:label="$lang('交易所')" :disabled="batchLoaing")
          Select(v-model="searchForm.exchangeId" filterable)
            Option(v-for="item in exchangeList", :value="item.exchangeId", :key="item.exchangeId+'batch'") {{item.exchangeId}}-{{item.name}}
        FormItem(:label="$lang('币对')")
          Select(v-model="deleteQuoteSymbolId" filterable)
            Option(v-for="item,index in listData", :value="item.symbolId", :key="item.symbolId+index") {{item.symbolId}}
        FormItem(:label="$lang('提示')")
          Alert(type="error")
            Icon(type="md-warning")
            | {{$lang('删除前请确认币对已经关闭！此操作会删除该交易所该币对的所有k线、历史成交、当前最新成交价，执行后数据将不可恢复！')}}
        Button(long type="success" @click="deleteQuote") {{$lang('确定')}}

    Modal(v-model="batchWin" :title="$lang('批量操作')" footer-hide width="1200")
      Form(:labelWidth="100")
        FormItem(:label="$lang('展示')")
          iSwitch(size="small" v-model="batchState" :true-value="1" :false-value="0" :disabled="batchLoaing")
        FormItem(:label="$lang('券商')")
          Checkbox(v-if="moreExchange" @on-change="selectAll" v-model="allBrokerStauts") {{$lang('全选')}}
          CheckboxGroup(v-if="moreExchange" v-model="selectBrokers" @on-change="changeSelectStatus")
            Row(:gutter="20")
              Col(v-for="item,index in brokerList" :key="item.brokerId+index" span="6")
                Checkbox(:label="item.brokerId") {{item.brokerId}}-{{item.name}}
        FormItem(:label="$lang('列表')")
          Input(type="textarea" :rows="4" v-model="symbols", :placeholder="$lang('一行对应一个币对ID')" :disabled="batchLoaing")
        FormItem(:label="`${$lang('审核')}(${symbolsList.length})`")
          Tag(v-for="item in symbolsList" :key="item") {{item}}
        Progress(:percent="percent" v-if="batchLoaing")
        Button(long type="success" @click="batchEdit" v-else) {{$lang('确定')}}
    Table.user-table(:columns="columns", :data="listData", :loading="loadingTable" :max-height="height-(total>searchForm.pageSize?320:265)")
      template(slot-scope="{ row, index }" slot="symbol") {{row.baseTokenId}}/{{row.quoteTokenId}}
        Tag(v-if="row.isPrivateSymbol" color="primary") {{$lang('私有')}}
      template(slot-scope="{ row, index }" slot="showStatus")
        Tag(v-if="row.published") {{$lang("已开启")}}
        iSwitch(size="small" v-model="row.showStatus" :loading="index===editIndex" @on-change="change(row,index,'showStatus')" v-else)
      template(slot-scope="{ row, index }" slot="saasAllowTradeStatus")
        iSwitch(size="small" v-model="row.saasAllowTradeStatus" :loading="index===editIndex" @on-change="change(row,index,'saasAllowTradeStatus')" v-if="row.published")
        Tag(v-else) {{$lang("未开启")}}
    .page-pages(v-if="total>searchForm.pageSize")
      Page(:current.sync="searchForm.current", :total="total", :pageSize="searchForm.pageSize" @on-change="loadData")
    // 启用/关闭交易所
    Modal(v-model="settingsWinStatus", :title="$lang('设置')" @on-ok="settings" @on-cancel="cancel")
      Alert {{$lang("您确定执行此操作吗？")}}
      Input(v-model='settingsForm.input', :placeholder="$lang('请输入操作原因')", type="textarea", :rows="4")
</template>
<script>
import { mapState } from 'vuex'
export default {
  data() {
    return {
      changeType: '',
      editIndex: null,
      total: 0,
      batchLoaing: false,
      batchWin: false,
      batchState: 1,
      batchTotal: 0,
      symbols: '',
      loadingTable: true,
      moreExchange: true,
      allBrokerStauts: false,
      selectBrokers: [],
      brokerList: [],
      exchangeList: [],
      searchForm: {
        current: 1,
        pageSize: 200,
        brokerId: '',
        exchangeId: '',
        category: 1,
        symbol: '',
        owner: true,
      },
      listData: [],
      settingsWinStatus: false,
      settingsUrl: '',
      settingsForm: {
        brokerId: '',
        brokers: '',
        symbolId: '',
        symbols: '',
        remark: '',
        category: 1,
      },
      deleteQuoteWin: false,
      columns: [
        {
          title: this.$lang('申请时间'),
          minWidth: 160,
          key: 'createdAt',
          render: (h, params) =>
            h('span', this.newDate(params.row.createdAt).format()),
        },
        {
          title: this.$lang('申请券商'),
          minWidth: 160,
          sortable: true,
          key: 'applyBrokerId',
        },
        {
          title: this.$lang('币对'),
          slot: 'symbol',
          sortable: true,
          minWidth: 160,
        },
        {
          title: this.$lang('币对ID'),
          key: 'symbolId',
          minWidth: 160,
        },
        {
          title: this.$lang('允许交易'),
          minWidth: 160,
          sortable: true,
          key: 'saasAllowTradeStatus',
          slot: 'saasAllowTradeStatus',
        },
        {
          title: this.$lang('状态'),
          minWidth: 120,
          render: (h, params) => {
            let updateStatus = ''
            let status = {
              1: this.$lang('上架中'),
              2: this.$lang('上架失败'),
              3: this.$lang('下架中'),
              4: this.$lang('下架失败'),
            }
            let colors = {
              1: 'primary',
              2: 'error',
              3: 'primary',
              4: 'error',
            }
            if (params.row.updateStatus == 0) {
              updateStatus = params.row.published
                ? this.$lang('已上架')
                : this.$lang('未上架')
            } else {
              updateStatus = status[params.row.updateStatus]
            }
            return h(
              'Tag',
              {
                attrs: {
                  color: colors[params.row.updateStatus],
                },
              },
              updateStatus
            )
          },
        },
        {
          title: this.$lang('用户可见'),
          minWidth: 160,
          key: 'showStatus',
          slot: 'showStatus',
          filters: [
            {
              label: this.$lang('已开启'),
              value: 1,
            },
            {
              label: this.$lang('已关闭'),
              value: 2,
            },
            {
              label: this.$lang('已开启'),
              value: 3,
            },
          ],
          filterMultiple: false,
          filterMethod(value, row) {
            if (value === 1) {
              return !row.published && row.showStatus
            } else if (value === 2) {
              return !row.published && !row.showStatus
            } else if (value === 3) {
              return row.published
            }
          },
        },
      ],
    }
  },
  computed: {
    ...mapState(['height']),
    symbolsList() {
      if (this.symbols) {
        return this.symbols.toUpperCase().split('\n')
      } else {
        return []
      }
    },
    percent() {
      if (this.symbolsList.length && this.selectBrokers.length) {
        return Math.floor(
          (this.batchTotal /
            this.symbolsList.length /
            this.selectBrokers.length) *
            100
        )
      } else {
        return 0
      }
    },
  },
  created() {
    this.$axios
      .post('/api/v1/broker/query_simple_brokers', {})
      .then((result) => {
        if (result.data && result.data.length) {
          this.brokerList = result.data
          this.searchForm.brokerId =
            sessionStorage.brokerId || this.brokerList[0].brokerId

          if (
            this.brokerList.filter(
              (el) => el.brokerId == this.searchForm.brokerId
            ).length == 0
          ) {
            this.searchForm.brokerId = this.brokerList[0].brokerId
          }
          this.loadData()
        }
      })
    this.$axios
      .post('/api/v1/exchange/query_simple_exchanges', {})
      .then((result) => {
        if (result.data && result.data.length) {
          this.exchangeList = result.data
          this.searchForm.exchangeId = this.exchangeList[0].exchangeId
        }
      })
  },
  methods: {
    deleteQuote() {
      this.$axios
        .post('/api/v1/broker_symbol/deleteQuote', {
          exchangeId: this.searchForm.exchangeId,
          symbol: this.deleteQuoteSymbolId,
        })
        .then((result) => {
          if (result.code == 0) {
            this.$Notice.success({
              title: this.$lang('请求成功'),
            })
            this.deleteQuoteWin = false
          }
        })
    },

    search() {
      if (this.searchForm.symbol) {
        this.searchForm.owner = false
      }
      this.loadData()
    },
    batchAction() {
      this.batchWin = true
      this.symbols = ''
      this.selectBrokers = []
      this.selectBrokers.push(this.searchForm.brokerId)
    },
    viewSelf() {
      this.searchForm.owner = !this.searchForm.owner
      this.loadData()
    },
    change(row, index, type) {
      this.settingsWinStatus = true
      this.settingsForm.symbolId = row.symbolId
      this.settingsForm.remark = ''

      this.editIndex = index
      this.changeType = type
      if (type == 'showStatus') {
        let symbolIdArr = [row.symbolId]
        let brokerIdArr = [this.searchForm.brokerId]
        Object.assign(this.settingsForm, {
          brokers: brokerIdArr,
          symbols: symbolIdArr,
          category: this.searchForm.category,
        })
        if (row.showStatus) {
          this.settingsUrl = '/api/v1/broker_symbol/batch_allow_show'
        } else {
          this.settingsUrl = '/api/v1/broker_symbol/batch_forbid_show'
        }
      } else {
        if (row.saasAllowTradeStatus) {
          this.settingsUrl = '/api/v1/broker_symbol/allow_trade'
        } else {
          this.settingsUrl = '/api/v1/broker_symbol/forbid_trade'
        }
      }
    },
    changeSelectStatus() {
      if (this.selectBrokers.length == this.brokerList.length) {
        this.allBrokerStauts = true
      } else {
        this.allBrokerStauts = false
      }
    },
    selectAll() {
      if (this.allBrokerStauts) {
        this.selectBrokers = this.brokerList.map((el) => el.brokerId)
      } else {
        this.selectBrokers = []
      }
    },
    loadData() {
      sessionStorage.brokerId = this.searchForm.brokerId
      this.loadingTable = true
      this.searchForm.symbol = this.searchForm.symbol.toUpperCase()
      this.$axios
        .post('/api/v1/broker_symbol/query', this.searchForm)
        .then((result) => {
          this.loadingTable = false
          if (result.code == 0) {
            this.listData = result.data.list ? result.data.list : []
            this.total = result.data.total
            //this.symbols = this.listData.map(el => el.symbolId).join("\n");
          }
        })
    },
    cancel() {
      this.settingsWinStatus = false
      this.listData = [...this.listData]
      this.editIndex = null
    },

    settings() {
      this.settingsForm.brokerId = this.searchForm.brokerId
      this.$axios.post(this.settingsUrl, this.settingsForm).then((result) => {
        this.loadData()
        if (result.code == 0) {
          this.editIndex = null
          this.settingsWinStatus = false
        }
      })
    },
    batchEdit() {
      this.batchLoaing = true
      let url = this.batchState
        ? '/api/v1/broker_symbol/batch_allow_show'
        : '/api/v1/broker_symbol/batch_forbid_show '
      this.$axios
        .post(url, {
          symbols: this.symbolsList,
          brokers: this.selectBrokers,
          category: this.searchForm.category,
        })
        .then((resp) => {
          this.batchLoaing = false
          if (resp.code === 0) {
            this.batchWin = false
            this.loadData()
          }
        })
    },
  },
}
</script>
