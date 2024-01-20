<template lang="pug">
Main.page-exchange
  Table.user-table(:loading="loadingTable" :columns="columns", :data="listData")
    template(slot-scope="{row, index }" slot="type") {{$lang(types[row.bizType].name)}}
    template(slot-scope="{row, index }" slot="status") {{$lang(status[rowStatus(row)])}}
    template(slot-scope="{row, index }" slot="verifyHistories")
      template {{$lang(row.myVerifyLevel + '级审核')}}
    template(slot-scope="{row, index }" slot="edit")
      Button(v-if="canEdit(row)" size="small" type="primary" @click="view(row)") {{$lang('审核')}}
      a(@click.prevent="view(row)" v-else) {{$lang('查看')}}
  Modal(v-model="viewWin" width="600" :title="$lang(canEdit(formData)?'审核':'查看')")
    List(border)
      ListItem {{$lang('标题')}} : {{formData.title}}
      template(v-if="formData.bizType==1")

        ListItem {{$lang('描述')}} : {{formData.description}}
        ListItem {{$lang('跨券商')}} : {{formData.moreBrokers?"是":"否"}}
        ListItem {{$lang('转出账户')}}(From AID): <br><br>
          template(v-for="item,index in formData.transferOutAccounts") {{index+1}}. {{item.accountId}} --- {{item.amount+item.tokenId}}<br>
          <br>
        ListItem {{$lang('转入账户')}}(To AID) : {{formData.transferInAccount}}
      template(v-else-if="formData.bizType==3&& formData.verifyContent")
        ListItem {{$lang('券商简称')}} : {{formData.verifyContent.name}}
          Tag(type="border" color="error" v-if="!loading&& beforFormData.name!=formData.verifyContent.name") {{$lang('修改前')}} ：{{beforFormData.name}}
        ListItem {{$lang('券商ID')}} : {{formData.verifyContent.id}}
        ListItem {{$lang('券商域名')}} : {{formData.verifyContent.apiDomain}}
          br
          Tag(type="border" color="error" v-if="!loading&& beforFormData.apiDomain!=formData.verifyContent.apiDomain") {{$lang('修改前')}} ：{{beforFormData.apiDomain}}
        ListItem {{$lang('到期时间')}} : {{formData.verifyContent.dueTime>0? newDate(formData.verifyContent.dueTime).format():$lang('永久')}}
          Tag(type="border" color="error" v-if="!loading&& beforFormData.dueTime!=formData.verifyContent.dueTime") {{$lang('修改前')}} ：{{beforFormData.dueTime>0? newDate(beforFormData.dueTime).format():$lang('永久')}}
        ListItem {{$lang('邮箱账号')}} : {{formData.verifyContent.email}}
          Tag(type="border" color="error" v-if="!loading&& beforFormData.email!=formData.verifyContent.email") {{$lang('修改前')}} ：{{beforFormData.email}}
        ListItem {{$lang('联系人')}} : {{formData.verifyContent.contact}}
          Tag(type="border" color="error" v-if="!loading&& beforFormData.contact!=formData.verifyContent.contact") {{$lang('修改前')}} ：{{beforFormData.contact}}
        ListItem {{$lang('联系电话')}} : {{formData.verifyContent.phone}}
          Tag(type="border" color="error" v-if="!loading&& beforFormData.phone!=formData.verifyContent.phone") {{$lang('修改前')}} ：{{beforFormData.phone}}
        ListItem {{$lang('其他信息')}} : {{formData.verifyContent.basicInfo}}
          Tag(type="border" color="error" v-if="!loading&& beforFormData.basicInfo!=formData.verifyContent.basicInfo") {{$lang('修改前')}} ：{{beforFormData.basicInfo}}

      template(v-else-if="formData.bizType==2&& formData.verifyContent")
        ListItem {{$lang('交易所简称')}} : {{formData.verifyContent.exchangeName}}
          Tag(type="border" color="error" v-if="!loading&& beforFormData.exchangeName!=formData.verifyContent.exchangeName") {{$lang('修改前')}} ：{{beforFormData.exchangeName}}
        ListItem {{$lang('交易所ID')}} : {{formData.verifyContent.id}}
        ListItem {{$lang('公司名称')}} : {{formData.verifyContent.company}}
          Tag(type="border" color="error" v-if="!loading&& beforFormData.company!=formData.verifyContent.company") {{$lang('修改前')}} ：{{beforFormData.company}}
        ListItem {{$lang('邮箱账号')}} : {{formData.verifyContent.email}}
          Tag(type="border" color="error" v-if="!loading&& beforFormData.email!=formData.verifyContent.email") {{$lang('修改前')}} ：{{beforFormData.email}}
        ListItem {{$lang('联系人')}} : {{formData.verifyContent.contactName}}
          Tag(type="border" color="error" v-if="!loading&& beforFormData.contactName!=formData.verifyContent.contactName") {{$lang('修改前')}} ：{{beforFormData.contactName}}
        ListItem {{$lang('联系电话')}} : {{formData.verifyContent.contactTelephone}}
          Tag(type="border" color="error" v-if="!loading&& beforFormData.contactTelephone!=formData.verifyContent.contactTelephone") {{$lang('修改前')}} ：{{beforFormData.contactTelephone}}
        ListItem {{$lang('其他信息')}} : {{formData.verifyContent.remark}}
          Tag(type="border" color="error" v-if="!loading&& beforFormData.remark!=formData.verifyContent.remark") {{$lang('修改前')}} ：{{beforFormData.remark}}
        ListItem(v-if="formData.bizType==2") {{$lang('分佣比例')}} : {{formData.verifyContent.saasFee}}%
          Tag(type="border" color="error" v-if="!loading&& beforFormData.saasFee!=formData.verifyContent.saasFee") {{$lang('修改前')}} ：{{beforFormData.saasFee}}%
      template(v-else-if="formData.bizType==4&& formData.verifyContent")
        ListItem {{$lang('券商ID')}} : {{formData.verifyContent.brokerId}}
        Input(
          v-model="formData.verifyContent.content",
          type="textarea",
          :disabled="true"
          :rows="4"
          :placeholder="$lang('每行对应一个币种')"
        )
      template(v-else-if="formData.bizType==5 && formData.verifyContent")
        ListItem {{$lang('操作')}} :&nbsp;
          span(v-if="formData.verifyContent.unbindGa") {{$lang('解绑GA')}} &nbsp;&nbsp;
          span(v-if="formData.verifyContent.unbindPhone") {{$lang('解绑手机')}} &nbsp;&nbsp;
          span(v-if="formData.verifyContent.unlockAdminLogin") {{$lang('解绑解冻')}} &nbsp;&nbsp;
        ListItem {{$lang('类型')}} : {{formData.verifyContent.broker ? $lang('券商管理端') : $lang('交易所管理端')}} - {{formData.verifyContent.orgId}}
        ListItem {{$lang('邮箱')}} : {{formData.verifyContent.email}}
      template(v-else-if="formData.bizType==6 && formData.verifyContent")
        ListItem {{$lang('券商')}} : {{formData.verifyContent.orgId}}-{{formData.verifyContent.brokerName}}
        ListItem {{$lang('UID')}} : {{formData.verifyContent.userId}}
        ListItem {{$lang('备注')}} : {{formData.verifyContent.remark}}
    template(v-if="canEdit(formData)")
      Divider(orientation="left") {{$lang('审核验证')}}
      div(v-if="userInfo.bindGA")
        Input(v-model='verifyFormData.verifyCode', :maxlength="6")
          span(slot="prepend") {{$lang(userInfo.bindGA ? '谷歌验证码' :'手机验证码')}}
      Input(v-model='verifyFormData.verifyCode', :maxlength="6" v-else)
        span(slot="prepend") {{$lang(userInfo.bindGA ? '谷歌验证码' :'手机验证码')}}
        div(slot="append")
          span(v-if="time") {{time}}s
          a(v-else @click="getMoileCode") {{$lang("获取验证码")}}
    div(slot="footer")
      Row(v-if="canEdit(formData)" :gutter="20")
        Col(span="12")
          Button(style="margin-bottom:15px" long type="error" size="default" @click="handleVerify(false)" :loading="loading") {{$lang('拒绝')}}
        Col(span="12")
          Button(long type="success" size="default" @click="handleVerify(true)" :loading="loading") {{$lang('通过')}}
      template(v-else)
        Button(type="primary" size="default" @click="viewWin=false" :loading="loading" long) {{$lang('确定')}}
