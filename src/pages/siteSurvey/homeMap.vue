<template>
    <div>
      <Navbar :isStepsShow="false" :isBackBtnShow="false" v-if="!this.referenceID"/>
      <Navbar :isBackBtnShow="false" :stepNumber="1" :showRoofNo="true" v-else/>
      <GoogleMap />
    </div>
</template>


<script>
import GoogleMap from "@/components/googleMap.vue";
import Navbar from "@/components/Navbar.vue";
  export default {
    name:'homeMap',
    data() {
      return {
        checked: true,
        referenceID: this.$route.params.referenceID,
      };
    },

    created() {
      console.log('this.$roohituter:: ', this.referenceID);
    }

  };
</script>

