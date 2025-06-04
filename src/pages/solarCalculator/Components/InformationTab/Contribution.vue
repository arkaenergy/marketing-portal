<template>
  <div class="container">
    <div class="heading">
      <p style="margin-bottom: 10px">{{ newData.label }}</p>
    </div>
    <div>
      <div class="main_inner">
        <div class="infoCard" v-for="options in newData.options">
          <div class="left">
            <img
              :src="selectedImages(options.additional_info.prepend_image)"
              alt="image"
            />
          </div>
          <div class="right">
            <p class="inner_heading">{{ options.label }}</p>
            <p class="inner_content">{{ options.description }}</p>
            <p class="inner_footer">{{ options.field_unit }}</p>
          </div>
        </div>
      </div>
    </div>
  </div>
</template>

<script setup>
import { ref } from "vue";
import Coal from "../../assets/coalBurnt.svg";
import co2 from "../../assets/co2.svg";
import Tree from "../../assets/Plant.svg";

const props = defineProps({
  heading: {
    type: String,
    required: true,
  },
  newData: Object,
});

const carbon = ref(co2);
const coalBurnt = ref(Coal);
const plantTree = ref(Tree);

const selectedImages = (data) => {
  switch (data) {
    case "carbonImage":
      return carbon.value;
      break;
    case "treeImage":
      return plantTree.value;
      break;
    case "coalBurnImage":
      return coalBurnt.value;
      break;
    default:
      return null;
      break;
  }
};
</script>

<style scoped>
.heading {
  color: var(--777, #777);
  font-family: Arial;
  font-size: 24px;
  font-style: normal;
  font-weight: 700;
  line-height: normal;
  border-bottom: 2px solid var(--CCC, #ccc);
  margin-top: 10px;
  margin-bottom: 5px;
}
.infoCard {
  display: flex;
  width: 100%;
  height: 171px;
  /* padding: 0px 16px; */
  gap: 15px;
  border-radius: 8px;
  border: 1px solid var(--CCC, #ccc);
  margin-top: 10px;
}

.main_inner {
  display: flex;
  align-items: center;
  gap: 10px;
}

.left {
  display: flex;
}

.right {
  display: flex;
  flex-direction: column;

  justify-content: space-evenly;
}

.inner_heading {
  color: var(--777, #777);
  font-family: Arial;
  font-size: 20px;
  font-style: normal;
  font-weight: 700;
  line-height: normal;
  width: 90%;
}
.inner_content {
  color: var(--grey-grey-5, #0d0d0d);
  font-family: Arial;
  font-size: 32px;
  font-style: normal;
  font-weight: 700;
  line-height: normal;
}

.inner_footer {
  color: rgba(34, 34, 34, 1);
  font-size: 20px;
  font-weight: 400;
}

.infoHolder {
  color: var(--arka-text, #141414);
  font-family: Switzer;
  font-size: 12px;
  font-style: normal;
  font-weight: 400;
  line-height: normal;
}

@media screen and (max-width: 1180px) and (min-width: 360px) {
  .main_inner {
    display: flex;
    align-items: center;
    gap: 10px;
    flex-direction: column;
  }

  .infoCard {
    gap: 15px;
  }
}
</style>