</template>
<script>
import { mapState } from "vuex";
export default {
  computed: {
    ...mapState(["userInfo"]),
  },
  watch: {
    time() {
      if (this.time) {
        setTimeout(() => {
          this.time--;
        }, 1000);
      }
    },
  },
  data() {
    return {
      time: 0,
      status: {
        0: "待审核",
        1: "已通过",
        2: "已拒绝",
      },
      types: {
        1: {
          name: "saas转账",
          verifyUrl: "/api/v1/saas_transfer/verify",
          detailUrl: "/api/v1/saas_transfer/detail",
          beforeUrl: "",
        },
        2: {
          //交易所
          name: "修改",
          verifyUrl: "/api/v1/verify_flow/verify_exchange_change",
          detailUrl: "/api/v1/verify_flow/detail",
          beforeUrl: "/api/v1/exchange/query_exchange_detail",
        },
        3: {
          // 券商
          name: "修改",
          verifyUrl: "/api/v1/verify_flow/verify_broker_change",
          detailUrl: "/api/v1/verify_flow/detail",
          beforeUrl: "/api/v1/broker/query_broker_detail",
        },
        4: {
          // 转账白名单
          name: "转账白名单",
          verifyUrl: "/api/v1/broker/verify_transfer_symbol_whitelist",
          detailUrl: "/api/v1/verify_flow/detail",
          beforeUrl: "",
        },
        5: {
          // 操作用户
          name: "操作用户",
          verifyUrl: "/api/v1/verify_flow/verify_admin_user_change",
          detailUrl: "/api/v1/verify_flow/detail",
          beforeUrl: "",
        },
        6: {
          // 24h登录异常解锁
          name: "登录异常解锁",
          verifyUrl: "/api/v1/verify_flow/verify_unfreeze_user_login",
          detailUrl: "/api/v1/verify_flow/detail",
          beforeUrl: "",
        },
        7: {
          // 更换邮箱
          name: "登录异常解锁",
          verifyUrl: "/api/v1/verify_flow/verify_update_user_email",
          detailUrl: "/api/v1/verify_flow/detail",
          beforeUrl: "",
        },
      },
      viewWin: false,
      beforFormData: {
        phone: "",
        apiDomain: "",
        contact: "",
        name: "",
        company: "",
        dueTime: 0,
        email: "",
        basicInfo: "",

        contactTelephone: "",
        contactName: "",
        saasFee: 0.01,
        exchangeName: "",
        remark: "",
      },
      formData: {
        verifyCode: "",
        verifyHistories: [],
      },
      searchForm: {
        lastId: 0,
        pageSize: 100,
      },
      verifyFormData: {
        authType: "",
        verifyCode: "",
        id: "",
        passed: false,
      },
      columns: [
        {
          minWidth: 160,
          title: this.$lang("时间"),
          key: "createdAt",
          render: (h, p) => h("span", this.newDate(p.row.createdAt).format()),
        },
        {
          minWidth: 160,
          title: this.$lang("类型"),
          slot: "type",
        },
        {
          minWidth: 160,
          title: this.$lang("标题"),
          key: "title",
        },
        {
          minWidth: 160,
          title: this.$lang("申请人"),
          key: "adminUserName",
        },
        {
          minWidth: 160,
          title: this.$lang("层级"),
          slot: "verifyHistories",
        },
        {
          minWidth: 160,
          title: this.$lang("状态"),
          slot: "status",
        },
        {
          fixed: "right",
          minWidth: 100,
          title: this.$lang("操作"),
          align: "center",
          slot: "edit",
        },
      ],
      listData: [],
      loading: false,
      loadingTable: false,
    };
  },
  methods: {
    getMoileCode() {
      !this.time &&
        this.$axios
          .post("/api/v1/user/send_saas_sms_verify_code", this.advFormItem)
          .then((result) => {
            if (result.code == 0) {
              this.time = 60;
            }
          });
    },
    handleVerify(passed) {
      this.verifyFormData.authType = this.userInfo.bindGA ? 1 : 2;
      this.verifyFormData.passed = passed;
      if (/^\d{6}$/.test(this.verifyFormData.verifyCode)) {
        this.loading = true;
        this.$axios
          .post(
            this.types[this.formData.bizType].verifyUrl,
            this.verifyFormData
          )
          .then((result) => {
            this.loading = false;
            if (result.code == 0) {
              this.viewWin = false;
              this.load();
            }
          });
      } else {
        this.$Message.error(this.$lang("验证码不正确"));
      }
    },
    view(row) {
      this.viewWin = true;
      this.loading = true;
      this.verifyFormData.verifyCode = "";
      this.verifyFormData.id = row.id;

      this.$axios
        .post(this.types[row.bizType].detailUrl, { id: row.id })
        .then((result) => {
          this.loading = false;
          if (result.code == 0) {
            Object.assign(this.formData, result.data);
            if (row.bizType > 1 && row.bizType != 4 && row.bizType != 5) {
              this.viewBefore(row);
            }
          }
        });
    },
    viewBefore(row) {
      this.loading = true;
      this.$axios
        .post(this.types[row.bizType].beforeUrl, {
          brokerId: row.verifyContent.brokerId,
          exchangeId: row.verifyContent.id,
        })
        .then((result) => {
          this.loading = false;
          if (result.code == 0) {
            Object.assign(this.beforFormData, result.data);
          }
        });
    },
    canEdit(row) {
      return !row.verifyHistories.filter(
        (el) => el.adminUserName == this.userInfo.username
      ).length;
    },
    rowStatus(row) {
      let status = 0;
      row.verifyHistories.forEach((el) => {
        if (el.adminUserName == this.userInfo.username) {
          status = el.verifyStatus;
        }
      });
      return status;
    },
    load() {
      this.loadingTable = true;
      this.listData = [];
      this.$axios
        .post("/api/v1/verify_flow/record_list", this.searchForm)
        .then((result) => {
          this.loadingTable = false;
          if (result.code == 0) {
            this.listData = result.data;
          }
        });
    },
  },
  created() {
    this.load();
  },
};
</script>
