<template lang="pug">
Main.page-exchange
  Table.user-table(
    :columns="columns",
    :data="listData",
    :loading="loadingTable",
  )
    template(slot-scope="{ row }", slot="adminWebUrl")
      Icon.copy(
        size="24",
        type="ios-copy-outline",
        :data-clipboard-text="row.adminWebUrl"
      )
    template(slot-scope="{ row, index }", slot="status")
      iSwitch(
        size="small",
        v-model="row.enabled",
        @on-change="changeStatus(row, index)",
        :loading="index === editIndex"
      )
    template(slot-scope="{ row ,index}", slot="adminStatus")
      iSwitch(
        size="small",
        v-model="row.forbidAccessStatus",
        @on-change="showForbid(row, index)",
        :true-value="false",
        :false-value="true",
        :loading="index === editIndex"
      )
    template(slot-scope="{ row ,index}", slot="otcStatus")
      iSwitch(
        size="small",
        v-model="row.otcShare",
        @on-change="setOtcShare(row, index)",
        :loading="index === editIndex"
      )
    template(template, slot-scope="{ row }", slot="apiDomain")
      Icon.copy(
        size="24",
        type="ios-copy-outline",
        :data-clipboard-text="row.apiDomain",
        :title="row.apiDomain"
      )
    template(slot-scope="{ row, index }", slot="registerOption")
      select(
        v-model="row.registerOption",
        @change="setRegistOptions(row, index, $event)"
      )
        option(v-for="item in registOptions", :value="item.value") {{ item.name }}
  .page-pages(v-if="total > searchForm.pageSize")
    Page(
      :current.sync="searchForm.current",
      :total="total",
      :pageSize="searchForm.pageSize",
      @on-change="loadData"
    )

  // 创建修改券商
  Modal.page-exchange-win(
    v-model="creatWinStatus",
    :title="$lang(createForm.id ? '修改' : '新建')"
  )
    Form(:model="createForm", :label-width="100")
      FormItem(:label="$lang('券商简称')")
        Input(
          v-model="createForm.name",
          :placeholder="$lang('请输入', $lang('券商简称'))"
        )
      FormItem(:label="$lang('券商域名')")
        Input(
          v-model="createForm.apiDomain",
          :placeholder="$lang('请输入', $lang('券商域名'))"
        )
      FormItem(:label="$lang('公司名称')")
        Input(
          v-model="createForm.company",
          :placeholder="$lang('请输入', $lang('公司名称'))"
        )
      FormItem(:label="$lang('邮箱账号')")
        Input(
          v-model="createForm.email",
          :placeholder="$lang('请输入', $lang('邮箱账号'))",
          :disabled="!!createForm.id"
        )
      FormItem(:label="$lang('联系人')")
        Input(
          v-model="createForm.contact",
          :placeholder="$lang('请输入', $lang('联系人'))"
        )
      FormItem(:label="$lang('联系电话')")
        Input(
          v-model="createForm.phone",
          :placeholder="$lang('请输入', $lang('联系电话'))"
        )
      FormItem(:label="$lang('截止时间')")
        DatePicker(
          type="datetime",
          v-model="createForm.dueTime",
          :placeholder="$lang('截止时间')",
          style="width:100%"
        )
      FormItem(:label="$lang('其他信息')")
        Input(
          v-model="createForm.basicInfo",
          :placeholder="$lang('请输入', $lang('其他信息'))"
        )
    Button(
      slot="footer",
      @click="submit",
      type="primary",
      :disabled="loading",
      :loading="loading"
    ) {{ $lang('确定') }}

  // 开启/关闭券商
  Modal(
    v-model="settingsWin",
    :title="$lang(settingsType == 'enable' ? '启用' : '禁用')",
    @on-cancel="cancelSettings"
  )
    Alert {{ $lang('您确定执行此操作吗？') }}
    Input(
      v-model="settingsForm.remark",
      :placeholder="$lang('请输入操作原因')",
      type="textarea",
      :rows="4"
    )
    template(slot="footer")
      Button(@click="settings", :disabled="loading", :loading="loading") {{ $lang('确定') }}

  // 券商用户管理
  Modal.page-exchange-win(v-model="userWin", :title="$lang('状态解除')")
    Form(:label-width="100")
      FormItem(:label="$lang('券商')") {{ userForm.orgId }}-{{ userForm.name }}
      FormItem(:label="$lang('用户邮箱')")
        Input(v-model="userForm.email", :placeholder="$lang('用户邮箱')")
      FormItem(:label="$lang('解除选项')")
        Checkbox(v-model="userForm.unlockAdminLogin") {{ $lang('解绑冻结') }}
        Checkbox(v-model="userForm.unbindGa") {{$lang('解绑GA')}}
        Checkbox(v-model="userForm.unbindPhone") {{$lang('解绑手机')}}
      FormItem(:label="$lang('备注信息')")
        Input(
          v-model="userForm.remark",
          type="textarea",
          :rows="3",
          :placeholder="$lang('请输入', $lang('其他信息'))"
        )
    Button(
      slot="footer",
      @click="changeUser",
      type="primary",
      :disabled="loading",
      :loading="loading"
    ) {{ $lang('确定') }}
  // 添加券商
  Modal.page-exchange-win(v-model="contractWin", :title="$lang('关联交易所')")
    Form(:label-width="100")
      FormItem(:label="$lang('券商')") {{ contractForm.brokerId }}-{{ contractForm.name }}
      FormItem(:label="$lang('选择交易所')")
        Select(v-model="contractForm.exchangeId", filterable)
          Option(
            v-for="item in exchanges",
            :value="item.exchangeId",
            :key="item.exchangeId"
          ) {{ item.exchangeId }}-{{ item.name }}
      FormItem(:label="$lang('信任关系')")
        RadioGroup(v-model="trust")
          Radio(:label="1") {{ $lang('信任') }}
          Radio(:label="0") {{ $lang('不信任') }}
    Button(
      slot="footer",
      @click="addBroker",
      type="primary",
      :disabled="loading",
      :loading="loading"
    ) {{ $lang('确定') }}
  // 后台状态
  Modal(v-model="forbidWin", width="360", @on-cancel="cancelSettings")
    p(slot="header", style="color:#f60;text-align:center")
      Icon(type="ios-information-circle")
      span(v-if="listData[editIndex]") {{ $lang(listData[editIndex].forbidAccessStatus ? '启用' : '禁用') }}
    div(style="text-align:center") {{ $lang('您确定执行此操作吗？') }}
    div(slot="footer")
      Button(
        type="error",
        long,
        @click="forbid",
        :disabled="loading",
        :loading="loading"
      ) {{ $lang('确定') }}
  // 注册选项
  Modal(v-model="registWin", width="360", @on-cancel="cancelSettings")
    p(slot="header") {{ $lang('修改注册选项') }}
    div(style="text-align:center") {{ registerOption | dictFilter }}
    div(style="text-align:center") {{ $lang('您确定执行此操作吗？') }}
    div(slot="footer")
      Button(
        type="error",
        long,
        @click="confirmSetRegistOptions",
        :disabled="loading",
        :loading="loading"
      ) {{ $lang('确定') }}
