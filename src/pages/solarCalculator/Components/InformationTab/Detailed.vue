<template>
  <div class="container">
    <div class="heading" v-if="showHeading && cardData.label !== 'Title'">
      <p style="margin-bottom: 10px">{{ cardData.label }}</p>
    </div>

    <div class="cardContainer">
      <div
        v-if="cardData.additional_data.cardType == 'Spilted'"
        class="splitted_main"
      >
        <div class="splitted_card">
          <div
            class="right"
            style="display: flex; align-items: center; flex-direction: row"
          >
            <div style="display: flex; flex-direction: column; gap: 20px">
              <p class="inner_heading margin-top_67">
                {{ cardData.options[0].label }}
              </p>
              <div class="inner_info_card">
                <div class="extra">
                  <img :src="dotImage" alt="" />
                  <p class="extra_headings">System Size :</p>
                  <p class="extra_description">
                    {{ cardData.options[0].additional_info.recommended_solar }}
                  </p>
                </div>
                <div class="extra">
                  <img :src="dotImage" alt="" />
                  <p class="extra_headings">Invertor Capacity :</p>
                  <p class="extra_description">
                    {{ cardData.options[0].additional_info.invertor_capacity }}
                  </p>
                </div>
                <div class="extra">
                  <img :src="dotImage" alt="" />
                  <p class="extra_headings">Battery :</p>
                  <p class="extra_description">
                    {{ cardData.options[0].additional_info.battery }}
                  </p>
                </div>
              </div>
            </div>
          </div>
          <div class="left">
            <div
              v-if="cardData.options[0]?.additional_info?.prepend_image"
              style="display: flex; align-items: center"
            >
              <img
                :src="
                  selectedImages(
                    cardData.options[0].additional_info.prepend_image
                  )
                "
                alt="image"
                class="imgClass margin_left"
                :style="{
                  height:
                    cardData.options[0].label === 'Bill With Solar'
                      ? '90px'
                      : '140px',
                }"
              />
              <p
                style="font-size: 16px; font-weight: 700"
                v-if="
                  cardData.options[0]?.additional_info?.additional_prepend_image
                "
              >
                Current Bill
              </p>
              <p
                style="
                  font-size: 16px;
                  font-weight: 700;
                  /* width: 60px; */
                  align-items: center;
                "
                v-if="
                  cardData.options[0]?.additional_info?.additional_prepend_image
                "
              >
                {{ cardData.options[0].additional_info.current_bill }}
              </p>
            </div>

            <div
              v-if="
                cardData.options[0]?.additional_info?.additional_prepend_image
              "
              style="
                display: flex;
                flex-direction: column;
                align-items: center;
                justify-content: center;
              "
            >
              <img
                :src="
                  selectedImages(
                    cardData.options[0].additional_info.additional_prepend_image
                  )
                "
                alt="image"
                class="imgClass"
                :style="{
                  height:
                    cardData.options[0].label === 'Bill With Solar'
                      ? '90px'
                      : '140px',
                }"
              />
              <div
                style="
                  display: flex;
                  align-items: center;
                  flex-direction: column;
                  justify-content: center;
                  width: 100px;
                "
              >
                <p style="font-size: 16px; font-weight: 700">With Solar</p>
                <p
                  style="
                    font-size: 16px;
                    font-weight: 700;
                    /* width: 60px; */
                    align-items: center;
                  "
                >
                  {{ cardData.options[0].additional_info.bill_with_solar }}
                </p>
              </div>
            </div>
          </div>
        </div>
        <div class="splitted_left_section">
          <div
            v-for="item in cardData.options.slice(1, 4)"
            class="infoCard"
            style="width: 100%"
          >
            <div
              class="right"
              style="display: flex; align-items: center; flex-direction: row"
            >
              <div style="display: flex; flex-direction: column; gap: 20px">
                <p class="inner_heading">{{ item.label }}</p>
                <p
                  class="inner_content"
                  v-if="
                    item.question_type !== 'input_info_card' && item.description
                  "
                  style="display: flex; align-items: center"
                >
                  {{ item.description }}
                </p>
                <p
                  class="inner_content"
                  v-if="
                    item.question_type !== 'input_info_card' &&
                    item.description &&
                    item.additional_info.additional_data
                  "
                  style="display: flex; align-items: center"
                >
                  {{ item.additional_info.additional_data }}
                </p>
                <div
                  v-if="item.question_type === 'input_info_card'"
                  class="number_input"
                >
                  <div
                    :class="handleDecreaseStyle('decrease')"
                    style="margin-right: 10px"
                    @click="handleTime(panelNumber, 'decrease', item.label)"
                  >
                    -
                  </div>
                  <div class="time_input">
                    <input
                      type="number"
                      v-model="panelNumber"
                      class="input_time"
                      @input="handleTimeInput(panelNumber, item.label)"
                    />
                    <p style="margin-left: auto" class="unit_text">kW</p>
                  </div>
                  <div class="time_button" style="margin-left: 10px">
                    <p
                      style="margin-bottom: 2px"
                      @click="handleTime(panelNumber, 'increase', item.label)"
                    >
                      +
                    </p>
                  </div>
                </div>
              </div>
            </div>
            <div class="left">
              <div
                v-if="item?.additional_info?.prepend_image"
                style="
                  display: flex;
                  flex-direction: column;
                  align-items: center;
                "
              >
                <img
                  :src="selectedImages(item.additional_info.prepend_image)"
                  alt="image"
                  class="imgClass"
                  :style="{
                    height: item.label === 'Bill With Solar' ? '90px' : '140px',
                  }"
                />
                <p
                  style="font-size: 16px; font-weight: 700"
                  v-if="item?.additional_info?.additional_prepend_image"
                >
                  Current Bill
                </p>
                <p
                  style="
                    font-size: 16px;
                    font-weight: 700;
                    /* width: 60px; */
                    align-items: center;
                  "
                  v-if="item?.additional_info?.additional_prepend_image"
                >
                  {{ item.additional_info.current_bill }}
                </p>
              </div>

              <div
                v-if="item?.additional_info?.additional_prepend_image"
                style="
                  display: flex;
                  flex-direction: column;
                  align-items: center;
                  justify-content: center;
                "
              >
                <img
                  :src="
                    selectedImages(
                      item.additional_info.additional_prepend_image
                    )
                  "
                  alt="image"
                  class="imgClass"
                  :style="{
                    height: item.label === 'Bill With Solar' ? '90px' : '140px',
                  }"
                />
                <div
                  style="
                    display: flex;
                    align-items: center;
                    flex-direction: column;
                    justify-content: center;
                    width: 100px;
                  "
                >
                  <p style="font-size: 16px; font-weight: 700">With Solar</p>
                  <p
                    style="
                      font-size: 16px;
                      font-weight: 700;
                      /* width: 60px; */
                      align-items: center;
                    "
                  >
                    {{ item.additional_info.bill_with_solar }}
                  </p>
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>

      <div
        :class="getStyles(cardData, item)"
        v-for="item in cardData.options"
        v-if="!cardData.additional_data.cardType"
      >
        <div
          class="right"
          style="display: flex; align-items: center; flex-direction: row"
        >
          <div style="display: flex; flex-direction: column; gap: 20px">
            <p class="inner_heading">{{ item.label }}</p>
            <p
              class="inner_content"
              v-if="
                item.question_type !== 'input_info_card' && item.description
              "
              style="display: flex; align-items: center"
            >
              {{ item.description }}
            </p>
            <p
              class="inner_content"
              v-if="
                item.question_type !== 'input_info_card' &&
                item.description &&
                item.additional_info.additional_data
              "
              style="display: flex; align-items: center"
            >
              {{ item.additional_info.additional_data }}
            </p>
            <div
              v-if="item.question_type === 'input_info_card'"
              class="number_input"
            >
              <div
                :class="handleDecreaseStyle('decrease')"
                style="margin-right: 10px"
                @click="handleTime(panelNumber, 'decrease', item.label)"
              >
                -
              </div>
              <div class="time_input">
                <input
                  type="number"
                  v-model="panelNumber"
                  class="input_time"
                  @input="handleTimeInput(panelNumber, item.label)"
                />
                <p style="margin-left: auto" class="unit_text">kW</p>
              </div>
              <div class="time_button" style="margin-left: 10px">
                <p
                  style="margin-bottom: 2px"
                  @click="handleTime(panelNumber, 'increase', item.label)"
                >
                  +
                </p>
              </div>
            </div>
          </div>
        </div>
        <div class="left">
          <div
            v-if="item?.additional_info?.prepend_image"
            style="
              display: flex;
              flex-direction: column;
              align-items: center;
              justify-content: center;
              width: 100px;
            "
          >
            <img
              :src="selectedImages(item.additional_info.prepend_image)"
              alt="image"
              class="imgClass"
              :style="{
                height: item.label === 'Bill With Solar' ? '90px' : '140px',
              }"
            />
            <p
              style="font-size: 16px; font-weight: 700"
              v-if="item?.additional_info?.additional_prepend_image"
            >
              Current Bill
            </p>
            <p
              style="
                font-size: 16px;
                font-weight: 700;
                /* width: 60px; */
                align-items: center;
              "
              v-if="item?.additional_info?.additional_prepend_image"
            >
              {{ item.additional_info.current_bill }}
            </p>
          </div>

          <div
            v-if="item?.additional_info?.additional_prepend_image"
            style="
              display: flex;
              flex-direction: column;
              align-items: center;
              justify-content: center;
            "
          >
            <img
              :src="
                selectedImages(item.additional_info.additional_prepend_image)
              "
              alt="image"
              class="imgClass"
              :style="{
                height: item.label === 'Bill With Solar' ? '90px' : '140px',
              }"
            />
            <div
              style="
                display: flex;
                align-items: center;
                flex-direction: column;
                justify-content: center;
                width: 100px;
              "
            >
              <p style="font-size: 16px; font-weight: 700">With Solar</p>
              <p
                style="
                  font-size: 16px;
                  font-weight: 700;
                  /* width: 60px; */
                  align-items: center;
                "
              >
                {{ item.additional_info.bill_with_solar }}
              </p>
            </div>
          </div>
        </div>
      </div>
    </div>
  </div>
  <div v-for="items in cardData.options" class="note_container">
    <div v-if="items.additional_info.note">
      <span class="note">{{ items.additional_info.note }}</span>
    </div>
  </div>
  <p class="infoHolder" v-if="showInfoHolder">
    {{ infoHolderText }}
  </p>
  <div class="info_container">
    <el-dialog v-model="showInformation" width="45%" title="Information">
      <div v-for="item in cardData.options">
        <div v-if="item.sub_options.length > 0" style="display: flex">
          <div v-for="items in item.sub_options">
            <table>
              <tr>
                <td class="label">Brand</td>
                <td class="label_data">
                  <p v-if="items.options_details[0].brand">
                    {{ items.options_details[0].brand }}
                  </p>
                  <p v-else>-</p>
                </td>
              </tr>
              <tr>
                <td class="label">Model</td>
                <td class="label_data">
                  <p v-if="items.options_details[0].model">
                    {{ items.options_details[0].model }}
                  </p>
                  <p v-else>-</p>
                </td>
              </tr>
              <tr>
                <td class="label">Cell Technology</td>
                <td class="label_data">-</td>
              </tr>
              <tr>
                <td class="label">System Voltage</td>
                <td class="label_data">-</td>
              </tr>
              <tr>
                <td class="label">Type of Solar Panel</td>
                <td class="label_data">
                  <p v-if="items.options_details[0].type">
                    {{ items.options_details[0].type }}
                  </p>
                  <p v-else>-</p>
                </td>
              </tr>
              <tr>
                <td class="label">Nominal Power (W)</td>
                <td class="label_data">
                  <p
                    v-if="
                      items.options_details[0].moduleProperties.nominal_power
                    "
                  >
                    {{
                      items.options_details[0].moduleProperties.nominal_power
                    }}
                  </p>
                  <p v-else>-</p>
                </td>
              </tr>
              <tr>
                <td class="label">Panel Efficiency</td>
                <td class="label_data">
                  <p
                    v-if="items.options_details[0].moduleProperties.efficiency"
                  >
                    {{ items.options_details[0].moduleProperties.efficiency }}
                    %
                  </p>
                  <p v-else>-</p>
                </td>
              </tr>
              <tr>
                <td class="label">Cell-type</td>
                <td class="label_data">
                  <p v-if="items.options_details[0].moduleProperties.cell_type">
                    {{ items.options_details[0].moduleProperties.cell_type }}
                  </p>
                  <p v-else>-</p>
                </td>
              </tr>
              <tr>
                <td class="label">No of Cells</td>
                <td class="label_data">
                  <p
                    v-if="items.options_details[0].moduleProperties.cell_number"
                  >
                    {{ items.options_details[0].moduleProperties.cell_number }}
                  </p>
                  <p v-else>-</p>
                </td>
              </tr>
              <tr>
                <td class="label">Vmpp (Nominal Power Voltage)</td>
                <td class="label_data">
                  <p v-if="items.options_details[0].moduleProperties.vmpp">
                    {{ items.options_details[0].moduleProperties.vmpp }}V
                  </p>
                  <p v-else>-</p>
                </td>
              </tr>
              <tr>
                <td class="label">Open Circuit Voltage (Voc), V</td>
                <td class="label_data">
                  <p v-if="items.options_details[0].moduleProperties.voc">
                    {{ items.options_details[0].moduleProperties.voc }}
                  </p>
                  <p v-else>-</p>
                </td>
              </tr>
              <tr>
                <td class="label">Product Warranty</td>
                <td class="label_data">
                  <p v-if="items.options_details[0].product_warranty">
                    {{ items.options_details[0].product_warranty }}
                  </p>
                  <p v-else>-</p>
                </td>
              </tr>
              <tr>
                <td class="label">Power Warranty</td>
                <td class="label_data">
                  <p v-if="items.options_details[0].power_warranty">
                    {{ items.options_details[0].power_warranty }}
                  </p>
                  <p v-else>-</p>
                </td>
              </tr>
              <tr>
                <td class="label">Description</td>
                <td class="label_data">-</td>
              </tr>
              <tr>
                <td class="label">Dimensions (L*W*H)</td>
                <td class="label_data">
                  {{
                    `${items.options_details[0].moduleProperties.length}mm * ${items.options_details[0].moduleProperties.width}mm * ${items.options_details[0].moduleProperties.height}mm`
                  }}
                </td>
              </tr>
              <tr>
                <td class="label">Area</td>
                <td class="label_data">-</td>
              </tr>
            </table>

            <!-- {{ items.options_details }} -->
          </div>
        </div>
      </div>
    </el-dialog>
  </div>
