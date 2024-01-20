<template lang="pug">
Main.page-exchange
  Form
    Row.search(:gutter="15")
      Col(span="20") &nbsp;
      Col(span="4")
        Button(long  type="primary" @click="create()" icon="md-add" ghost) {{$lang('新建')}}
  Table(:columns="columns", :data="listData" , :loading="loadingTable")
  Modal(v-model="userModal", :title="$lang('用户管理')" :loading="loading" width="800" @on-ok="save")
    Form(:model='formData', :labelWidth="120")
      FormItem(:label="$lang('角色名称')")
        Input(v-model='formData.name', :placeholder="$lang('用户姓名')" :readonly="view")
      FormItem(:label="$lang('系统权限')")
        CheckboxGroup(v-model="formData.authPathIds")
          Row(style="font-size:14px;")
            Col(span="6") {{$lang('一级菜单')}}
            Col(span="18")  {{$lang('二级菜单')}}
          Row(v-for="item in menu" style="border-top:1px dashed #dcdee2;padding-top:5px;padding-bottom:5px;" v-if="canuse[item.id]" :key="item.id")
            Col(span="6" style="font-size:14px;")
              Checkbox(:disabled="view" :label="item.id" @click.native="selectAll(item.id,item.children)") {{$lang(item.name)}}
            Col(span="18")
              Checkbox(:disabled="view" :label="_item.id" v-for="_item,index in item.children" @click.native="selectOne(_item.id,item.id)"  v-if="canuse[_item.id]" :key="_item.id + item.id + index") {{$lang(_item.name)}}           
      FormItem(:label="$lang('关联用户')")
        CheckboxGroup(v-model="formData.userIds")
          Checkbox(:disabled="view" :label="item.id" v-for="item in listUser" :key="item.id") {{item.username}}
</template>
<script>
import menu from "@/libs/menu.js";
export default {
  data() {
    return {
      menu,
      view: false,
      formData: {
        roleId: "",
        name: "",
        userIds: [],
        authPathIds: []
      },
      canuse: {},
      userModal: false,
      loadingTable: true,
      loading: true,
      columns: [
        {
          title: this.$lang("创建时间"),
          minWidth:160,
          render: (h, params) =>
            h("span", this.newDate(params.row.createdAt).format())
        },
        {
          title: this.$lang("角色名称"),
          minWidth:160,
          key: "name"
        },
        {
          title: this.$lang("用户数量"),
          minWidth:160,
          key: "userCount"
        },
        {
          title: this.$lang("启/禁用"),
          fixed:"right",
          align:"center",
          width:100,
          render: (h, params) => {
            return h("iSwitch", {
              props: {
                value: params.row.status,
                "true-value": 1,
                "false-value": 2
              },
              on: {
                "on-change": status => {
                  this.roleEnable(status, params.row.roleId);
                }
              }
            });
          }
        },
        {
          title: this.$lang("操作"),
          fixed:"right",
          align:"center",
          width:120,
          render: (h, params) => {
            return h("div", [
              h(
                "a",
                {
                  on: {
                    click: () => {
                      this.create({
                        roleId: params.row.roleId,
                        name: params.row.name
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
                          roleId: params.row.roleId,
                          name: params.row.name
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
      listUser: []
    };
  },
  methods: {
    removeAuthIds(children) {
      this.formData.authPathIds = this.formData.authPathIds.filter(el => {
        return !children.some(_el => el === _el.id);
      });
    },
    selectAuthIds(children) {
      children.forEach(el => this.formData.authPathIds.push(el.id));
    },

    selectOne(id, parentId) {
      setTimeout(() => {
        if (this.formData.authPathIds.some(el => el === id)) {
          this.formData.authPathIds = this.formData.authPathIds.filter(
            el => !(el === parentId)
          );
          this.formData.authPathIds.push(parentId);
        }
      }, 100);
    },
    selectAll(id, children) {
      if (children) {
        setTimeout(() => {
          this.removeAuthIds(children);
          if (this.formData.authPathIds.some(el => el === id)) {
            this.selectAuthIds(children);
          }
        }, 100);
      }
    },
    loadData() {
      this.loadingTable = true;
      this.$axios.post("/api/v1/role_auth/role/list", {}).then(result => {
        this.loadingTable = false;
        this.listData = [];
        if (result.code === 0) {
          this.listData = result.data;
        }
      });
    },
    roleEnable(status, roleId) {
      this.$axios
        .post("/api/v1/role_auth/role/enable", {
          roleId,
          status
        })
        .then(() => {
          this.loadData();
        });
    },
    loadUser(roleId) {
      this.$axios
        .post("/api/v1/role_auth/role/user/list", {
          roleId
        })
        .then(result => {
          this.listUser = result.data;
          this.listUser.forEach(el => {
            if (el.enable) {
              this.formData.userIds.push(el.id);
            }
          });
        });
      this.$axios
        .post("/api/v1/role_auth/role/auth_path/list", {
          roleId
        })
        .then(result => {
          if (result.code === 0) {
            this.formData.authPathIds = result.data;
          }
        });
    },

    save() {
      if (this.view) {
        this.userModal = false;
      } else {
        
        if (
          this.formData.authPathIds.filter(el => el == 33).length &&
          this.formData.authPathIds.filter(el => el == 1001).length == 0
        ) {
          this.formData.authPathIds.push(1001);
        } else {
          this.formData.authPathIds = this.formData.authPathIds.filter(
            el => el !== 1001
          );
        }
        this.$axios
          .post(
            this.formData.roleId
              ? "/api/v1/role_auth/role/update"
              : "/api/v1/role_auth/role/create",
            this.formData
          )
          .then(result => {
            this.loading = false;
            if (result.code == 0) {
              location.reload()
            }
            setTimeout(() => {
              this.loading = true;
            }, 100);
          });
      }
    },
    create(json = { roleId: "", name: "" }, view = false) {
      this.formData = {
        roleId: json.roleId,
        name: json.name,
        userIds: [],
        authPathIds: []
      };
      this.view = view;
      this.userModal = true;
      this.loadUser(json.roleId);
    }
  },
  created() {
    this.$axios.post("/api/v1/role_auth/auth_id/list").then(result => {
      let json = {};
      result.data.forEach(el => {
        json[el] = el;
      });
      this.canuse = json;
      this.loadData();
    });
  }
};
</script>