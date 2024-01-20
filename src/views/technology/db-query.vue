<template lang=pug>
Main.page-exchange
  Row.search(:gutter="15")
    Col(span="4")
      Select(
        v-model="searchForm.namespace",
        style="width:100%",
        filterable,
        placeholder="请选择namespace"
      )
        Option(v-for="item in namespaces", :value="item", :key="item") {{ item }}
    Col(span="4")
      Select(v-model="searchForm.dbName", placeholder="请选择DB")
        Option(v-for="item in dbNames", :value="item", :key="item") {{ item }}
    Col(span="4")
      Select(
        v-model="searchForm.tableName",
        filterable,
        placeholder="请选择Table"
      )
        Option(
          v-for="tableName in tables",
          :value="tableName",
          :key="tableName"
        ) {{ tableName }}
    Col(span="4")
      Button(
        type="primary",
        long,
        @click="createFilter",
        ghost,
        icon="md-add-circle"
      ) {{ $lang('添加过滤') }}

  Card.filterContainer
    .filterHeader(slot="title") {{ '过滤条件' }}
      Button.float-right(
        icon="md-search",
        type="primary",
        @click="excuteQuery"
      ) {{ $lang('查询') }}
    Row.filterConditionRow(v-for="(item, index) in filterConditions")
      Col(span="2") 条件 {{ index + 1 }} :
      Col(span="2")
        Select(
          v-model="item.fieldName",
          @on-change="changeField(item, index, $event)",
          placeholder="请选择字段"
        )
          Option(v-for="index in indexs", :value="index", :key="index") {{ index }}
      Col(span="2")
        Select(v-model="item.fieldCondition", placeholder="请选择字段")
          Option(v-for="symbol in symbols", :value="symbol", :key="symbol") {{ symbol }}

      Col(span="4")
        Input(v-model="item.fieldValue", placeholder="请填入字段值")

      Col
        a.btn-delete(@click="removeFilter(index)")
          Icon(type="md-close")

  Card.filterResult
    .tableResultHeader(slot="title") {{ '查询结果' }}
      Button(icon="md-trash", type="primary", @click="clear") {{ $lang('清除查询结果') }}

    Table.user-table(
      size="small",
      :loading="loadingTable",
      :columns="columns",
      :data="tableData"
    )
</template>
<script>
export default {
  data() {
    return {
      dbTables: [],
      tableIndexs: [],
      searchForm: {
        dbName: "",
        tableName: "",
      },
      namespaces: ["broker", "bhop", "jbex"],
      dbNames: ["broker", "statistics"],
      symbols: ["=", "!=", ">=", "<="],
      columns: [],
      tableData: [],
      filterConditions: [
        {
          fieldName: "",
          fieldCondition: "=",
          fieldValue: "",
        },
      ],
      loadingTable: false,
    };
  },
  mounted() {
    this.getTables();
  },
  computed: {
    tables() {
      return this.dbTables[this.searchForm.dbName];
    },
    indexs() {
      if (!this.searchForm.tableName) {
        return [];
      }
      return this.tableIndexs[
        `${this.searchForm.dbName}.${this.searchForm.tableName}`
      ];
    },
  },
  methods: {
    clear() {
      this.tableData = [];
      this.columns = [];
    },
    getTables() {
      this.$axios.get("/api/v1/dbutils/tables").then((ret) => {
        if (ret.code == 0) {
          const dbTables = {};
          const tableIndexs = {};
          ret.data.forEach((item) => {
            dbTables[item.dbName] = dbTables[item.dbName] || [];
            dbTables[item.dbName].push(item.tableName);
            tableIndexs[`${item.dbName}.${item.tableName}`] = [];
            let fieldSet = new Set();
            item.tableIndexs.split(";").forEach((index) => {
              if (index.indexOf(",") > -1) {
                index.split(",").forEach((i) => {
                  fieldSet.add(i);
                });
              } else {
                fieldSet.add(index);
              }
            });
            tableIndexs[`${item.dbName}.${item.tableName}`] = Array.from(
              fieldSet
            );
          });
          this.dbTables = dbTables;
          this.tableIndexs = tableIndexs;
        }
      });
    },
    excuteQuery() {
      if (!this.filterConditions.length) {
        this.$Message.error("请添加至少一条过滤条件");
        return;
      }
      this.$axios
        .post("/api/v1/dbutils/fetch_one", {
          namespace: this.searchForm.namespace,
          dbName: this.searchForm.dbName,
          tableName: this.searchForm.tableName,
          fields: "*",
          conditions: this.filterConditions
            .filter((item) => {
              return item && item.fieldName != "" && item.fieldValue != "";
            })
            .map(
              (item) =>
                `${item.fieldName}${item.fieldCondition}${item.fieldValue}`
            ),
        })
        .then((result) => {
          if (result.code == 0) {
            if (result.data) {
              this.columns = Object.keys(result.data).map((item) => ({
                title: item,
                key: item,
                width: 150,
              }));
              this.tableData = [result.data];
            }
          }
        });
    },
    createFilter() {
      this.filterConditions.push({
        fieldName: "",
        fieldCondition: "=",
        fieldValue: "",
      });
    },
    removeFilter(index) {
      this.filterConditions.splice(index, 1);
    },
  },
};
</script>
<style lang="less">
.float-right {
  float: right;
}
.filterConditionRow {
  display: flex;
  align-items: center;
  justify-content: space-between;
  margin: 0 auto 10px;
  .filterConditionSymbol {
    text-align: center;
    display: block;
  }
  .btn-delete {
    font-size: 24px;
  }
}
.filterResult {
  margin-top: 20px;

  .tableResultHeader {
    height: 30px;
    display: flex;
    align-items: center;
    justify-content: space-between;
  }
}
.filterHeader {
  height: 30px;
  display: flex;
  align-items: center;
  justify-content: space-between;
}
.user-table {
}
</style>