</template>

<script setup>
import { ref } from "vue";

import MoneySave from "../../assets/MoneySave.svg";
import { solarCalculatorStore } from "../../../store/solarCalculator";
import Returns from "../../assets/Returns.svg";
import Wallet from "../../assets/Wallet.svg";
import Edit from "element-plus";
import Carbon from "../../assets/co2.svg";
import Battery from "../../assets/bigBattery.svg";
import tree from "../../assets/Plant.svg";
import savingMoney from "../../assets/savingMoney.svg";
import Dot from "../../assets/dot.svg";
import coalBurnt from "../../assets/coalBurnt.svg";
import bigMoney from "../../assets/bigMoney.svg";
import systemSize from "../../assets/systemSize.svg";
import Calender from "../../assets/calender.svg";
import charged from "../../assets/charged.svg";
import discharged from "../../assets/discharged.svg";
import Invertor from "../../assets/Invertor.svg";
import areaRequired from "../../assets/areaRequired.svg";

const store = solarCalculatorStore();
const showInformation = ref(false);
const solarCalculatorData = store.calculatorData;
const system_size = solarCalculatorData.system_size;
const panelNumber = ref(system_size);
const systemSizeImage = ref(systemSize);
const dotImage = ref(Dot);
const moneySaveImage = ref(MoneySave);
const batteryImage = ref(Battery);
const walletImage = ref(Wallet);
const chargedImage = ref(charged);
const dischargedImage = ref(discharged);
const bigMoneyImage = ref(bigMoney);
const savingMoneyImage = ref(savingMoney);
const calenderImage = ref(Calender);
const returnsImage = ref(Returns);
const invertorImage = ref(Invertor);
const carbonImage = ref(Carbon);
const treeImage = ref(tree);
const coalBurnImage = ref(coalBurnt);
const areaImage = ref(areaRequired);

