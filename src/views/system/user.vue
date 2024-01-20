<template lang="pug">
Main.page-exchange
  Form
    Row.search(:gutter="15")
      Col(span="20") &nbsp;
      Col(span="4")
        Button(long  type="primary" @click="create()" icon="md-add" ghost) {{$lang('新建')}}
  Table(:columns="columns", :data="listData" , :loading="loadingTable")
  Modal(v-model="userModal", :title="$lang('用户管理')" width="800")
    Form(:model='formData', :labelWidth="120")
      FormItem(:label="$lang('用户姓名')")
        Input(v-model='formData.username', :placeholder="$lang('用户姓名')")
      FormItem(:label="$lang('登录邮箱')")
        Input(v-model='formData.email', :placeholder="$lang('登录邮箱')" :disabled="!!formData.adminId")
      FormItem(:label="$lang('登录密码')") {{$lang("需要登录邮箱激活设置")}}
      FormItem(:label="$lang('用户电话')")
        Input(v-model='formData.telephone', :placeholder="$lang('用户电话')")
      FormItem(:label="$lang('用户职位')")
        Input(v-model='formData.position', :placeholder="$lang('用户职位')")
      FormItem(:label="$lang('关联角色')")
        CheckboxGroup(v-model="formData.roleIds")
          Checkbox(:label="item.roleId" v-for="item in listAuthId" :key="item.roleId") {{item.name}}
    Button(slot="footer" @click="submit" :loading="loading" :disabled="loading" type="primary") {{$lang('确定')}} 
  Modal(v-model="gaWin", :title="$lang(userInfo.bindGA ? '谷歌验证码' :'手机验证码')" class-name="vertical-center-modal", :mask-closable="false")
    div(v-if="userInfo.bindGA")
      Input(v-model='formData.verifyCode', :maxlength="6")
    Input(v-model='formData.verifyCode', :maxlength="6" v-else)
      div(slot="append")
        span(v-if="time") {{time}}s
        a(v-else @click="getMoileCode") {{$lang("获取验证码")}}
    template(slot="footer")
      Button(type="primary" long @click="advPost", :loading="loading") {{$lang('确定')}}
</template>
<script>
import menu from "@/libs/menu.js";
import { mapState } from "vuex";
export default {
  computed: {
    ...mapState(["userInfo"])
  },
  watch: {
    time() {
      if (this.time) {
        setTimeout(() => {
          this.time--;
        }, 1000);
      }
    }
  },
  data() {
    return {
      gaWin: false,
      time: 0,
      menu,
      view: false,
      formData: {
        adminId: "",
        email: "",
        roleIds: [],
        telephone: "",
        username: "",
        password: "",
        position: "",
        verifyCode: "",
        authType: ""
      },
      userModal: false,
      loadingTable: true,
      loading: false,
      columns: [
        {
          title: this.$lang("时间"),
          minWidth: 160,
          key: "createdAt",
          sort: true,
          sortType: "desc",
          render: (h, params) =>
            h("span", this.newDate(params.row.createdAt).format("yyyy/MM/dd hh:mm"))
        },
        {
          title: this.$lang("用户姓名"),
          minWidth: 160,
          key: "username"
        },
        {
          title: this.$lang("角色"),
          minWidth: 160,
          key: "roleNameList",
          render: (h, params) => h("span", params.row.roleNameList.join(","))
        },
        {
          title: this.$lang("启/禁用"),
          width: 120,
          align: "center",
          fixed: "right",
          render: (h, params) => {
            return h("iSwitch", {
              props: {
                value: params.row.status,
                "true-value": 1,
                "false-value": 2
              },
              on: {
                "on-change": status => {
                  this.userEnable(status, params.row.id);
                }
              }
            });
          }
        },
        {
          title: this.$lang("操作"),
          fixed: "right",
          align: "center",
          width: 120,
          render: (h, params) => {
            return h("div", [
              h(
                "a",
                {
                  on: {
                    click: () => {
                      this.create({
                        adminId: params.row.id,
                        email: params.row.email,
                        telephone: params.row.telephone,
                        username: params.row.username,
                        position: params.row.position
                      });
                    }
                  }
                },
                this.$lang("修改")
              ),
              h("span", " | "),
              h(
                "a",
                {
                  on: {
                    click: () => {
                      this.create(
                        {
                          adminId: params.row.id,
                          email: params.row.email,
                          telephone: params.row.telephone,
                          username: params.row.username,
                          position: params.row.position
                        },
                        true
                      );
                    }
                  }
                },
                this.$lang("详情")
              )
            ]);
          }
        }
      ],
      listData: [],
      listAuthId: []
    };
  },
  methods: {
    getMoileCode() {
      !this.time &&
        this.$axios
          .post("/api/v1/user/send_a_sms_verify_code", {})
          .then(result => {
            if (result.code == 0) {
              this.time = 60;
            }
          });
    },
    loadData() {
      this.loadingTable = true;
      this.$axios.post("/api/v1/role_auth/role/user/list", {}).then(result => {
        this.loadingTable = false;
        this.listData = [];
        if (result.code === 0) {
          this.listData = result.data;
        }
      });
    },
    userEnable(status, adminId) {
      this.$axios
        .post("/api/v1/role_auth/user/enable", {
          adminId,
          status
        })
        .then(() => {
          this.loadData();
        });
    },
    loadUser(adminId) {
      if (adminId) {
        this.$axios
          .post("/api/v1/role_auth/user/show", {
            adminId
          })
          .then(result => {
            let json = result.data;

            this.formData = {
              adminId: json.id,
              email: json.email,
              roleIds: [],
              telephone: json.telephone,
              username: json.username,
              password: "",
              position: json.position
            };
            this.loadRole(adminId);
          });
      } else {
        this.loadRole(adminId);
      }
    },

    loadRole(adminId) {
      this.$axios
        .post("/api/v1/role_auth/role/list", {
          adminId
        })
        .then(result => {
          if (result.code === 0) {
            this.listAuthId = result.data;
            this.listAuthId.forEach(el => {
              if (el.enable) {
                this.formData.roleIds.push(el.roleId);
              }
            });
          }
        });
    },

    async advPost() {
      if (/^\d{6}$/.test(this.formData.verifyCode)) {
        let result = await this.save();
        if (result.code == 0) {
          location.reload();
        }
      } else {
        this.$Message.error(this.$lang("验证码不正确"));
      }
    },

    async submit() {
      if (this.view) {
        this.userModal = false;
      } else {
        let result = await this.save();
        this.loading = false;
        if (result.code == 0) {
          this.formData.verifyCode = "";
          this.gaWin = true;
        }
      }
    },

    save() {
      this.formData.authType = this.userInfo.bindGA ? 1 : 2;
      this.loading = true;
      return this.$axios.post(
        this.formData.adminId
          ? "/api/v1/role_auth/user/update"
          : "/api/v1/role_auth/user/create",
        this.formData
      );
    },
    create(
      json = {
        adminId: "",
        telephone: "",
        email: "",
        username: "",
        position: ""
      },
      view = false
    ) {
      this.formData = {
        adminId: json.adminId,
        email: json.email,
        roleIds: [],
        telephone: json.telephone,
        username: json.username,
        password: "",
        position: json.position
      };
      this.view = view;
      this.userModal = true;
      this.loadUser(json.adminId);
    }
  },
  created() {
    this.loadData();
  }
};
</script>