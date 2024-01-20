<style scoped>
.expand-row {
  padding: 8px 0;
  border-top: 1px solid #e1e1e1;
}
</style>
<template lang="pug">
div
  Table.user-table(:columns="columns", :data="list" :loading="loadingRomve||loading")
    template(template slot-scope="{ row }" slot="adminWebUrl")
      Icon.copy(size="24" type="ios-copy-outline" :data-clipboard-text="row.adminWebUrl")
    template(template slot-scope="{ row }" slot="apiDomain")
      Icon.copy(size="24" type="ios-copy-outline" :data-clipboard-text="row.apiDomain")
  Modal.page-exchange-win(v-model="contractWin", :title="$lang('解除关系')" width="400")
    Form(:label-width='100')
      FormItem(:label='$lang("交易所")') {{contractForm.exchangeId}}
      FormItem(:label='$lang("券商")') {{contractForm.brokerId}}-{{contractForm.name}}
      FormItem(:label='$lang("信任关系")') {{$lang(contractForm.trust?"信任":"不信任")}}
    Button(slot="footer" @click="addBroker" type="error" long :disabled="loadingRomve" :loading="loadingRomve") {{$lang('解除关系')}} 
</template>
<script>
export default {
  props: {
    list: {
      type: Array,
      default() {
        return [];
      }
    },
    loading: {
      type: Boolean,
      default: false
    },
    expand: {
      type: Function,
      default: () => {}
    }
  },
  methods: {
    addBroker() {
      this.loadingRomve = true;
      this.$axios
        .post(
          "/api/v1/exchange/edit_org_contract",
          Object.assign(this.contractForm, { trust: !!this.trust })
        )
        .then(result => {
          this.loadingRomve = false;
          if (result.code === 0) {
            this.contractWin = false;
            this.expand({ id: this.contractForm.exchangeId }, true);
            this.$Notice.success({
              title: this.$lang("成功")
            });
          }
        });
    }
  },
  data() {
    return {
      loadingRomve: false,
      contractWin: false,
      trust: "",
      contractForm: {
        brokerId: "",
        exchangeId: "",
        name: "",
        bind: false
      },
      columns: [
        {
          title: this.$lang("券商ID"),
          key: "brokerId"
        },
        {
          title: this.$lang("券商简称"),
          key: "name"
        },
        {
          title: this.$lang("创建时间"),
          key: "created",
          render: (h, params) =>
            h("span", this.newDate(params.row.created).format())
        },
        {
          title: this.$lang("前端域名"),
          slot: "apiDomain"
        },
        {
          title: this.$lang("后台域名"),
          slot: "adminWebUrl"
        },
        {
          title: this.$lang("信任关系"),
          key: "trust",
          render: (h, params) => h("span", params.row.trust ? "信任" : "不信任")
        },
        {
          title: this.$lang("操作"),
          key: "brokerId",
          render: (h, params) =>
            h(
              "a",
              {
                on: {
                  click: () => {
                    this.contractWin = true;
                    Object.assign(this.contractForm, params.row);
                  }
                }
              },
              this.$lang("解除关系")
            )
        }
      ]
    };
  }
};
</script>