const emits = defineEmits(["updateCalculatorsData"]);

const props = defineProps({
  cardData: {
    type: Array,
    required: true,
  },
  heading: {
    type: String,
    required: true,
  },
  showInfoHolder: {
    type: Boolean,
    default: false,
  },
  showHeading: {
    type: Boolean,
    default: true,
  },

  infoHolderText: {
    type: String,
  },

  info_style: {
    type: String,
  },
});

const handleTimeInput = (data, label) => {
  store.UPDATE_CALCULATOR_DATA(data, label);
  store.UPDATE_CALCULATOR_DATA(data, "dc_size");
  handleData();
};

const handleData = () => {
  emits("updateCalculatorsData");
};

const handleTime = (data, method, label) => {
  switch (method) {
    case "decrease":
      if (panelNumber.value > 1) {
        panelNumber.value -= 1;
        handleData();
      }
      store.UPDATE_CALCULATOR_DATA(panelNumber.value, label);
      store.UPDATE_CALCULATOR_DATA(panelNumber.value, "dc_size");

      break;
    case "increase":
      panelNumber.value += 1;
      store.UPDATE_CALCULATOR_DATA(panelNumber.value, label);
      store.UPDATE_CALCULATOR_DATA(panelNumber.value, "dc_size");
      handleData();
    default:
      break;
  }
};

