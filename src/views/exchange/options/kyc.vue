<style lang="less" scoped>
</style>
<template lang="pug">
.page-exchange
  Row(:gutter="20")
    Col(v-for="(item,index) in listData" :key="index" span="12")
      Card
        template(slot="title")
          strong {{$lang('券商')}}：{{item.brokerId}} - {{countries[item.countryId]}}
        List(border)
          ListItem
            Select(v-model="item.kycLevel")
              Option(:value="_key*1" v-for="(_item,_key) in kycLevels" :key="_key") {{_item}}
          ListItem
            Input(v-model="item.appName")
              span(slot="prepend") {{$lang('产品名称')}}
          ListItem
            Input(v-model="item.companyName")
              span(slot="prepend") {{$lang('公司主体')}}
        template(v-if="item.kycLevel==25")
          Divider {{$lang('人脸识别SDK')}}
          List(border)
            ListItem
              Input(v-model="item.webankAppId")
                span(slot="prepend") {{$lang('人脸识别SDK APPID')}}
            ListItem
              Input(v-model="item.webankAppSecret")
                span(slot="prepend") {{$lang('人脸识别SDK APPSecret')}}
          Row(:gutter="20")
            Col(span="12")
              Divider IOS License
              List(style="margin-bottom:15px" border v-for="_item,_index in item.webankIosLicense" :key="'ios'+ _index")
                ListItem
                  Input(v-model="_item.packageName")
                    span(slot="prepend") {{$lang('包名称')}}
                ListItem
                  Input(v-model="_item.license")
                    span(slot="prepend") {{$lang('License')}}
                ListItem
                  Button(type="error" size="small" @click="remove(index, _index, 'Ios')") {{$lang('删除')}}
              Button(type="primary" ghost @click="newOne(index, 'Ios')" long) {{$lang('添加')}}
            Col(span="12")
              Divider Android License
              List(style="margin-bottom:15px" border v-for="_item,_index in item.webankAndroidLicense" :key="'ios'+ _index")
                ListItem
                  Input(v-model="_item.packageName")
                    span(slot="prepend") {{$lang('包名称')}}
                ListItem
                  Input(v-model="_item.license")
                    span(slot="prepend") {{$lang('License')}}
                ListItem
                  Button(type="error" size="small" @click="remove(index, _index, 'Android')") {{$lang('删除')}}
              Button(type="primary" ghost @click="newOne(index, 'Android')" long) {{$lang('添加')}}
  Fixed
    Row(:gutter="20")
      Col(span="21") &nbsp;
      Col(span="3")
        Button(v-if="loadingTable" loading long)  {{$lang('加载中')}}
        Button(@click="submit", type="primary" :loading="loading" :disabled="loading" long v-else) {{$lang('保存')}}
</template>
<script>
export default {
  data() {
    return {
      brokers: [],
      loading: false,
      loadingTable: false,
      formData: {
        brokerId: "6001"
      },
      listData: [],
      countries: {
        1: this.$lang("中国"),
        0: this.$lang("其他")
      },
      kycLevels: {
        20: this.$lang("手持证件"),
        25: this.$lang("人脸识别")
      }
    };
  },
  methods: {
    newOne(index, type) {
      this.listData[index][`webank${type}License`].push({
        packageName: "",
        license: ""
      });
    },
    remove(index, _index, type) {
      this.listData[index][`webank${type}License`] = this.listData[index][
        `webank${type}License`
      ].filter((el, i) => _index != i);
    },
    load() {
      this.listData = [];
      [1, 0].forEach(el =>
        this.listData.push({
          brokerId: this.formData.brokerId,
          countryId: el,
          kycLevel: 20,
          webankAppId: "",
          webankAppSecret: "",
          webankAndroidLicense: [],
          webankIosLicense: [],
          appName: "",
          companyName: ""
        })
      );
      this.loadingTable = true;
      this.$axios
        .post("/api/v1/broker/broker_kyc_config_list", this.formData)
        .then(result => {
          this.loadingTable = false;
          if (result.code === 0) {
            result.data.forEach(el => {
              this.listData.forEach(_el => {
                if (el.countryId == _el.countryId) {
                  Object.assign(_el, el);
                  _el.webankAndroidLicense = _el.webankAndroidLicense
                    ? JSON.parse(el.webankAndroidLicense)
                    : [];

                  _el.webankIosLicense = _el.webankIosLicense
                    ? JSON.parse(el.webankIosLicense)
                    : [];
                }
              });
            });
          }
        });
    },

    submit() {
      this.loading = true;

      let data = {
        brokerId: this.formData.brokerId,
        configs: []
      };

      this.listData.forEach(el => {
        let temp = Object.assign({}, el);
        if (temp.webankAndroidLicense.length) {
          temp.webankAndroidLicense = JSON.stringify(el.webankAndroidLicense);
        } else {
          temp.webankAndroidLicense = "";
        }
        if (temp.webankIosLicense.length) {
          temp.webankIosLicense = JSON.stringify(el.webankIosLicense);
        } else {
          temp.webankIosLicense = "";
        }
        data.configs.push(temp);
      });

      this.$axios
        .post("/api/v1/broker/add_broker_kyc_config", data)
        .then(result => {
          this.loading = false;
          if (result.code === 0) {
            this.$Notice.success({
              title: this.$lang("成功")
            });
          }
        });
    }
  },
  created() {
    this.$axios.post("/api/v1/broker/query_simple_brokers").then(result => {
      if (result.code === 0) {
        this.brokers = result.data;
        this.formData.brokerId = this.brokers[0].brokerId;
        this.load();
      }
    });
  }
};
</script>
