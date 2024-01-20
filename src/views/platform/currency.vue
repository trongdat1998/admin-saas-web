<template lang="pug">
Main.page-exchange
  Modal(
    v-model="switchWin",
    :title="$lang('您确定要执行此操作吗？')",
    width="400",
    @on-cancel="editIndex = null"
  )
    Alert(type="error") {{ `${$lang(nextForm[nextForm.type] ? '启用' : '禁用')}:${tokenTypes[nextForm.tokenType]}-${nextForm.tokenId}-` }}
      template(v-if="nextForm.type === 'allowDeposit'") {{ $lang('充值') }}
      template(v-else-if="nextForm.type === 'allowWithdraw'") {{ $lang('提现') }}
      template(v-else) {{ $lang('充币地址TAG') }}
    Button(
      slot="footer",
      long,
      type="error",
      @click="doSwitch",
      :loading="loading",
      :disabled="loading"
    ) {{ $lang('确定') }}
  Row.search(:gutter="15")
    Col(span="4")
      Select(
        v-model="searchForm.tokenType",
        size="default",
        @on-change="loadData"
      )
        Option(v-for="(item, key) in tokenTypes", :key="key", :value="~~key") {{ $lang(`${item}`) }}
    Col(span="20")
      Input(
        v-model="searchForm.tokenId",
        size="default",
        placeholder="tokenId",
        search,
        enter-button="",
        @on-search="loadData"
      )
  Table(:columns="columns", :data="listData", :loading="loadingTable")
    template(slot-scope="{row, index }", slot="allowDeposit")
      iSwitch(
        size="small",
        v-model="row.allowDeposit",
        @on-change="switchConfig(row, index, 'allowDeposit')",
        :loading="index === editIndex"
      )
    template(slot-scope="{row, index }", slot="allowWithdraw")
      iSwitch(
        size="small",
        v-model="row.allowWithdraw",
        @on-change="switchConfig(row, index, 'allowWithdraw')",
        :loading="index === editIndex"
      )
    template(slot-scope="{row, index }", slot="addressNeedTag")
      iSwitch(
        size="small",
        v-model="row.addressNeedTag",
        @on-change="switchConfig(row, index, 'addressNeedTag')",
        :loading="index === editIndex"
      )
    template(slot-scope="{row, index }", slot="view")
      Button(
        :to="`/platform/currency/${row.tokenId}`",
        target="_blank",
        size="small"
      ) {{ $lang('查看') }}
  .page-pages(v-if="total > searchForm.pageSize")
    Page(
      :current.sync="searchForm.current",
      :total="total",
      :pageSize="searchForm.pageSize",
      @on-change="loadData"
    )
</template>
<script>
export default {
  data() {
    return {
      total: 0,
      switchWin: false,
      nextForm: {
        allowDeposit: false,
        allowWithdraw: false,
        addressNeedTag: false,
        tokenId: '',
        type: '',
      },
      editIndex: null,
      searchForm: {
        current: 1,
        pageSize: 100,
        tokenType: '',
        tokenId: '',
      },
      listData: [],
      loadingTable: false,
      loading: false,
      tokenTypes: {
        1: '主网代币',
        2: 'ETH代币',
        3: 'BTC代币',
        4: 'EOS代币',
        6: '交易所私有币',
        7: '法币',
        9: '期货',
        10: 'TRX代币',
        11: 'NEO代币',
        12: 'HECO代币',
        13: 'BSC代币',
        14: 'SPL代币',
        15: 'CHZ链代币',
      },
      columns: [
        {
          title: '序号',
          type: 'index',
        },
        {
          title: 'TokenId',
          key: 'tokenId',
        },
        {
          title: this.$lang('Token类型'),
          key: 'tokenType',
          render: (h, params) => {
            return h('div', this.$lang(this.tokenTypes[params.row.tokenType]))
          },
        },
        {
          title: this.$lang('充值'),
          slot: 'allowDeposit',
        },
        {
          title: this.$lang('提现'),
          slot: 'allowWithdraw',
        },
        {
          title: this.$lang('充币地址TAG'),
          slot: 'addressNeedTag',
        },
        {
          align: 'right',
          title: this.$lang('上架交易所'),
          slot: 'view',
        },
      ],
    }
  },
  created() {
    this.loadData()
  },
  methods: {
    doSwitch() {
      this.loading = true
      this.$axios
        .post('/api/v1/platform/token/switch_deposit_withdraw', this.nextForm)
        .then((result) => {
          this.loading = false
          if (result.code == 0) {
            Object.assign(this.listData[this.editIndex], this.nextForm)
            this.editIndex = null
            this.switchWin = false
          }
        })
    },
    switchConfig(row, index, type) {
      this.editIndex = index
      this.switchWin = true
      Object.assign(this.nextForm, row, { type })
      setTimeout(() => {
        row[type] = !row[type]
      }, 10)
    },
    loadData() {
      this.loadingTable = true
      this.$axios
        .post('/api/v1/platform/token/list', this.searchForm)
        .then((result) => {
          this.loadingTable = false
          if (result.code == 0) {
            this.listData = result.data.list
            this.total = result.data.total
          }
        })
    },
  },
}
</script>