const selectedImages = (data) => {
  switch (data) {
    case "systemSizeImage":
      return systemSizeImage.value;
      break;

    case "batteryImage":
      return batteryImage.value;
      break;
    case "calenderImage":
      return calenderImage.value;
      break;
    case "moneySaveImage":
      return moneySaveImage.value;
      break;
    case "walletImage":
      return walletImage.value;
      break;
    case "chargedImage":
      return chargedImage.value;
      break;
    case "dischargedImage":
      return dischargedImage.value;
      break;
    case "savingMoneyImage":
      return savingMoneyImage.value;
      break;

    case "bigMoneyImage":
      return bigMoneyImage.value;
      break;
    case "returnsImage":
      return returnsImage.value;
      break;
    case "invertorImage":
      return invertorImage.value;
      break;
    case "carbonImage":
      return carbonImage.value;
      break;
    case "treeImage":
      return treeImage.value;
      break;
    case "coalBurnImage":
      return coalBurnImage.value;
      break;
    case "areaImage":
      return areaImage.value;
      break;
    default:
      return null;
      break;
  }
};
const showInformationData = () => {
  showInformation.value = true;
};

const handleDecreaseStyle = (trigger) => {
  if (trigger === "decrease" && panelNumber.value === 1) {
    return "time_button_disabled";
  }

  return "time_button";
};

