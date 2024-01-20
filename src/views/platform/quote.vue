<template lang="pug">
Main.page-exchange
  Row.search(:gutter="15")
    Col(span="20") &nbsp;

    Col(span="4")
      Button(
        type="primary",
        ghost,
        @click="saveIndexWin=true,indexConfigNameEditable=false",
        icon="md-add-circle",
        long
      ) {{ $lang('新建') }}
  Table(:columns="this.indexConfigHeaders", :data="this.indexConfigList")
  Modal(v-model="saveIndexWin" :title="$lang('保存指数')" footer-hide width="600")
    Form(:labelWidth="100")
      FormItem(:label="$lang('名称')")
        Input(v-model="indexForm.name", :disabled="indexConfigNameEditable")
      FormItem(:label="$lang('策略')")
        Select(v-model="indexForm.strategy")
          Option(v-for="item,key in indexStrategyMap", :value="key*1", :key="item") {{item}}
      FormItem(:label="$lang('公式')")
        Input(v-model="indexForm.formula" type="textarea" :rows="4")
      Button(long type="success" @click="saveIndex" ghost) {{$lang('保存')}}
</template>
<script>
export default {
  data() {
    return {
      saveIndexWin: false,
      indexConfigNameEditable: true,
      indexConfigList: [],
      indexForm: {
        id: 0,
        name: "",
        strategy: 1,
        formula: ""
      },
      indexStrategyMap: {
        1: this.$lang("倒数"),
        2: this.$lang("平均值"),
        3: this.$lang("加权平均值"),
        4: this.$lang("CAITEX定制HKDT"),
        5: this.$lang("复合平均值")
      },
      indexStrategyList: [],
      indexConfigHeaders: [
        {
          minWidth:120,
          title: "ID",
          key: "id"
        },
        {
          minWidth:120,
          title: this.$lang("名称"),
          key: "name"
        },
        {
          minWidth:120,
          title: this.$lang("策略"),
          key: "strategy",
          render: (h, params) => {
            return h("div", this.indexStrategyMap[params.row.strategy]);
          }
        },
        {
          minWidth:120,
          title: this.$lang("公式"),
          key: "formula"
        },
        {
          minWidth:120,
          title: this.$lang("编辑"),
          align:"right",
          key: "edit",
          render: (h, params) => {
            return h("div", [
              h(
                "Button",
                {
                  props: {
                    type: "primary",
                    size: "small",
                    ghost: true
                  },
                  on: {
                    click: () => {
                      Object.assign(this.indexForm, params.row);

                      this.indexConfigNameEditable = true;
                      this.saveIndexWin = true;
                    }
                  }
                },
                this.$lang("修改")
              )
            ]);
          }
        }
      ]
    };
  },
  created() {
    // this.indexStrategyList.push({
    //   value: 1,
    //   label: this.indexStrategyMap[1]
    // });
    // this.indexStrategyList.push({
    //   value: 2,
    //   label: this.indexStrategyMap[2]
    // });
    // this.indexStrategyList.push({
    //   value: 3,
    //   label: this.indexStrategyMap[3]
    // });
    this.refreshIndexList();
  },
  computed: {},
  methods: {
    saveIndex() {
      this.$axios
        .post("/api/v1/quote/index/save", this.indexForm)
        .then(result => {
          if (result.code == 0) {
            this.$Notice.success({
              title: this.$lang("请求成功")
            });
            this.saveIndexWin = false;
            this.refreshIndexList();
          }
        });
    },
    refreshIndexList() {
      this.$axios
        .get("/api/v1/quote/index/list", {
          page: 1,
          pageSize: 1000
        })
        .then(result => {
          this.indexConfigList = result.data;
        });
    }
  }
};
</script>