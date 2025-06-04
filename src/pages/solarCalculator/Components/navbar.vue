<template>
  <div class="header">
    <div v-if="showNavBar" class="wrapper">
      <img
        src="../assets/tata-power-solar-logo.jpg"
        alt="Tata power"
        class="tata_image"
      />
    </div>
  </div>
</template>

<script setup>
const props = defineProps({
  showNavBar: Boolean,
});

</script>

<style scoped>
.wrapper {
  display: flex;
  height: 9.8vh;
  padding: 16px 24px;
  align-items: center;
  gap: 10px;
  border-bottom: 1px solid var(--White, #fff);
  background: var(--White, #fff);
  box-shadow: 0px 0px 6px 0px rgba(0, 0, 0, 0.25);
}

.tata_image {
  width: 240px;
  height: 35.604px;
  flex-shrink: 0;
}
</style>
