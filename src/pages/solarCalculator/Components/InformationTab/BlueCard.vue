<template>
  <div class="blue_container_card">
    <div class="cardWrapper">
      <p class="card_description">{{ data.description }}</p>

      <p class="button" @click="handleTabChages">Go to Off-Grid Section</p>
    </div>
  </div>
</template>

<script setup>
const props = defineProps({
  data: Object,
});

const emit = defineEmits(["tabsChanges", "updateData"]);
const handleTabChages = () => {
  emit("tabsChanges");
};
</script>

<style scoped>
.blue_container_card {
  margin-bottom: 30px;
}

.cardWrapper {
  color: black;
  display: flex;
  gap: 5px;
  align-items: center;
}

.button {
  text-decoration: underline;
  cursor: pointer;
  color: var(--Primary-Tata, #006eaf);
  font-family: Arial;
  font-size: 16px;
  font-style: normal;
  font-weight: 700;
  line-height: normal;
}

.blue_container_card {
}

.card_description {
  color: var(--Grey-Black, var(--222, #222));
  font-family: Arial;
  font-size: 16px;
  font-style: normal;
  font-weight: 400;
  line-height: normal;
}

@media screen and (max-width: 1180px) and (min-width: 375px) {
  .cardWrapper {
    /* padding: 10px; */
    display: block;
  }
  .card_description{
    margin-bottom:5px;
  }
}
</style>
