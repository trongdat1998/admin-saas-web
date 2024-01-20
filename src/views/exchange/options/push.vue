<style lang="less" scoped>
</style>
<template lang="pug">
.page-exchange
  Row.search(:gutter="15")
    Col(span="20") &nbsp;
    Col(span="4")
      Button(type="primary", @click="create", long icon="md-add-circle" ghost) {{ $lang('新建') }}
  Table(:data="listData", :columns="columns", :loading="loadingTable")
    template(slot-scope="{ row, index }", slot="all")
      iSwitch(
        size="small",
        v-model="row.allSiteSwitchOpen",
        :loading="index === changeIndex",
        @on-change="change(row, index, 'ALL_SITE')"
      )
    template(slot-scope="{ row, index }", slot="custom")
      Tag(v-if="!row.allSiteSwitchOpen") ---
      iSwitch(
        size="small",
        v-model="row.customSwitchOpen",
        :loading="index === changeIndex",
        @on-change="change(row, index, 'CUSTOM')",
        v-else
      )
    template(slot-scope="{ row, index }", slot="edit")
      Button(size="small", type="primary", ghost, @click="edit(row.orgId)") {{ $lang('修改') }}
  Modal(
    v-model="settingsWinStatus",
    :title="$lang('设置')",
    @on-ok="settings",
    @on-cancel="cancel"
  )
    Alert {{ $lang('您确定执行此操作吗？') }}
  Modal(
    v-model="pushWin",
    :title="$lang('Push参数设置')",
    width="900",
    closable,
    :mask-closable="false"
  )
    Select(
      v-model="formData.orgId",
      @on-change="edit",
      style="width:100%",
      filterable
    )
      Option(:value="0") {{ $lang('请选择券商') }}
      Option(
        v-for="item in brokers",
        :value="item.brokerId",
        :key="item.brokerId"
      ) {{ item.brokerId }}-{{ item.name }}
    Divider
    Row(:gutter="20")
      Col(
        span="12",
        v-for="(item, index) in formData.items",
        :key="item.name",
        style="margin-bottom:20px"
      )
        List(border)
          ListItem
            strong {{ item.name }}
          ListItem
            Input(v-model="item.bundleId")
              template(slot="prepend") BundleId
          template(v-if="item.pushChannel === 'APPLE'")
            ListItem
              Input(v-model="item.developerSecretKey")
                template(slot="prepend") {{ $lang('P12文件') }}
                Upload(
                  slot="append",
                  action="/api/v1/sms_sign/upload",
                  name="uploadFile",
                  :on-success="uploadSuccess",
                  :beforeUpload="beforeUpload",
                  :data="{ pushChannel: 'apple', echoStr: index }",
                  :show-upload-list="false"
                )
                  Icon(type="md-cloud-upload", v-show="!uploading")
                  Icon.spin-icon-load(type="ios-loading", v-show="uploading")
            ListItem
              Input(v-model="item.password")
                template(slot="prepend") {{ $lang('P12文件密码') }}
          template(v-else-if="item.pushChannel === 'FCM'")
            ListItem
              Input(v-model="item.fcmDatabaseUrl")
                template(slot="prepend") DatabaseUrl
            ListItem
              Input(v-model="item.developerSecretKey")
                template(slot="prepend") {{ $lang('私钥') }}
                Upload(
                  slot="append",
                  action="/api/v1/sms_sign/upload",
                  name="uploadFile",
                  :on-success="uploadSuccess",
                  :beforeUpload="beforeUpload",
                  :data="{ pushChannel: 'fcm', echoStr: index }",
                  :show-upload-list="false"
                )
                  Icon(type="md-cloud-upload", v-show="!uploading")
                  Icon.spin-icon-load(type="ios-loading", v-show="uploading")
          template(v-else)
            ListItem
              Input(v-model="item.developerAppId")
                template(slot="prepend") APPID
            ListItem
              Input(v-model="item.developerSecretKey")
                template(slot="prepend") APPSECRET
    Button(
      long,
      type="primary",
      :loading="loading",
      slot="footer",
      @click="submit"
    ) {{ $lang('确定') }}
