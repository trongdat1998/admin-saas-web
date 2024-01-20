<style lang="less" scoped></style>
<template lang="pug">
  .page-exchange
    Row.search(:gutter="15")
      Col(span="4")
        Select(v-model="formData.brokerId" @on-change="load" style="width:100%" filterable)
          Option(v-for="item in brokers", :value="item.brokerId", :key="item.brokerId") {{item.brokerId}}-{{item.name}}
    Table(:data="listData", :columns="columns", :loading="loadingTable")
      template(slot-scope="{ row, index }", slot="allowFixed")
        iSwitch(
          size="small",
          :true-value="1",
          :false-value="0",
          v-model="row.allowFixed",
          :loading="index === changeIndex",
          @on-change="change(row, index, 'allowFixed')"
        )
      template(slot-scope="{ row, index }", slot="allowFixedLock")
        iSwitch(
          size="small",
          :true-value="1",
          :false-value="0",
          v-model="row.allowFixedLock",
          :loading="index === changeIndex",
          @on-change="change(row, index, 'allowFixedLock')",
        )
      template(slot-scope="{ row, index }", slot="allowCurrent")
        iSwitch(
          size="small",
          :true-value="1",
          :false-value="0",
          v-model="row.allowCurrent",
          :loading="index === changeIndex",
          @on-change="change(row, index, 'allowCurrent')",
        )
    Modal(
      v-model="settingsWinStatus",
      :title="$lang('设置')",
      @on-ok="settings",
      @on-cancel="cancel"
    )
      Alert {{ $lang('您确定执行此操作吗？') }}
</template>
<script>
export default {
  data() {
    return {
      urls: {
        0: 'add_fixed_permission',
        1: 'delete_fixed_permission',
        2: 'add_fixedlock_permission',
        3: 'delete_fixedlock_permission',
        4: 'add_current_permission',
        5: 'delete_current_permission',
      },
      url: '',
      settingsWinStatus: false,
      changeIndex: null,
      brokers: [],
      loading: false,
      loadingTable: false,
      formData: {
        brokerId: '6001',
      },
      listData: [],
      columns: [
        {
          title: this.$lang('券商'),
          minWidth: 160,
          key: 'brokerId',
          render: (h, params) =>
            h('span', `${params.row.brokerId}-${params.row.brokerName}`),
        },
        {
          title: this.$lang('开启定期权限'),
          minWidth: 160,
          slot: 'allowFixed',
        },
        {
          title: this.$lang('开启锁仓权限'),
          minWidth: 160,
          slot: 'allowFixedLock',
        },
        {
          title: this.$lang('开启活期权限'),
          minWidth: 160,
          slot: 'allowCurrent',
        },
      ],
    }
  },
  methods: {
    change(row, index, type) {
      if (type === 'allowFixed' && row.allowFixed == 1) {
        this.url = this.urls[0]
      } else if (type === 'allowFixed' && row.allowFixed == 0) {
        this.url = this.urls[1]
      } else if (type === 'allowFixedLock' && row.allowFixedLock == 1) {
        this.url = this.urls[2]
      } else if (type === 'allowFixedLock' && row.allowFixedLock == 0) {
        this.url = this.urls[3]
      } else if (type === 'allowCurrent' && row.allowCurrent == 1) {
        this.url = this.urls[4]
      } else if (type === 'allowCurrent' && row.allowCurrent == 0) {
        this.url = this.urls[5]
      }
      this.settingsWinStatus = true
      this.changeIndex = index
    },

    cancel() {
      this.settingsWinStatus = false
      this.listData = [...this.listData]
      this.changeIndex = null
    },

    settings() {
      this.$axios
        .post(`/api/v1/broker/staking/product/${this.url}`, this.formData)
        .then((result) => {
          this.changeIndex = null
          this.settingsWinStatus = false
          if (result.code == 0) {
            this.load()
          } else {
            this.listData = [...this.listData]
          }
        })
    },
    load() {
      this.listData = []
      this.loadingTable = true
      this.$axios
        .post('/api/v1/broker/staking/product/get_permission', this.formData)
        .then((result) => {
          this.loadingTable = false
          if (result.code === 0) {
            this.listData.push(result.data)
          }
        })
    },
  },
  created() {
    this.$axios.post('/api/v1/broker/query_simple_brokers').then((result) => {
      if (result.code === 0) {
        this.brokers = result.data
        this.formData.brokerId = this.brokers[0].brokerId
        this.load()
      }
    })
  },
}
</script>
