<template lang="pug">
  Main.page-exchange
    Card
      Row(:grtter="15")
        h3 {{ $lang('登录异常解锁') }}
        Col(span="20") &nbsp;
        Col(span="4" style="margin-top: 12px")
          Button(type="primary", ghost, @click="create", icon="md-add-circle", long) {{ $lang('申请') }}
    Card
      Row(:grtter="15")
        h3 {{ $lang('用户邮箱更换') }}
        Col(span="20") &nbsp;
        Col(span="4" style="margin-top: 12px")
          Button(type="primary", ghost, @click="applyChangeUserEmail", icon="md-add-circle", long) {{ $lang('申请') }}
    
    Modal.page-exchange-win(v-model="creatWin", :title="$lang('登录异常解锁')", :loading="loading")
      Form(:model="createForm", :label-width="100")
        FormItem(:label="$lang('券商简称')")
          template(v-for="item in brokers", v-if="item.brokerId === searchForm.orgId") {{ item.brokerId }}-{{ item.name }}
        FormItem(:label="$lang('UID')")
          Input(v-model="createForm.userId", placeholder="userId")
        FormItem(:label="$lang('备注')")
          Input(v-model="createForm.remark", placeholder="remark" type="textarea" :rows="3")
      div(slot="footer")
        Button(@click="doCreate", :loading="loading", :disabled="loading", long, type="primary") {{ $lang('确定') }}

    Modal.page-exchange-win(v-model="changeUserEmailModal", :title="$lang('用户邮箱更换')", :loading="loading")
      Form(:model="changeEmailForm", :label-width="100")
        FormItem(:label="$lang('券商简称')")
          template(v-for="item in brokers", v-if="item.brokerId === searchForm.orgId") {{ item.brokerId }}-{{ item.name }}
        FormItem(:label="$lang('UID')")
          Input(v-model="changeEmailForm.userId", placeholder="userId")
        FormItem(:label="$lang('Email')")
          Input(v-model="changeEmailForm.email", placeholder="Email" type="text")
      div(slot="footer")
        Button(@click="doChangeUserEmail", :loading="loading", :disabled="loading", long, type="primary") {{ $lang('确定') }}


</template>
<script>
export default {
  data() {
    return {
      loading: false,
      loadingTable: true,
      searchForm: {
        orgId: 9001,
      },
      maps: {},
      listData: [],
      brokers: [],
      creatWin: false,
      createForm: {
        orgId: "",
        userId: "",
      },
      changeUserEmailModal: false,
      changeEmailForm: {
        orgId: "",
        userId: "",
        email: "",
      },
    };
  },
  methods: {
    create() {
      this.creatWin = true;
    },
    applyChangeUserEmail() {
      this.changeUserEmailModal = true;
    },
    doCreate() {
      this.createForm.orgId = this.searchForm.orgId;
      this.loading = true;
      this.$axios
        .post("/api/v1/broker_user/unfreeze_user_login_apply", this.createForm)
        .then((result) => {
          this.loading = false;
          if (result.code == 0) {
            this.creatWin = false;
          }
        });
    },
    doChangeUserEmail() {
      this.changeEmailForm.orgId = this.searchForm.orgId;
      this.loading = true;
      this.$axios
        .post(
          "/api/v1/broker_user/update_user_email_apply",
          this.changeEmailForm
        )
        .then((result) => {
          this.loading = false;
          if (result.code == 0) {
            this.changeUserEmailModal = false;
          }
        });
    },
  },
  created() {
    this.$axios.post("/api/v1/broker/query_simple_brokers").then((result) => {
      if (result.code === 0) {
        this.brokers = result.data;
        this.brokers.forEach((el) => {
          this.maps[el.brokerId] = el.name;
        });
        this.searchForm.orgId = result.data[0].brokerId;
      }
    });
  },
};
</script>
