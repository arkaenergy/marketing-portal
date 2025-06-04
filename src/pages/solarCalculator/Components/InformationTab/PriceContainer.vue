<template>
  <div>
    <div class="mainContainer" v-if="data">
      <div class="header">
        <h3 style="margin-bottom: 10px; color: #777">{{ data.label }}</h3>
      </div>
      <div style="display: flex; gap: 10px" class="container">
        <div v-for="items in data.options" style="flex: 1">
          <div style="display: flex; gap: 10px">
            <div v-if="items.sub_options.length === 0" style="flex: 1">
              <div class="priceContainer">
                <div class="priceBody">
                <p style="font-weight: 800; font-size: 16px; color: #777">
                  {{ items.label }}
                </p>
                <p style="color: #777">
                  (excluding delivery, installation & taxes.)
                </p>
                <div style="display: flex; align-items: center">
                  <p style="font-weight: bold; font-size: 24px;font-family: Arial;">
                    {{ items.description }}
                  </p>
                  <div
                    v-if="items.additional_info.information_icon"
                    style="margin-left: 10px"
                  >
                    <el-popover placement="top" :width="330" trigger="click">
                      <template #reference>
                        <div @click="showInformationData" class="i_icon">
                          <span class="i_content"><i> i</i> </span>
                        </div>
                      </template>
                      <div style="display: flex">
                        <div style="flex: 1">
                          <p class="bill_header">Price with battery</p>
                          <p class="bill_price">
                            ₹{{
                              calculatorData.price_with_battery.toLocaleString(
                                "en-IN"
                              )
                            }}
                          </p>
                        </div>
                        <hr />
                        <div
                          style="
                            flex: 1;

                            padding-left: 20px;
                          "
                        >
                          <p class="bill_header">Price without battery</p>
                          <p class="bill_price">
                            ₹{{
                              calculatorData.price_without_battery.toLocaleString(
                                "en-IN"
                              )
                            }}
                            
                          </p>
                        </div>
                      </div>
                    </el-popover>
                  </div>
                </div>
              </div>
                <!-- Additional Info -->
                <div v-if="items.additional_info" style="display: flex;justify-content: left;width:100%;">
                <div v-for="item in items.additional_info.note">
                  <p class="info_note">{{ item.info }}</p>
                  <div >
            <p class="info_note" >
              <span style="font-size: 12px;font-weight: 700;">Disclaimer:</span>
              The price provided here is for informational purposes only and may
              not be current or accurate.
            </p>
          </div>
                </div>
              </div>
              </div>

            </div>
            <div v-else style="flex: 1" class="emiContainer">
              <div class="emiContainerBody">
              <div
                style="
                  display: flex;
                  align-items: end;
                  justify-content: space-between;
                  margin-top: 10px;
                "
              >
                <p style="color: #777; font-weight: 800; font-size: 16px">
                  {{ items.label }}
                </p>

                <p style="font-weight: 700; font-size: 24px;font-family: Arial;">
                  ₹
                  {{
                    calculatorData.emi_amount
                      ? calculatorData.emi_amount.toLocaleString("en-IN")
                      : 0
                  }}
                  /month
                </p>
              </div>

              <div class="emi_calculator">
                <div v-for="data in items.sub_options" class="inner_card">
                  <p style="color: #777; font-weight: 800; font-size: 16px">
                    {{ data.label }}
                  </p>
                  <div
                    style="
                      display: flex;
                      align-items: center;
                      justify-content: space-between;
                    "
                  >
                    <p class="label" style="width: inherit">Loan Amount*</p>
                    <p class="label">
                      ₹ {{ calculatorData.loan_amount.toLocaleString("en-IN") }}
                    </p>
                  </div>
                  <div
                    style="
                      display: flex;
                      align-items: center;
                      justify-content: space-between;
                    "
                    class="input_container"
                  >
                    <p class="label" style="width: 13%">Term</p>
                    <div style="display: flex" class="inner_container">
                      <input
                        type="number"
                        class="input_number"
                        v-model="term"
                        @input="handleEmiTerms(data)"
                        @blur="handleEmiBlur(data)"
                        @keydown="preventSpecialCharacters"
                      />
                      <p style="color: rgb(163, 163, 163)">Years</p>
                    </div>
                  </div>

                  <div
                    style="
                      display: flex;
                      align-items: center;
                      justify-content: space-between;
                    "
                  >
                    <p class="label">Interest Rate</p>
                    <p class="label">{{ data.interest_rate }}</p>
                  </div>

                  <div
                    style="
                      display: flex;
                      align-items: center;
                      justify-content: space-between;
                    "
                    class="emi_slider"
                  >
                    <span class="demonstration">7%</span>

                    <el-slider
                      v-model="data.interest_rate"
                      style="width: 76%"
                      :min="7"
                      :max="14"
                      @change="calculateEmi(data)"
                    ></el-slider>

                    <span>14%</span>
                  </div>
                </div>
              </div>
            </div>
              <!-- Additinal Info -->
              <div  style="display: flex;justify-content: left;width:100%">
                <div>
                  <div style="margin-top: 16px">
            <p class="info_note" style="margin-top: 5px">
              * Maximum loan amount disbursed is 80% of the system price.
            </p>
          </div>
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  </div>
</template>

<script setup>
import { ref } from "vue";
import { solarCalculatorStore } from "../../../store/solarCalculator";
const store = solarCalculatorStore();
const calculatorData = store.calculatorData;
const term = ref(5);

const props = defineProps({
  data: Object,
});

const handleEmiBlur = (data) => {
  if (term.value === "") {
    term.value = 5;
    calculateEmi(data);
  }
};

