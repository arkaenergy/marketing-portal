<template>
  <div class="card" :style="cardPadding">
    <div class="card-body">
      <slot name="left"></slot>
      <slot name="right"></slot>
    </div>
  </div>
</template>

<script>
export default {
  props: {
    minWidth: {
      type: [String, Number], // Allow both strings and numbers
      required: false,
      default: null,
    },
    padding:{
      type: [String], // Allow both strings and numbers
      required: false,
      default: '2.25rem 0.7rem',
    }
  },
  computed:{
    cardPadding(){
      return {
        padding: this.padding,
      };   
     }
  },
  methods: {
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
  border: 1px solid #ccc;
  border-radius: 8px;
  /* padding: 2.25rem 0.7rem; */
  /*padding: 2.25rem 1.25rem;*/
  width: 100%;
  height: 100%;
}

.card-body {
  display: flex;
}
</style>
