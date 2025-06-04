<template>
  <div class="appliance-card">
    <ImageCard :collapsibleBody="true" :collapseBody="!isExpanded">
      <template v-slot:header>
        <div
          class="appliance-card-header"
          :style="returnCardStyles()"
          @click="switchArrow"
        >
          <span class="heading-text">{{ heading }}</span>
          <img
            class="arrow-icon"
            src="../../assets/CaretUpFill.svg"
            v-show="isExpanded"
          />
          <img
            class="arrow-icon"
            src="../../assets/CaretDownFill.svg"
            v-show="!isExpanded"
          />
        </div>
      </template>
      <template v-slot:footer>
        <LoadsList
          :appliancesList="appliancesList"
          @openEditAppliance="intermediateOpenEditAppliance"
          @updateAppliance="intermediateUpdateAppliance"
        />
        <!-- <div class="add-more-link"> -->
        <span
          v-if="heading === 'New Appliances'"
          class="link add-more-link"
          @click="addNewAppliance"
          >+ Add more</span
        >
        <!-- </div> -->
      </template>
    </ImageCard>
  </div>
</template>

<script>
import ImageCard from "../reusableImgCard.vue";
import LoadsList from "./loadsList.vue";
export default {
  components: {
    ImageCard,
    LoadsList,
  },
  props: {
    heading: {
      type: String,
      required: false,
      default: "",
    },
    appliancesList: {
      type: Array,
      required: true,
    },
  },
  data() {
    return {
      isExpanded: false,
    };
  },
  methods: {
    switchArrow() {
      console.log("click");
      this.isExpanded = !this.isExpanded;
    },
    intermediateOpenEditAppliance(data, index) {
      this.$emit("openEditAppliance", data, index);
    },
    intermediateUpdateAppliance(data, index) {
      this.$emit("updateAppliance", data, index);
    },
    returnCardStyles() {
      //define border radius as 0 for 3rd and 4th
      //add bottom border
      if (this.isExpanded) {
        return {
          borderRadius: "8px 8px 0 0",
          borderBottom: "1px solid var(--grey-grey-75, #bfbfbf)",
        };
      } else {
        //define border radius as 8px for all
        //remove bottom border
        return {
          borderRadius: "8px",
          borderBottom: "none",
        };
      }
    },
    addNewAppliance() {
      this.$emit("addNewAppliance");
    },
  },
};
</script>

<style scoped>
* {
  font-family: Poppins;
}
.appliance-card {
  margin: 20px 0;
}
.appliance-card-header {
  display: flex;
  justify-content: space-between;
  border-radius: 8px 8px 0px 0px;
  border-bottom: 1px solid var(--grey-grey-75, #bfbfbf);
  background: var(--grey-grey-95, #f2f2f2);
  padding: 1rem 1.25rem;
  cursor: pointer;
}

.heading-text {
  color: var(--black, #222);
  font-family: Poppins;
  font-size: 16px;
  font-style: normal;
  font-weight: 600;
  line-height: normal;
}

.add-more-link {
  align-self: flex-end;
}

.link {
  color: #184d93;
  font-size: 1rem;
  font-style: normal;
  font-weight: 500;
  line-height: 1.625rem;
  cursor: pointer;
}
</style>