const preventSpecialCharacters = (e) => {
  if (
    e.key === "e" ||
    e.key === "E" ||
    e.key === "+" ||
    e.key === "-" ||
    e.key === "."
  ) {
    e.preventDefault();
  }
};

const handleEmiTerms = (data) => {
  if (term.value === "") {
    return;
  }

  if (term.value <= 15 && term.value > 0) {
    term.value = Math.round(term.value);
  }

  if (term.value > 15) {
    term.value = 15;
  }

  if (term.value === 0) {
    term.value = 1;
  }

  if (term.value < 0) {
    term.value = 1;
  }

  calculateEmi(data);
};

const calculateEmi = (data) => {
  const system_cost = calculatorData.loan_amount;
  const loan_term_years = parseInt(term.value);
  const interest_rate = data.interest_rate / 1200;
  const loan_months = loan_term_years * 12;

  store.UPDATE_CALCULATOR_DATA(loan_term_years, "Loan Term");
  store.UPDATE_CALCULATOR_DATA(data.interest_rate, "Loan Rate");

  const emi_cost = Math.round(
    (system_cost * interest_rate * Math.pow(1 + interest_rate, loan_months)) /
      (Math.pow(1 + interest_rate, loan_months) - 1)
  );

  const emi = emi_cost;

  store.UPDATE_CALCULATOR_DATA(emi, "emi_update");
};
</script>

<style scoped>
.mainContainer {
  margin-top: 10px;
}

.container {
  margin-top: 10px;
}

.main_container {
  gap: 10px;
  padding: 10px;
}

.header {
  border-bottom: 2px solid var(--CCC, #ccc);
}

.top {
  display: flex;
  gap: 10px;
  margin-top: 10px;
}

.pricingHeader {
  color: var(--777, #777);
  font-family: Arial;
  font-size: 20px;
  font-style: normal;
  font-weight: 700;
  line-height: normal;
}

.pricingInfo {
  color: var(--777, #777);
  font-family: Arial;
  font-size: 16px;
  font-style: normal;
  font-weight: 400;
  line-height: normal;
}

.i_icon {
  display: flex;
  align-items: center;
  justify-content: center;
  height: 20px;
  width: 20px;
  background-color: #777;
  border-radius: 50%;

  margin-top: 1px;
  cursor: pointer;
}

.i_content {
  font-size: 12px;
  font-weight: 800;
  font-family: cursive;
  color: white;
  margin-right: 2px;
}

.pricingValue {
  color: var(--grey-grey-5, #0d0d0d);
  font-family: Arial;
  font-size: 32px;
  font-style: normal;
  font-weight: 700;
  line-height: normal;
}

.info_note {
  color: var(--Grey-777, var(--777, #777));
  font-family: Arial;
  font-size: 12px;
  font-style: normal;
  font-weight: 400;
  line-height: normal;
  margin-top: 10px;
}

.priceContainer {
  box-shadow: 0 0 0 1px var(--el-input-border-color, var(--el-border-color))
    inset;
  border-radius: 8px;
  padding:16px;
  display: flex;
  flex-direction: column;
  height: 280px;

}

.priceBody{
  flex:1;
  display: flex;
  align-items: center;
  justify-content: center;
  flex-direction: column;
  gap: 10px;


}

.label {
  font-weight: 400;
  font-size: 14px;
}

.emiContainer {
  padding: 16px;
  border-radius: 8px;
display: flex;
flex-direction: column;
  box-shadow: 0 0 0 1px var(--el-input-border-color, var(--el-border-color))
    inset;
    height: 280px;
}

.emiContainerBody{
 flex:1
}

.inner_card {
  padding: 10px;
  display: flex;
  gap: 10px;
  flex-direction: column;
}
.emi_calculator {
  border-radius: 8px;
  background-color: var(--777, #edf1f5);
  margin-top: 2vh;
}

.inner_container {
  background-color: var(--777, #edf1f5);
  padding: 5px;
  border-radius: 5px;
  border: 1px solid rgb(202, 202, 202);
}

.input_container >>> .el-input-group {
  width: 12%;
  padding: 0;
  background-color: var(--777, #edf1f5);
  outline: none;
  border: none;
}

.input_container >>> .el-input__wrapper {
  background-color: var(--777, #edf1f5);
  outline: none;
  border: none;
}

.input_number {
  width: 40px;
  background-color: var(--777, #edf1f5);
  outline: none;
  border: none;
}

.emi_slider :deep() .el-slider__bar {
  background-color: #006eaf;
}

.emi_slider :deep() .el-slider__button {
  height: 15px;
  width: 15px;
  border: 3px solid white;
  background-color: #006eaf;
}

.inner_container >>> input[type="number"]::-webkit-inner-spin-button,
.inner_container input[type="number"]::-webkit-outer-spin-button {
  -webkit-appearance: none;
  margin: 0;
}

.bill_header {
  color: var(--Grey-999, var(--999, #999));
  font-family: Arial;
  font-size: 14px;
  font-style: normal;
  font-weight: 700;
  line-height: normal;
}

.bill_price {
  color: var(--Grey-Black, var(--222, #222));
  font-family: Arial;
  font-size: 20px;
  font-style: normal;
  font-weight: 700;
  line-height: normal;
}

.input_container >>> .el-input-group__append,
.el-input-group__prepend {
  padding: 0;
  padding-left: 2px;
  padding-right: 2px;
  background-color: var(--777, #d5d4d4);
}

@media screen and (max-width: 1180px) and (min-width: 360px) {
  .container {
    flex-direction: column;
  }

  .el-slider {
    width: 73%;
  }

  .emiContainer {
    height: auto;
  }
  .priceContainer{
    height: auto;
  }
}

@media screen and (max-width: 1180px) and (min-width: 820px) {
  .priceContainer {
    height: 18vh;
  }
}
</style>
