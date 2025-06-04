<template>
  <div style="width: 100%">
    <el-table :data="tableData" style="width: 100%">
      <el-table-column
        v-for="column in tableColumns"
        :prop="column.id"
        :label="column.title"
        :width="column.width"
      >
        <template v-slot="scope">
          <div :style="getStyles(scope.row, column)">
            <span v-if="column.type === 'name'">
              <slot name="name" :row="scope.row" :column="column"></slot>
            </span>

            <span v-if="column.type === 'textbox'">
              <slot name="textbox" :row="scope.row" :column="column"></slot>
            </span>

            <span v-if="column.type === 'number_input'">
              <slot
                name="number_input"
                :row="scope.row"
                :column="column"
              ></slot>
            </span>
            <span v-else-if="!column.type">
              {{ scope.row[column.id] }}
            </span>
            <span v-if="column.type === 'edit_application'">
              <slot
                name="edit_application"
                :row="scope.row"
                :column="column"
              ></slot>
            </span>
          </div>
        </template>
      </el-table-column>
    </el-table>
  </div>
</template>

<script setup>
import { ref } from "vue";

const props = defineProps({
  tableData: {
    type: Array,
    required: true,
  },
});


const tableColumns = ref(
  [
  {
    id: "name",
    title: "Application Name",
    type: "name",
    width: 200,
  },
  {
    id: "quantity",
    title: "Quantity",
    type: "number_input",
    width: 220,
  },
  {
    id: "default_load_kw",
    title: "Watt (w)",
    type: "textbox",
    width: 170,
  },
  {
    id: "operating_hour_morning",
    title: "Working Hours (10AM-3PM)",
    type: "number_input",
    width: 200,
  },

  {
    id: "operating_hour_evening",
    title: "Working Hours (3PM-10AM)",
    type: "number_input",
    width: 200,
  },

  {
    id: "edit_application",
    title: "",
    type: "edit_application",
    width: 90,
  },
]
);

const getStyles = (row, column) => {
  // console.log(column);
};
</script>

<style lang="scss" scoped></style>
