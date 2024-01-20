<template lang="pug">
Main.page-exchange
  Row.search(:gutter="15")
    Col(span="20")
      strong(v-if="ip" style="font-size:18px") {{$lang("本机IP")}} : {{ip}}
      | &nbsp;
    Col(span="4")
      Button(type="primary" long ghost @click="createOne") {{$lang('新建')}}
  Alert(type="error" style="margin-top:15px") {{$lang("增加IP白名单后，只有白名单IP才能登录系统，所以请慎重添加。")}}
  Table.user-table(:columns="columns", :data="listData", :loading="loadingTable")
  Modal.page-exchange-win(v-model="createStatus", :title="$lang('新建')"  footer-hide)
    div(style="padding:10px 30px 10px")
      p(style="font-size:14px;margin-bottom:20px") {{$lang('请输入可以登录后台的IP地址')}}
      Row(:gutter="20")
        template(v-for="(item,index) in ipTable")
          Col(span="5")
            Input(:maxlength="3" v-model="ipTable[index]")
          Col(span="1" v-if="index<3")
            span(style="font-size:20px;margin-top:30px") .
      Alert(type="success" style="margin:20px 0") {{$lang("本机IP")}} : {{ip}}
      Button(@click="doCreate" type="primary" long) {{$lang("确定")}}
  Modal(v-model="removeStatus" width="360")
    p(slot="header" style="color:#f60;text-align:center")
      Icon(type="ios-information-circle")
      span {{$lang("删除")}}
    p {{$lang("删除")}} {{$lang('IP地址')}}: {{reItem.ipAddress}} ？
    div(slot="footer")
      Button(type="error" size="large" long @click="doRemove") {{$lang('确定')}}
</template>
<script>
export default {
  data() {
    return {
      ip: "",
      loadingTable: true,
      createStatus: false,
      removeStatus: false,
      loading: true,
      listData: [],
      ipTable: ["", "", "", ""],
      reItem: {},
      columns: [
        {
          title: this.$lang("时间"),
          render: (h, params) =>
            h("span", this.newDate(params.row.created).format())
        },
        {
          title: this.$lang("IP地址"),
          key: "ipAddress"
        },
        {
          title: this.$lang("操作人"),
          key: "adminName"
        },
        {
          title: this.$lang("操作"),
          width: 100,
          render: (h, params) => {
            return h(
              "a",
              {
                on: {
                  click: () => {
                    this.removeStatus = true;
                    this.removeOne(params.row);
                  }
                }
              },
              this.$lang("删除")
            );
          }
        }
      ]
    };
  },
  methods: {
    loadData() {
      this.loadingTable = true;
      this.$axios.post("/api/v1/ip_whitelist/list", {}).then(result => {
        this.loadingTable = false;
        if (result.code === 0) {
          this.listData = result.data;
        }
      });
    },
    createOne() {
      this.createStatus = true;
      this.ipAddress = "";
    },
    removeOne(item) {
      this.reItem = item;
      this.removeStatus = true;
    },
    doRemove() {
      this.$axios
        .post("/api/v1/ip_whitelist/delete", this.reItem)
        .then(result => {
          if (result.code == 0) {
            this.removeStatus = false;
            this.loadData();
          }
        });
    },
    doCreate() {
      let isok = true;

      this.ipTable.forEach(el => {
        if (!/\d/.test(el) || el > 254) {
          isok = false;
        }
      });

      if (isok) {
        let ipAddress = this.ipTable.join(".");
        this.$axios
          .post("/api/v1/ip_whitelist/add", { ipAddress })
          .then(result => {
            if (result.code == 0) {
              this.createStatus = false;
            }
            this.loadData();
          });
      } else {
        this.$Message.error(this.$lang("IP地址不正确"));
      }
    },
    getMyIP() {
      this.$axios.post("/api/v1/ip_whitelist/my_ip", {}).then(result => {
        if (result.code == 0) {
          this.ip = result.data.ip;
        }
      });
    }
  },
  created() {
    this.loadData();
    this.getMyIP();
  }
};
</script>
