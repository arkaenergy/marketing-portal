<script setup>
// This starter template is using Vue 3 <script setup> SFCs
// Check out https://vuejs.org/api/sfc-script-setup.html#script-setup
</script>

<template>
  <router-view />
</template>

<script>
import API from '@/services/api/';
  export default {
    name: 'App',
    async created(){
      API.SET_DATABASE_URL();
      API.UPDATE_SAS_TOKEN();
    }
  };
</script>

<style>
* {
  padding: 0;
  margin: 0;
  word-break: break-word;
  box-sizing: border-box;
  font-family: "Helvetica Neue";
}

body {
  font-family: "Helvetica Neue";
}

@font-face {
  font-family: "Helvetica Neue";
  src: url(/assets/HelveticaNeue.otf);
}

@font-face {
  font-family: "Switzer";
  src: url("./pages/studio/proposalTemplateReportComponents/assets/fonts/Switzer-Regular.otf");
  font-weight: 400;
}

@font-face {
  font-family: "Switzer";
  src: url("./pages/studio/proposalTemplateReportComponents/assets/fonts/Switzer-Medium.otf");
  font-weight: 500;
}

@font-face {
  font-family: "Switzer";
  src: url("./pages/studio/proposalTemplateReportComponents/assets/fonts/Switzer-Semibold.otf");
  font-weight: 600;
}

</style>
