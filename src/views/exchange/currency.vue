<template lang="pug">
  Main.page-exchange
    Row.search(:gutter="15")
      Col(span="4")
        Select(v-model="searchForm.category" @on-change="loadData" style="width:100%")
          Option(:value="1") {{$lang("币币")}}
          //option(:value="4") {{$lang("合约")}}
      Col(span="8")
        Input(v-model="searchForm.token" search :placeholder="$lang('输入Token Name')" enter-button @on-search="search")
      Col(span="4")
        Button(:type="self?'primary':'default'" long @click="viewSelf") {{$lang('查看已支持币种')}}
      Col(span="4")
        Button(long, @click="batchAction") {{$lang('批量操作')}}
    Modal(v-model="batchWin" :title="$lang('批量操作')" footer-hide width="1200")
      Form(:labelWidth="100")
        FormItem(:label="$lang('展示')")
          iSwitch(v-model="batchState" :true-value="1" :false-value="0" :disabled="batchLoaing")
        FormItem(:label="$lang('券商')")
          Checkbox(v-if="moreExchange" @on-change="selectAll" v-model="allBrokerStauts") {{$lang('全选')}}
          CheckboxGroup(v-if="moreExchange" v-model="selectBrokers" @on-change="changeSelectStatus")
            Row(:gutter="20")
              Col(v-for="item in brokerList" :key="item.brokerId" span="6")
                Checkbox(:label="item.brokerId")  {{item.brokerId}}-{{item.name}}
          Select(v-model="searchForm.brokerId" @on-change="loadData" :disabled="batchLoaing" v-else)
            Option(v-for="item in brokerList", :value="item.brokerId", :key="item.brokerId") {{tem.brokerId}}-{{item.name}}
        FormItem(:label="$lang('列表')")
          Input(type="textarea" :rows="4" v-model="tokens", :placeholder="$lang('一行对应一个币种')" :disabled="batchLoaing")
        FormItem(:label="`${$lang('审核')}(${tokensList.length})`")
          Tag(v-for="item in tokensList" :key=-"item") {{item}}
        Progress(status="active" :percent="percent" v-if="batchLoaing")
        Button(long type="success" @click="batchEdit" v-else) {{$lang('确定')}}
    Table.user-table(:columns="columns", :data="listData", :loading="loadingTable" :max-height="height-(total>searchForm.pageSize?320:265)")
      template(slot-scope="{ row, index }" slot="tokenName") {{row.tokenName}}
        Tag(v-if="row.isPrivateToken" color="primary") {{$lang('私有')}}
    .page-pages(v-if="total>searchForm.pageSize")
      Page(:current.sync="searchForm.current", :total="total", :pageSize="searchForm.pageSize" @on-change="loadData")
    Modal(v-model="viewWin", :title="$lang('查看')" width="600" footer-hide)
      List(border)
        ListItem {{$lang('代币类型')}} : {{$lang(tokenTypes[viewData.tokenType])}}
      Divider {{$lang('基础配置')}}
      List(border)
        ListItem {{$lang('币种简称')}} : {{viewData.tokenName}}
        ListItem {{$lang('币种全称')}} : {{viewData.tokenName}}
        ListItem {{$lang('公允价值')}} : {{viewData.fairValue}} USDT
        ListItem {{$lang('标识')}} :
          img(:src='viewData.icoUrl' width="40")
        ListItem(v-if="viewData.tokenType!=1") {{$lang('地址')}} : {{viewData.contractAddress}}
        ListItem {{$lang('token介绍')}} : {{viewData.introduction}}
      Divider {{$lang('充值/提现配置')}}
      List(border)
        ListItem {{$lang('最小充币数量')}} : {{viewData.minDepositingAmt}} {{viewData.tokenName}}
        ListItem {{$lang('最小提币数量')}} : {{viewData.minWithdrawingAmt}} {{viewData.tokenName}}
        ListItem {{$lang('平台提币手续费')}} : {{viewData.platformFee}}
          template(v-if="viewData.feeToken ===0") ETH
          template(v-else-if="viewData.feeToken ===1") EOS
          template(v-else-if="viewData.feeToken ===3") TRX
          template(v-else) {{viewData.tokenName}}
      Divider {{$lang('其他')}}
      List(border)
        ListItem {{$lang('链上确认数')}} : {{viewData.confirmCount}}
        ListItem {{$lang('可提现确认数')}} : {{viewData.canWithdrawConfirmCount}}
        ListItem {{$lang('币种支持精度')}} : {{viewData.minPrecision}}
        ListItem {{$lang('交易哈希查询地址')}} : {{viewData.exploreUrl}}