</template>
<script>
let types = [
  {
    name: "appStore",
    orgId: "",
    bundleId: "",
    developerAppId: "",
    developerSecretKey: "",
    appChannel: "appstore",
    password: "",
    fcmDatabaseUrl: "",
    pushChannel: "APPLE",
  },
  {
    name: "Testflight",
    orgId: "",
    bundleId: "",
    developerAppId: "",
    developerSecretKey: "",
    appChannel: "testflight",
    password: "",
    fcmDatabaseUrl: "",
    pushChannel: "APPLE",
  },
  {
    name: "GooglePlay",
    orgId: "",
    bundleId: "",
    developerAppId: "",
    developerSecretKey: "",
    appChannel: "",
    password: "",
    fcmDatabaseUrl: "",
    pushChannel: "FCM",
  },
  {
    name: "Huawei",
    orgId: "",
    bundleId: "",
    developerAppId: "",
    developerSecretKey: "",
    appChannel: "",
    password: "",
    fcmDatabaseUrl: "",
    pushChannel: "HUAWEI",
  },
];
export default {
  data() {
    return {
      uploading: false,
      settingsWinStatus: false,
      changeIndex: null,
      pushWin: false,
      brokers: [],
      loading: false,
      loadingTable: false,
      formData: {
        orgId: "",
        items: [],
      },

      settingsForm: {
        orgId: "",
        switchType: "",
        open: false,
      },

      searchForm: {
        lastId: 0,
        pageSize: 100,
      },
      listData: [],

      columns: [
        {
          title: this.$lang("券商"),
          minWidth: 160,
          key: "orgId",
          render: (h, params) =>
            h("span", `${params.row.orgId}-${params.row.orgName}`)
        },
        {
          title: this.$lang("Push功能总开关"),
          minWidth: 160,
          slot: "all",
        },
        {
          title: this.$lang("自定义运营消息"),
          minWidth: 160,
          slot: "custom",
        },
        {
          title: this.$lang("操作"),
          minWidth: 160,
          slot: "edit",
          align: "right",
        },
      ],
    };
  },
  methods: {
    uploadSuccess(result) {
      this.uploading = false;
      if (result.code != 0) {
        return;
      }
      this.$Notice.success({
        title: this.$lang("成功"),
      });
      this.formData.items[result.data.echoStr].developerSecretKey = result.data.secretKey;
    },
    beforeUpload() {
      this.uploading = true;
    },

    create() {
      this.formData.orgId = 0;
      this.formData.items = types.map((el) => Object.assign({}, el));
      this.pushWin = true;
    },
    edit(orgId) {
      this.loading = true;
      this.formData.orgId = orgId;
      this.formData.items = types.map((el) => Object.assign({}, el));

      this.pushWin = true;
      this.$axios
        .post("/api/v1/sms_sign/get_app_cert_info", { brokerId: orgId })
        .then((result) => {
          this.loading = false;
          if (result.code == 0) {
            this.formData.items.forEach((el) => {
              result.data.items.forEach((_el) => {
                if (
                  el.pushChannel + el.appChannel ==
                  _el.pushChannel + _el.appChannel
                ) {
                  Object.assign(el, _el);
                }
              });
            });
          }
        });
    },

    change(row, index, type) {
      this.settingsWinStatus = true;
      this.settingsForm.orgId = row.orgId;
      this.settingsForm.switchType = type;
      this.settingsForm.open =
        type === "ALL_SITE" ? row.allSiteSwitchOpen : row.customSwitchOpen;

      this.changeIndex = index;
    },

    cancel() {
      this.settingsWinStatus = false;
      this.listData = [...this.listData];
      this.changeIndex = null;
    },

    settings() {
      this.$axios
        .post("/api/v1/sms_sign/edit_app_push_switch", this.settingsForm)
        .then((result) => {
          this.changeIndex = null;
          this.settingsWinStatus = false;
          if (result.code == 0) {
            this.load();
          } else {
            this.listData = [...this.listData];
          }
        });
    },
    load() {
      this.listData = [];

      this.loadingTable = true;
      this.$axios
        .post("/api/v1/sms_sign/get_app_push_switches", this.searchForm)
        .then((result) => {
          this.loadingTable = false;
          if (result.code === 0) {
            this.listData = result.data;
          }
        });
    },

    submit() {
      this.loading = true;

      let data = [];

      this.formData.items.forEach((el) => {
        if (
          el.pushChannel == "APPLE" &&
          el.password &&
          el.bundleId &&
          el.developerSecretKey
        ) {
          data.push(el);
        }

        if (
          el.pushChannel == "FCM" &&
          el.bundleId &&
          el.fcmDatabaseUrl &&
          el.developerSecretKey
        ) {
          data.push(el);
        }

        if (
          el.pushChannel == "HUAWEI" &&
          el.bundleId &&
          el.developerAppId &&
          el.developerSecretKey
        ) {
          data.push(el);
        }
      });

      this.$axios
        .post("/api/v1/sms_sign/edit_app_cert_info", {
          items: data,
          orgId: this.formData.orgId,
        })
        .then((result) => {
          this.loading = false;
          if (result.code === 0) {
            this.pushWin = false;
            this.$Notice.success({
              title: this.$lang("成功"),
            });
            this.load()
          }
        });
    },
  },
  created() {
    this.$axios.post("/api/v1/broker/query_simple_brokers").then((result) => {
      if (result.code === 0) {
        this.brokers = result.data;
        this.formData.brokerId = this.brokers[0].brokerId;
        this.load();
      }
    });
  },
};
</script>
