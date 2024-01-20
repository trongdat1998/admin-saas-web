<style scoped>
.expand-row {
  padding: 8px 0;
  border-top: 1px solid #e1e1e1;
}
</style>
<template lang="pug">
  div
      Row(style="padding: 8px 0;")
        Col(span="4") {{$lang('白名单币种')}}:
        Col(span="20") {{iniValue}}
      Row(style="padding: 8px 0;")
        Col(span="4") {{$lang('描述')}}:
        Col(span="20") {{iniDesc}}
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
    row: {
      type: Object,
      default() {
        return {};
      }
    }
  },
  data() {
    return {
      iniValue: '',
      iniDesc: '',
    }
  },
  mounted() {
    this.$axios
      .post("/api/v1/operate/get_transfer_whitelist", {
        brokerId: this.row.brokerId,
      })
      .then((result) => {
        this.iniValue = result.data.iniValue;
        this.iniDesc = result.data.iniDesc;
      });
  },
};
</script>