</template>
<script>
import ClipboardJS from 'clipboard'
export default {
  components: {},
  data() {
    return {
      registerOption: '',
      otcWin: false,
      shareId: '',
      forbidId: '',
      forbidWin: false,
      editIndex: null,

      loading: false,
      loadingTable: true,
      loadingTablesub: false,
      total: 0,

      // 搜索关键字，包含非数字的字符串，处理为券商简称
      searchKeyword: '',
      searchForm: {
        current: 1,
        brokerName: '',
        brokerId: '',
        pageSize: 1000,
      },
      listData: [],

      creatWinStatus: false,
      // 创建/修改/查看共用
      createForm: {
        id: '',
        name: '',
        apiDomain: '',
        saasFeeRate: '',
        company: '',
        email: '',
        contact: '',
        phone: '',
        basicInfo: '',
        instanceId: 1,
        dueTime: '',
      },

      // enable开启 / disable关闭
      settingsType: '',
      settingsWin: false,
      settingsForm: {
        id: '',
        remark: '',
      },
      columns: [
        {
          title: this.$lang('券商'),
          minWidth: 200,
          key: 'brokerId',
          sortable: true,
          sortType: 'desc',
          render: (h, params) =>
            h('span', [params.row.brokerId, params.row.name].join('-')),
        },
        {
          title: this.$lang('截止时间'),
          minWidth: 160,
          key: 'dueTime',
          sortable: true,
          render: (h, params) =>
            h(
              'span',
              params.row.dueTime > 0
                ? this.newDate(params.row.dueTime).format()
                : '----'
            ),
        },
        {
          title: this.$lang('创建时间'),
          minWidth: 160,
          key: 'createdAt',
          render: (h, params) =>
            h('span', this.newDate(params.row.createdAt).format()),
        },
        {
          title: this.$lang('云链接'),
          minWidth: 90,
          slot: 'adminWebUrl',
        },
        {
          title: this.$lang('券商域名'),
          minWidth: 100,
          slot: 'apiDomain',
        },
        {
          title: this.$lang('启用状态'),
          minWidth: 100,
          slot: 'status',
        },
        {
          title: this.$lang('后台状态'),
          minWidth: 100,
          slot: 'adminStatus',
        },

        {
          title: this.$lang('注册选项'),
          minWidth: 180,
          slot: 'registerOption',
        },

        {
          title: this.$lang('操作'),
          minWidth: 160,
          fixed: 'right',
          render: (h, params) => {
            return h('div', [
              h(
                'a',
                {
                  on: {
                    click: () => {
                      this.userWin = true
                      Object.assign(this.userForm, {
                        name: params.row.name,
                        orgId: params.row.brokerId,
                        email: '',
                        unbindGa: false,
                        unbindPhone: false,
                        unlockAdminLogin: false,
                        remark: '',
                      })
                    },
                  },
                },
                this.$lang('用户管理')
              ),
              h('span', ' / '),
              params.row.verifying
                ? h('span', this.$lang('审核中'))
                : h(
                    'a',
                    {
                      on: {
                        click: () => {
                          this.creatWinStatus = true
                          Object.assign(this.createForm, params.row, {
                            dueTime:
                              params.row.dueTime > 0
                                ? this.newDate(params.row.dueTime)
                                : '',
                          })
                        },
                      },
                    },
                    this.$lang('修改')
                  ),
            ])
          },
        },
      ],
      userWin: false,
      userForm: {
        name: '',
        orgId: '',
        email: '',
        unbindGa: false,
        unbindPhone: false,
        unlockAdminLogin: false,
        remark: '',
      },
      contractWin: false,
      trust: '',
      contractForm: {
        name: '',
        brokerId: '',
        exchangeId: '',
        bind: true,
        trust: '',
      },
      exchanges: [],
      // 注册
      registWin: false,
      registOptions: [
        {
          name: this.$lang('邮箱+全部手机'),
          value: 1,
        },
        {
          name: this.$lang('仅手机'),
          value: 2,
        },
        {
          name: this.$lang('仅邮箱'),
          value: 3,
        },
        {
          name: this.$lang('邮箱+中国大陆手机'),
          value: 4,
        },
      ],
    }
  },
  created() {
    this.loadData()
    this.$axios
      .post('/api/v1/exchange/query_simple_exchanges')
      .then((result) => {
        if (result.code === 0) {
          this.exchanges = result.data
        }
      })
  },
  mounted() {
    let clipboard = new ClipboardJS('.copy')
    clipboard.on('success', () => {
      this.$Message.success(this.$lang('已复制'))
    })
  },

  filters: {
    dictFilter(val) {
      switch (val) {
        case 1:
          return '邮箱+全部手机'
        case 2:
          return '仅手机'
        case 3:
          return '仅邮箱'
        case 4:
          return '邮箱+中国大陆手机'
      }
    },
  },

  methods: {
    setOtcShare(row, index) {
      this.otcWin = true
      this.shareId = row.brokerId
      this.editIndex = index
    },
    showForbid(row, index) {
      this.forbidWin = true
      this.forbidId = row.brokerId
      this.editIndex = index
    },
    forbid() {
      this.loading = true
      this.$axios
        .post(
          this.listData[this.editIndex].forbidAccessStatus
            ? '/api/v1/broker/cancel_forbid_access'
            : '/api/v1/broker/forbid_access',
          { id: this.forbidId }
        )
        .then((result) => {
          this.loading = false
          if (result.code == 0) {
            this.forbidWin = false
            this.editIndex = null
            this.loadData()
          }
        })
    },
    cancelSettings() {
      this.forbidWin = false
      this.settingsWin = false
      this.otcWin = false
      this.registWin = false
      this.listData = [...this.listData]
      this.editIndex = null
    },
    changeStatus(row, index) {
      this.editIndex = index
      if (row.enabled) {
        this.settingsType = 'enable'
      } else {
        this.settingsType = 'disable'
      }
      this.settingsWin = true
      this.settingsForm.id = row.id
      this.settingsForm.remark = ''
    },

    changeUser() {
      this.loading = true
      if (this.userForm.email) {
        this.$axios
          .post('/api/v1/broker/change_admin_user_apply', this.userForm)
          .then((result) => {
            this.loading = false
            if (result.code === 0) {
              this.userWin = false
              this.$Notice.success({
                title: this.$lang('成功'),
              })
            }
          })
      } else {
        this.loading = false
        this.userWin = false
      }
    },
    loadData() {
      this.loadingTable = true
      this.searchForm.brokerName = /\D/.test(this.searchKeyword)
        ? this.searchKeyword
        : ''
      this.searchForm.brokerId = !/\D/.test(this.searchKeyword)
        ? this.searchKeyword * 1
        : ''
      this.$axios
        .post('/api/v1/broker/query_broker', this.searchForm)
        .then((result) => {
          this.loadingTable = false
          if (result.code === 0) {
            this.listData = result.data.list.map((el) => {
              el.list = []
              el.registerOption = el.registerOption || 1
              return el
            })
            this.total = result.data.total
          }
        })
    },
    submit() {
      this.loading = true
      let json = Object.assign({}, this.createForm)

      if (json.dueTime) {
        json.dueTime = new Date(json.dueTime).getTime()
      } else {
        json.dueTime = 0
      }

      this.$axios
        .post(
          this.createForm.id
            ? '/api/v1/broker/add_broker_change_verify'
            : '/api/v1/broker',
          json
        )
        .then((result) => {
          this.loading = false
          if (result.code === 0) {
            this.creatWinStatus = false
            this.$Notice.success({
              title: this.$lang('成功'),
            })
          }
          this.loadData()
        })
    },
    addBroker() {
      this.loading = true
      this.$axios
        .post(
          '/api/v1/exchange/edit_org_contract',
          Object.assign(this.contractForm, { trust: !!this.trust })
        )
        .then((result) => {
          this.loading = false
          if (result.code === 0) {
            this.contractWin = false
            this.$Notice.success({
              title: this.$lang('成功'),
            })
          }
        })
    },
    settings() {
      this.loading = true
      this.$axios
        .post(
          this.settingsType == 'enable'
            ? '/api/v1/broker/enable'
            : '/api/v1/broker/disable',
          this.settingsForm
        )
        .then((result) => {
          this.loading = false
          if (result.code === 0) {
            this.settingsWin = false
            this.editIndex = null
            this.$Notice.success({
              title: this.$lang('成功'),
            })
          }
        })
    },
    setRegistOptions(row, index) {
      this.editIndex = index
      this.registerOption = row.registerOption
      this.registWin = true
    },
    confirmSetRegistOptions() {
      this.loading = true
      this.$axios
        .post('/api/v1/broker/edit_register_option', {
          id: this.listData[this.editIndex].id,
          registerOption: this.registerOption,
        })
        .then((ret) => {
          this.loading = false
          this.editIndex = null
          if (ret.code == 0) {
            this.registWin = false
            this.$Notice.success({
              title: this.$lang('成功'),
            })
            this.loadData()
          }
        })
        .catch(() => {
          this.loading = false
          this.editIndex = null
          this.registWin = false
        })
    },
  },
}
</script>