</template>
<script>
import { mapState } from 'vuex'
export default {
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
  },
  computed: {
    ...mapState(['height']),
    tokensList() {
      if (this.tokens) {
        return this.tokens.toUpperCase().split('\n')
      } else {
        return []
      }
    },
    percent() {
      if (this.tokensList.length && this.selectBrokers.length) {
        return Math.floor(
          (this.batchTotal /
            this.tokensList.length /
            this.selectBrokers.length) *
            100
        )
      } else {
        return 0
      }
    },
  },
  methods: {
    search() {
      if (this.searchForm.token) {
        this.self = false
      }
      this.loadData()
    },
    batchAction() {
      this.batchWin = true
      this.selectBrokers = []
      this.selectBrokers.push(this.searchForm.brokerId)
    },
    viewSelf() {
      this.self = !this.self
      this.loadData()
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
    batchEdit() {
      this.batchLoaing = true
      let url = this.batchState
        ? '/api/v1/broker_token/batch_allow_show'
        : '/api/v1/broker_token/batch_forbid_show'
      this.$axios
        .post(url, {
          tokens: this.tokensList,
          brokers: this.selectBrokers,
          category: this.searchForm.category,
        })
        .then((resp) => {
          this.batchLoaing = false
          if (resp.code === 0) {
            this.batchWin = false
            this.loadData()
            // location.reload();
          }
        })
    },
    viewDetail(tokenId, brokerId) {
      this.$axios
        .get('/api/v1/broker_token/detail', {
          params: { tokenId, brokerId },
        })
        .then((result) => {
          this.viewWin = true
          Object.assign(this.viewData, result.data)
        })
    },
    loadData() {
      sessionStorage.brokerId = this.searchForm.brokerId
      this.loadingTable = true
      this.$axios
        .post(
          this.self
            ? '/api/v1/broker_token/query_my_tokens'
            : '/api/v1/broker_token/query_tokens',
          this.searchForm
        )
        .then((result) => {
          this.loadingTable = false
          this.listData = result.data.list ? result.data.list : []
          this.total = result.data.total
          //this.tokens = this.listData.map(el=>el.tokenId).join("\n")
        })
    },
    setStatus(status, item) {
      let url = status
        ? '/api/v1/broker_token/batch_allow_show'
        : '/api/v1/broker_token/batch_forbid_show'
      let tokenIdArr = [item.tokenId]
      let brokerIdArr = [this.searchForm.brokerId]
      this.$axios
        .post(url, {
          tokens: tokenIdArr,
          brokers: brokerIdArr,
          category: this.searchForm.category,
        })
        .then(() => this.loadData())
    },
  },
  data() {
    return {
      self: true,
      total: 0,
      tokenTypes: {
        1: this.$lang('主网代币'),
        2: this.$lang('ETH代币'),
        4: this.$lang('EOS代币'),
        10: this.$lang('TRX代币'),
        11: this.$lang('NEO代币'),
        12: this.$lang('HECO代币'),
        13: this.$lang('BSC代币'),
        14: this.$lang('SPL代币'),
      },
      tokens: '',
      loadingTable: true,
      moreExchange: true,
      allBrokerStauts: false,
      selectBrokers: [],
      brokerList: [],
      viewWin: false,
      viewData: {},
      batchLoaing: false,
      batchWin: false,
      batchState: 1,
      batchTotal: 0,
      searchForm: {
        token: '',
        current: 1,
        pageSize: 500,
        brokerId: '',
        category: 1, // 1 币币 3期权 4合约
      },
      columns: [
        {
          minWidth: 180,
          title: this.$lang('申请时间'),
          key: 'createdAt',
          render: (h, params) =>
            h('span', this.newDate(params.row.createdAt).format()),
        },
        {
          minWidth: 140,
          title: this.$lang('申请券商'),
          key: 'applyBrokerId',
        },
        {
          minWidth: 140,
          title: this.$lang('币种ID'),
          key: 'tokenId',
        },
        {
          minWidth: 140,
          title: this.$lang('币种简称'),
          slot: 'tokenName',
        },
        {
          minWidth: 140,
          title: this.$lang('币种全称'),
          key: 'tokenFullName',
        },
        {
          minWidth: 160,
          title: this.$lang('标识'),
          render: (h, params) => {
            return h('img', {
              attrs: {
                src: params.row.icon,
                width: 20,
              },
            })
          },
        },
        {
          minWidth: 140,
          title: this.$lang('展示'),
          sortable: true,
          key: 'status',
          render: (h, params) => {
            return h('iSwitch', {
              props: {
                size: 'small',
                value: params.row.status,
                'true-value': 1,
                'false-value': 0,
              },
              on: {
                'on-change': (status) => {
                  this.setStatus(status, params.row)
                },
              },
            })
          },
        },
        {
          width: 100,
          minWidth: 140,
          title: this.$lang('操作'),
          fixed: 'right',
          render: (h, params) => {
            return h(
              'a',
              {
                on: {
                  click: () => {
                    this.viewDetail(params.row.tokenId, params.row.brokerId)
                  },
                },
              },
              this.$lang('查看')
            )
          },
        },
      ],
      listData: [],
    }
  },
}
</script>
