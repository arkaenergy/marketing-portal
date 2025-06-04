<template>
  <div
    class="card"
    :style="{
      'min-width': minWidth ? getMinWidthStyle(minWidth) : '',
    }"
  >
    <div class="card-header">
      <slot name="header"></slot>
    </div>
    <div class="card-body" v-show="showBody()">
      <div class="card-sub-body">
        <slot name="left"></slot>
        <slot name="right"></slot>
      </div>
      <slot name="footer"></slot>
    </div>
  </div>
</template>

<script>
export default {
  props: {
    collapsibleBody: {
      type: Boolean,
      required: false,
      default: false,
    },
    collapseBody: {
      type: Boolean,
      required: false,
      default: false,
    },
    minWidth: {
      type: [String, Number], // Allow both strings and numbers
      required: false,
      default: null,
    },
  },
  methods: {
    showBody() {
      //collapsible Body not in use=> show body
      if (!this.$props.collapsibleBody) return true;
      else {
        //collapsible body is in use

        //collapse the body=> hide body
        if (this.collapseBody) return false;
        else return true;
      }
    },
    getMinWidthStyle(value) {
      if (typeof value === "number") {
        return value + "px";
      } else if (typeof value === "string") {
        if (
          value.includes("px") ||
          value.includes("%") ||
          value.includes("rem") ||
          value.includes("em")
        ) {
          return value;
        } else {
          return value + "px"; // Default to pixels if no unit is provided
        }
      }
      return "";
    },
  },
};
</script>

<style scoped>
.card {
  border: 1px solid var(--grey-grey-75, #bfbfbf);
  border-radius: 8px;
  width: 100%;
  height: 100%;
  display: flex;
  flex-flow: column;
  justify-content: center;
  align-content: start;
}

.card-body {
  gap: 0.625rem;
  padding: 1.5rem min(2rem, 5%);
  display: flex;
  display: flex;
  flex-direction: column;
  justify-content: center;
  /*make this conditional?*/
  align-items: start;
  width: 100%;
}

.card-sub-body {
  display: flex;
  width: 100%;
}
</style>