const handleCalculatorData = (data, label) => {
  store.UPDATE_CALCULATOR_DATA(data, label);
};

const changeStyles = (item) => {};

const getStyles = (data, item) => {
  if (item.additional_info.type) {
    if (item.additional_info.type === "longCard") {
      return "widthCard";
    } else {
      return "infoCard";
    }
  } else {
    return "infoCard";
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
  flex: 1;
  width: 49%;
  height: 24vh;
  justify-content: space-between;
  padding: 18px 16px;
  background: rgba(242, 249, 242, 1);
  gap: 10px;
  border-radius: 8px;
  margin-top: 10px;
}

.widthCard {
  display: flex;
  /* flex: 1; */
  width: 49%;
  height: 20vh;
  padding: 10px 16px;
  justify-content: space-between;
  background: rgba(242, 249, 242, 1);
  gap: 10px;
  border-radius: 8px;
  border: 1px solid var(--CCC, #ccc);
  margin-top: 10px;
}

.left {
  display: flex;
  align-items: center;
}

.right {
  display: flex;
  flex-direction: column;
  align-items: start;
  justify-content: space-evenly;
}

.inner_heading {
  color: rgba(0, 0, 0, 1);
  /* margin-top: 67px; */
  font-family: Arial;
  font-size: 20px;
  font-style: normal;
  font-weight: 400;
  line-height: normal;
  width: 100%;
}

.inner_content {
  color: var(--grey-grey-5, #0d0d0d);
  font-family: Arial;
  font-size: 24px;
  font-style: normal;
  font-weight: 700;
  line-height: normal;
}
.note {
  color: var(--Grey-777, var(--777, #777));
  font-family: Arial;
  font-size: 12px;
  font-style: normal;
  font-weight: 400;
  line-height: normal;
}
.infoHolder {
  color: var(--arka-text, #141414);
  font-family: Switzer;
  font-size: 12px;
  font-style: normal;
  font-weight: 400;
  line-height: normal;
}

.cardContainer {
  display: flex;
  align-items: start;
  gap: 10px;
  flex-wrap: wrap;
}

.number_input >>> .el-input-number__decrease {
  margin-right: 10px;
  border-radius: 25px;
  background-color: #0d0d0d;
  color: white;
  font-size: 20px;

  font-weight: 700;
  height: 30px;
}

.number_input >>> .el-input-number__increase {
  border-radius: 25px;
  background-color: #0d0d0d;
  color: white;
  height: 30px;
  font-size: 20px;
  font-weight: 700;
}

.number_input >>> .el-input__inner {
  border: 1px;
  box-shadow: 0 0 0 1px var(--el-input-border-color, var(--el-border-color))
    inset;
}

.number_input >>> .el-input__inner ::after {
  content: "panels";
  display: block;
}

.container {
  margin-bottom: 8px;
}

.i_icon {
  display: flex;
  align-items: center;
  justify-content: center;
  height: 15px;
  width: 15px;
  background-color: #777;
  border-radius: 50%;
  margin-left: 5px;

  cursor: pointer;
}

.i_content {
  font-size: 12px;
  font-weight: 800;
  font-family: cursive;
  color: white;
  padding-right: 1px;
}

.note_container {
  color: var(--Grey-777, var(--777, #777));
  font-family: Arial;
  font-size: 12px;
  font-style: normal;
  font-weight: 400;
  line-height: normal;
}

.number_input >>> .el-input__wrapper {
  box-shadow: none;
}

.number_input {
  display: flex;
  align-items: center;
}

table {
  width: 100%;
  color: #0d0d0d;
  border-collapse: separate;
  border-spacing: 0 10px;
}

.label {
  width: 50%;
  color: #000;

  font-family: Switzer;
  font-size: 16px;
  font-style: normal;
  font-weight: 600;
  line-height: normal;
}
.splitted_card {
  display: flex;
  align-items: flex-start;
  justify-content: space-between;
  padding: 18px 16px;
  background: rgba(242, 249, 242, 1);
  padding: 18px 16px;
  margin-top: 10px;
  width: 50%;
  border-radius: 8px;
}
.splitted_main {
  display: flex;
  width: 100%;
  gap: 10px;
}

.splitted_left_section {
  width: 50%;
}

.label_data {
  width: 500px;
  color: #000;

  font-family: Switzer;
  font-size: 16px;
  font-style: normal;
  font-weight: 400;
  line-height: normal;
}

.info_container >>> .el-dialog__header {
  background-color: #e8edf2;
  margin: 0;
  border-radius: 8px;
}

.info_container >>> .el-dialog {
  border-radius: 8px;
}

.time_button {
  height: 22px;
  width: 22px;
  border-radius: 50%;
  color: white;
  background-color: #0d0d0d;
  display: flex;
  align-items: center;
  justify-content: center;
  cursor: pointer;
}

.imgClass {
  width: 100px;
}

.margin_left {
  margin-left: auto;
}

.extra {
  display: flex;
  align-items: center;
  gap: 10px;
  width: 150%;
  padding-bottom: 10px;
  border-bottom: 1px solid rgba(204, 204, 204, 1);
  margin-top: 29px;
}

.extra_headings {
  font-size: "24px";
  font-weight: 400;
}
.extra_description {
  font-size: "24px";
  font-weight: 700;
}

.margin-top_67 {
  margin-top: 67px;
}

.time_button_disabled {
  height: 22px;
  width: 22px;
  border-radius: 50%;
  color: white;
  background-color: #ccc;
  display: flex;
  align-items: center;
  justify-content: center;
  cursor: not-allowed;
}

.time_input {
  border-radius: 4px;
  border: 1px solid var(--999, #999);
  background: var(--White, #fff);
  width: 60px;
  padding: 5px;
  display: flex;
  align-items: center;
}

.input_time {
  outline: none;
  border: none;
  width: 20px;
}

.unit_text {
  color: var(--Grey-777, var(--777, #777));
  font-family: Poppins;
  font-size: 14px;
  font-style: normal;
  font-weight: 400;
  line-height: normal;
}

.inner_info_card {
  margin-top: 20px;
  width: 100%;
}

.time_input >>> input[type="number"]::-webkit-inner-spin-button {
  -webkit-appearance: none;
  margin: 0;
}

.info_container >>> .el-dialog__body {
  padding-top: 5px;
}

@media screen and (max-width: 1368px) and (min-width: 912px) {
  .cardContainer {
    flex-direction: column;
    width: 100%;
  }

  .infoCard {
    width: 100%;
    padding: 5px 16px;
    gap: 30px;
  }
  .widthCard {
    width: 100%;
    gap: 30px;
  }
}

@media screen and (max-width: 1180px) and (min-width: 360px) {
  .cardContainer {
    flex-direction: column;
    width: 100%;
  }

  .extra_headings {
    font-size: 14px;
    font-weight: 700;
  }

  .imgClass {
    height: 61.8px;
    width: 56px;
  }

  .extra {
    width: 113%;
    border-bottom: 0;
    margin-top: 0;
  }

  .infoCard {
    width: 100%;
    padding: 5px 16px;
    gap: 30px;
  }

  .widthCard {
    width: 100%;
    gap: 30px;
  }

  .inner_info_card {
    margin-top: 0px;
  }

  .splitted_left_section {
    width: 100%;
  }

  .splitted_card {
    width: 100%;
    height: 24vh;
  }

  .splitted_main {
    flex-direction: column;
  }

  .margin_left {
    margin-left: 0px;
  }

  .inner_heading {
    font-size: 14px;
    font-weight: 400;
    margin-top: 0px;
  }

  .extra_description {
    margin-left: -7px;
  }

  .margin-top_67 {
    margin-top: 0;
  }

  .inner_content {
    font-size: 20px;
    font-weight: 600;
  }
}
</style>
