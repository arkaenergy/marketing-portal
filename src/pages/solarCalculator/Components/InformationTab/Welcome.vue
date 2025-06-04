<template>
  <div class="container">
    <div class="wrapper">
      <div>
        <h4 class="infoHeader">Unlock solar savings!</h4>
        <div>
          <p class="infoText">
            Use our Solar Calculator to find out your solar potential
          </p>
          <p class="infoText">and ideal system size instantly.</p>
        </div>
      </div>
    </div>
  </div>
</template>

<script setup></script>

<style scoped>
.container {
  background: url("../../assets/Welcome.png");
  height: 90vh;
}

.wrapper {
  background: rgba(34, 34, 34, 0.2);
  height: 100%;
  display: flex;
  align-items: center;
  justify-content: center;
  text-align: center;
  color: white;
}

.infoText {
  color: var(--White, #fff);
  text-align: center;
  font-family: Arial;
  font-size: 20px;
  font-style: normal;
  font-weight: 700;
  line-height: normal;
}

.infoHeader {
  color: var(--White, #fff);
  text-align: center;
  font-family: Arial;
  font-size: 32px;
  font-style: normal;
  font-weight: 700;
  line-height: normal;
  margin-bottom: 15px;
}
</style>
