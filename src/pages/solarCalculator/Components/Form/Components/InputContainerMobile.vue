<template>
  <div>
    <div>
      <!-- <el-card
        v-if="!data.additional_info.no_style"
      > -->
      <!-- :class="getMainContainerStyles()" -->
      <div class="label-text">
        {{ data.label === "Pincode" ? "Location" : data.label }}
      </div>
      <div class="wrapper">
        <!-- <div v-if="data.additional_info.prepend_img">
            <img
              :src="selectedImages(data.additional_info.prepend_img)"
              alt=""
            />
          </div> -->

        <div
          v-if="
            (data.question_type === 'short_answer' ||
              data.question_type === 'number') &&
            data.additional_info.is_images_required &&
            !data.additional_info.is_last_input
          "
          style="width: 100%; marginbottom: 16px"
          class="inputContainer"
        >
          <el-input
            id="inputRef"
            :class="getInputStyles()"
            :maxlength="6"
            pattern="\d*"
            :placeholder="data.description"
            v-model="data.additional_info.default_option"
            @focus="validateFocusedField(data.label)"
            @blur="validateData(data, data.label)"
            @input="
              handleInputValueChange(
                data.additional_info.default_option,
                data.label,
                data
              )
            "
            type="number"
            :controls="false"
            @keydown="preventSpecialCharacters"
          >
            <template
              #append
              v-if="
                data.additional_info.append_img ||
                data.additional_info.append_text
              "
            >
              <el-tooltip
                class="item"
                effect="dark"
                content="Click here to find my location"
                placement="top-start"
              >
                <img
                  v-if="data.additional_info.append_img"
                  @click="getUserLocation(data)"
                  :src="selectedImages(data.additional_info.append_img)"
                  alt="image"
                  style="cursor: pointer; height: 20px; width: 20px"
                />
              </el-tooltip>
              <span v-if="data.additional_info.append_text">{{
                data.additional_info.append_text
              }}</span>
            </template>
          </el-input>
        </div>

        <div
          style="marginbottom: 16px"
          v-if="data.additional_info.is_last_input"
          class=""
        >
          <!-- <p style="margin-left: 10px; color: black; width: inherit">
              {{ data.label }}
            </p> -->

          <div
            v-if="data.additional_info.additional_question == 'multiple_choice'"
            class="multipleInputs"
            style="width: 100%"
          >
            <el-radio-group
              v-model="data.additional_info.additional_default_option"
            >
              <el-radio
                v-for="data in data.additional_info.additional_options"
                :label="data.label"
                >{{ data.label }}</el-radio
              >
            </el-radio-group>
          </div>

          <div
            class="inputContainer"
            style="margin-left: auto; display: flex; align-items: center"
          >
            <el-input
              :placeholder="data.description"
              v-model="data.additional_info.default_option"
              @blur="validateData(data, data.label)"
              @focus="validateFocusedField(data.label)"
              type="number"
              :controls="false"
              @input="
                handleInputValueChange(
                  data.additional_info.default_option,
                  data.label,
                  data
                )
              "
              class="no-arrow-buttons"
              :disabled="handleAdditionalQuestions(data.additional_info)"
              @keydown="preventSpecialCharacters"
            >
              <template #append>
                <div>
                  <span>{{ data.additional_info.append_text }}</span>
                </div>
              </template>
            </el-input>
          </div>
          <div style="margintop: 6px" v-if="data.additional_info.note">
            <p class="note">{{ data.additional_info.note }}</p>
          </div>
        </div>

        <!-- <div
            v-if="!data.additional_info.is_images_required"
            style="margin-top: 3px"
          >
            <p style="color: black" class="media_label">{{ data.label }}</p>
          </div> -->

        <div
          style="marginbottom: 16px"
          v-if="data.question_type === 'multiple_choice'"
          class="multipleInputs"
        >
          <el-radio-group
            v-model="data.additional_info.default_option"
            @change="
              handleInputValueChange(
                data.additional_info.default_option,
                data.label
              )
            "
          >
            <el-radio
              :label="options.option_text"
              v-for="options in data.options"
              :disabled="options.tab_disable"
              >{{ options.option_text }}</el-radio
            >
          </el-radio-group>
        </div>
      </div>
      <!-- </el-card> -->

      <div
        v-if="data.additional_info.no_style && data.question_type !== 'slider'"
        class="multipleInputs"
        style="marginbottom: 16px"
      >
        <!-- <p style="color: black">{{ data.label }}</p> -->
        <el-radio-group
          v-model="data.additional_info.default_option"
          @change="
            handleInputValueChange(
              data.additional_info.default_option,
              data.label
            )
          "
        >
          <el-radio v-for="items in data.options" :label="items.option_text">{{
            items.option_text
          }}</el-radio>
        </el-radio-group>
      </div>

      <div
        style="marginbottom: 16px"
        class="sliderContainer"
        v-if="data.additional_info.no_style && data.question_type === 'slider'"
      >
        <div class="slider_option">
          <!-- <div style="width: 180px">
            <p style="color: black; width: max-content">{{ data.label }}</p>
          </div> -->
          <div class="slider_option_inner">
            <p style="paddingright: 6px">4</p>
            <el-slider
              v-model="sliderValue"
              @input="handleSliderChange()"
              :min="4"
              :max="30"
              class="custom-slider"
            >
            </el-slider>
            <p style="width: 12%; paddingleft: 6px; white-space: nowrap">30</p>
          </div>
          <div class="number_input">
            <img
              :src="handleSliderDecreaseButtons('decrease')"
              @click="handleTariffValueChange('decrease')"
              :class="handleSliderInnerButtons('decrease')"
            />
            <div class="time_input_container">
              <input
                type="number"
                v-model="inputValue"
                class="time_input"
                @input="handleTariffChange()"
                :controls="false"
                @keydown="preventSpecialCharacters"
              />
              <p style="margin-left: auto" class="unit_text">INR</p>
            </div>
            <img
              :src="handleSliderButtons('increase')"
              @click="handleTariffValueChange('increase')"
              :class="handleSliderInnerButtons('increase')"
            />
          </div>
        </div>
      </div>

      <div
        v-if="
          data.label === 'Available Roof Top Area' && errorForm.rooftop_error
        "
        class="warning"
        style="margin-bottom: 10px"
      >
        Your Rooftop area is insufficient to support solar plant
      </div>

      <div
        v-if="
          data.label === 'Available Roof Top Area' && errorForm.max_area_error
        "
        class="info_description"
        style="margin-bottom: 10px"
      >
        Maximum rooftop area limit is 9999999.
      </div>

      <div
        v-if="data.label === 'Pincode' && errorForm.pincode_error === true"
        class="warning"
      >
        Please enter a valid pin code
      </div>

      <div
        v-if="
          data.label === 'Sanction Load' && errorForm.sanction_error === true
        "
        class="warning"
      >
        Should be between 1 and 100
      </div>
      <div
        v-if="data.label === 'Tariff Rates' && errorForm.tariff_error"
        class="warning"
      >
        Should be between 4 and 30
      </div>

      <div
        v-if="data.label === 'Sanction Load' && errorForm.change_phase_error"
        class="info_description"
      >
        Note: Your Phase has been changed to {{ phase }}.
      </div>

      <div
        v-if="data.label === 'Monthly Electricity Bill' && errorForm.bill_error"
        class="warning"
      >
        Should be greater than or equal to 1000
      </div>

      <div
        v-if="
          data.label === 'Monthly Electricity Bill' && errorForm.max_bill_error
        "
        class="info_description"
      >
        Maximum Electricity bill limit is 9999999.
      </div>
    </div>
  </div>
</template>

<script setup>
import { ref } from "vue";
import debounce from "debounce";
import { solarCalculatorStore } from "../../../../store/solarCalculator";
import { GOOGLE_API_KEY } from "../../../../../services/api";
import location from "../../../assets/location.svg";
import pinLocation from "../../../assets/pinLocation.svg";
import money from "../../../assets/money.svg";
import sanctionload from "../../../assets/sanctionload.svg";
import rooftop from "../../../assets/rooftop.svg";
import battery from "../../../assets/battery.svg";
import areaRequired from "../../../assets/areaRequired.svg";
import addButton from "../../../assets/addButton.svg";
import addDisabled from "../../../assets/add_disable.svg";
import subsButton from "../../../assets/substract.svg";
import subsDisabled from "../../../assets/substract_disabled.svg";
import axios from "axios";
import API from '@/services/api';

let isFetchingUserLocation = ref(false);
const props = defineProps({
  data: Object,
  errorForm: Object,
});

const store = solarCalculatorStore();
const calculatorData = store.CALCULATOR_DATA_STATE;

const batteryImg = ref(battery);
const areaImg = ref(areaRequired);
const locationImg = ref(location);
const pinLocationImg = ref(pinLocation);
const sanctionLoadImg = ref(sanctionload);
const moneyImage = ref(money);
const rooftopImage = ref(rooftop);
const add = ref(addButton);
const subs = ref(subsButton);
const addDisabledImg = ref(addDisabled);
const subsDisabledImg = ref(subsDisabled);
const sliderValue = ref(7);
const inputValue = ref(7);
const pin_error = ref(false);
const phase = ref("");

const emits = defineEmits(["changeData", "changeError", "restrictPincode"]);

const validateFocusedField = (item) => {
  emits("changeError", item, false);
};

//onMount call getUserLocation()

const validateData = (data, item) => {
  switch (item) {
    case "Pincode":
      if (data.additional_info.default_option.length < 6) {
        emits("changeError", item, true);
      } else if (
        data.additional_info.default_option.length === 6 &&
        calculatorData.pin_code_error === true
      ) {
        emits("changeError", item, true);
      } else {
        emits("changeError", item, false);
      }

      break;
    case "Monthly Electricity Bill":
      if (
        parseInt(data.additional_info.default_option) <= 9999999 &&
        parseInt(data.additional_info.default_option) >= 0
      ) {
        data.additional_info.default_option = parseInt(
          data.additional_info.default_option
        );
      }
      if (parseInt(data.additional_info.default_option) >= 1000) {
        if (parseInt(data.additional_info.default_option) > 9999999) {
          data.additional_info.default_option = 9999999;
          emits("changeError", "Max Bill", true);

          setTimeout(() => {
            emits("changeError", "Max Bill", false);
          }, 3000);
        }
        emits("changeError", item, false);
      } else {
        emits("changeError", item, true);
      }

      break;

    case "Available Roof Top Area":
      if (
        parseInt(data.additional_info.default_option) <= 9999999 &&
        parseInt(data.additional_info.default_option) >= 0
      ) {
        data.additional_info.default_option = parseInt(
          data.additional_info.default_option
        );
      }
      if (parseInt(data.additional_info.default_option) >= 120) {
        if (parseInt(data.additional_info.default_option) > 9999999) {
          data.additional_info.default_option = 9999999;
          emits("changeError", "Max Area", true);

          setTimeout(() => {
            emits("changeError", "Max Area", false);
          }, 3000);
        }
        emits("changeError", item, false);
      } else {
        emits("changeError", item, true);
      }
      break;

    case "Sanction Load":
      data.additional_info.default_option = parseInt(
        data.additional_info.default_option
      );
      if (
        parseInt(data.additional_info.default_option) > 0 &&
        parseInt(data.additional_info.default_option) < 101
      ) {
        emits("changeError", item, false);
      } else {
        emits("changeError", item, true);
      }
      break;

    default:
      break;
  }
};

const handleAdditionalQuestions = (data) => {
  if (data.additional_question == "multiple_choice") {
    if (data.additional_default_option) {
      return false;
    } else {
      return true;
    }
  } else {
    return false;
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

const selectedImages = (data) => {
  switch (data) {
    case "batteryImg":
      return batteryImg.value;
      break;
    case "locationImg":
      return locationImg.value;
      break;
    case "pinLocationImg":
      return pinLocationImg.value;
      break;
    case "sanctionLoadImg":
      return sanctionLoadImg.value;
      break;
    case "moneyImage":
      return moneyImage.value;
      break;
    case "rooftopImage":
      return rooftopImage.value;
      break;
    case "areaImg":
      return areaImg.value;
      break;
    default:
      return null;
      break;
  }
};

const handleSliderButtons = (trigger) => {
  if (trigger === "increase" && sliderValue.value === 30) {
    return addDisabledImg.value;
  } else {
    return add.value;
  }
};

const handleSliderDecreaseButtons = (trigger) => {
  if (trigger === "decrease" && sliderValue.value === 4) {
    return subsDisabledImg.value;
  } else {
    return subs.value;
  }
};

const handleSliderInnerButtons = (trigger) => {
  if (trigger === "decrease" && sliderValue.value === 4) {
    return "slider_inner_disable_button";
  }

  if (trigger === "increase" && sliderValue.value === 30) {
    return "slider_inner_disable_button";
  }

  return "slider_inner_button";
};

const handleTariffChange = () => {
  const newInputValue = parseInt(inputValue.value);
  console.log(inputValue.value);
  if (inputValue.value === "") {
    store.UPDATE_CALCULATOR_DATA(0, "Tariff Rates");
    console.log(calculatorData);
    return;
  }
  if (inputValue.value < 4) {
    sliderValue.value = 4;
    inputValue.value = Math.round(newInputValue);
    handleInputValueChange(inputValue.value, "Tariff Rates");
  } else {
    sliderValue.value = Math.round(newInputValue);
    inputValue.value = Math.round(newInputValue);
    handleInputValueChange(sliderValue.value, "Tariff Rates");
  }
};

const handleTariffValueChange = (trigger) => {
  if (trigger === "decrease") {
    sliderValue.value -= 1;
    inputValue.value -= 1;
    handleInputValueChange(sliderValue.value, "Tariff Rates");
  }
  if (trigger === "increase") {
    sliderValue.value += 1;
    inputValue.value += 1;
    handleInputValueChange(sliderValue.value, "Tariff Rates");
  }
};

const handleSliderChange = () => {
  inputValue.value = sliderValue.value;
  handleInputValueChange(sliderValue.value, "Tariff Rates");
};

const getUserLocation = (data) => {
  isFetchingUserLocation.value = true;

  const successCallback = async (position) => {
    const long = position.coords.longitude;
    const lat = position.coords.latitude;
    store.UPDATE_CALCULATOR_DATA(lat, "Latitude");
    store.UPDATE_CALCULATOR_DATA(long, "Longitude");
    const qParams={
                            lat:lat,
                            lan:long
                        }
    let response = await API.STUDIO_API.GET_GMAPS_JSON(qParams);

    // const results = response.data.results[0];
    // let addressComponent = results?.address_components?.filter((el) => {
    //   return el.types[0] === "postal_code";
    // });

    let address_pin_code = 0;

    response.data.results.map((address) => {
      address.address_components.map((data) => {
        if (data.types[0] === "postal_code") {
          address_pin_code = data.long_name;
          store.UPDATE_CALCULATOR_DATA(address_pin_code, "Pincode");
        }
      });
    });

    isFetchingUserLocation.value = false;
    const pin = address_pin_code;

    data.additional_info.default_option = pin;
    store.UPDATE_CALCULATOR_DATA(pin, "Pincode");
    emits("changeError", "Pincode", false);
    store.UPDATE_CALCULATOR_DATA(false, "pin_code_error");
  };

  const errorCallback = () => {
    store.UPDATE_CALCULATOR_DATA(true, "pin_code_error");
    ElMessage({
      showClose: true,
      message: "Enable your location to get pin",
      type: "error",
      center: true,
    });
    isFetchingUserLocation.value = false;
  };
  navigator.geolocation.getCurrentPosition(successCallback, errorCallback);
};

const getCoordinatesFromPincode = async (pincode) => {
  // const apiUrl = `https://maps.googleapis.com/maps/api/geocode/json?address=${pincode}&key=${GOOGLE_API_KEY}`;

  try {
     const qParams={
                            pincode:pincode,
                        }
    const response = await API.STUDIO_API.GET_GMAPS_JSON(qParams);
    const data = await response.json();

    if (data.results.length > 0) {
      const location = data.results[0].geometry.location;
      const latitude = location.lat;
      const longitude = location.lng;
      store.UPDATE_CALCULATOR_DATA(latitude, "Latitude");
      store.UPDATE_CALCULATOR_DATA(longitude, "Longitude");

      emits("changeError", "Pincode", false);
      store.UPDATE_CALCULATOR_DATA(false, "pin_code_error");
    } else {
      store.UPDATE_CALCULATOR_DATA(true, "pin_code_error");
    }
  } catch (error) {
    console.error("Error fetching data:", error);
  }
};

const handleInputValueChange = (value, item, data) => {
  const newValue = parseInt(value);
  switch (item) {
    case "Pincode":
      if (data.additional_info.default_option.length > 6) {
        data.additional_info.default_option =
          data.additional_info.default_option.slice(0, 6);
      }
      if (value.length === 6) {
        store.UPDATE_CALCULATOR_DATA(value, item);
        getCoordinatesFromPincode(value);
      }

      break;
    case "Category":
      store.UPDATE_CALCULATOR_DATA(value, item);

      break;
    case "Sanction Load":
      store.UPDATE_CALCULATOR_DATA(data.additional_info.default_option, item);
      if (data.additional_info.default_option.length > 3) {
        data.additional_info.default_option =
          data.additional_info.default_option.slice(0, 3);
        store.UPDATE_CALCULATOR_DATA(data.additional_info.default_option, item);
      }

      if (newValue > 0 && newValue <= 100) {
        store.UPDATE_CALCULATOR_DATA(value, item);

        if (newValue > 3) {
          if (newValue === 4 || newValue === 5) {
            emits("changeData", "neutral", false);
          }
          if (newValue >= 6) {
            phase.value = "three phase";
            if (calculatorData.supply_phase === "Three Phase") {
              emits("changeData", "Three Phase", true);
              emits("changeError", "Power Supply Phase", false);
            } else {
              emits("changeData", "Three Phase", true);
              emits("changeError", "Power Supply Phase", true);
            }
            store.UPDATE_CALCULATOR_DATA("Three Phase", "Power Supply Phase");

            setTimeout(() => {
              emits("changeError", "Power Supply Phase", false);
            }, 2000);
          }
        }
        if (newValue <= 3) {
          phase.value = "single phase";
          if (calculatorData.supply_phase === "Single Phase") {
            emits("changeData", "Single Phase", true);
            emits("changeError", "Power Supply Phase", false);
          } else {
            emits("changeData", "Single Phase", true);
            emits("changeError", "Power Supply Phase", true);
          }
          store.UPDATE_CALCULATOR_DATA("Single Phase", "Power Supply Phase");
          setTimeout(() => {
            emits("changeError", "Power Supply Phase", false);
          }, 2000);
        }
      }

      break;
    case "Monthly Electricity Bill":
      store.UPDATE_CALCULATOR_DATA(value, "Electricity Bill");
      if (data.additional_info.default_option.length > 7) {
        data.additional_info.default_option =
          data.additional_info.default_option.slice(0, 7);
        store.UPDATE_CALCULATOR_DATA(
          data.additional_info.default_option,
          "Electricity Bill"
        );
      }

      break;
    case "Available Roof Top Area":
      store.UPDATE_CALCULATOR_DATA(value, "Rooftop Area");
      if (data.additional_info.default_option.length > 7) {
        data.additional_info.default_option =
          data.additional_info.default_option.slice(0, 7);
        store.UPDATE_CALCULATOR_DATA(
          data.additional_info.default_option,
          "Rooftop Area"
        );
      }

      break;
    default:
      store.UPDATE_CALCULATOR_DATA(value, item);
      break;
  }
};

const errorMap = {
  Pincode: "pincode_error",
  "Sanction Load": "sanction_error",
  "Tariff Rates": "tariff_error",
  "Available Roof Top Area": "rooftop_error",
  "Monthly Electricity Bill": "bill_error",
};

const getMainContainerStyles = () => {
  const errorName = errorMap[props.data.label];

  if (errorName && props.errorForm[errorName] === true) {
    return "errorContainer";
  }
  return "mainContainer";
};

const getInputStyles = () => {
  const errorName = errorMap[props.data.label];

  if (errorName && props.errorForm[errorName] === true) {
    return "errorInput";
  }
  return "no-spinner";
};
</script>

<style scoped>
.label-text {
  font-size: 0.875rem;
  font-weight: 600;
  line-height: 1.375rem;
  color: #777777;
  margin-bottom: 2px;
}

.mainContainer {
  padding: 6px 16px;
  margin-bottom: 8px;
  border-radius: 8px;
  background: var(--White, #fff);
  box-shadow: 0px 0px 6px 0px rgba(0, 0, 0, 0.15);
  /* height: 55px; */
  margin-top: 8px;
}

.errorContainer {
  padding: 5px 12px;
  margin-bottom: 8px;
  border-radius: 8px;
  background: var(--White, #fff);
  box-shadow: 0px 0px 6px 0px rgba(0, 0, 0, 0.15);
  /* height: 50px; */
  margin-top: 8px;
  border: 1px solid red;
  color: red;
}

.lastInput {
  /* width: 25px; */
  text-align: end;
  border: none;
  outline: none;
}

.no-arrow-buttons >>> input[type="number"]::-webkit-inner-spin-button {
  -webkit-appearance: none;
  margin: 0;
}

.time_input_container >>> input[type="number"]::-webkit-inner-spin-button {
  -webkit-appearance: none;
  margin: 0;
}

.no-arrow-buttons {
  width: 100%;
}

.errorInput >>> .el-input__inner {
  color: red;
}

.lastInputContainer {
  display: flex;
  align-items: center;
  width: 100%;
}

.inputContainer {
  min-width: 356px;
  height: 48px;
  padding: 12px;
  border-radius: 4px;
  border-width: 1px;
  border-color: #999999;
  border-style: solid;
}

.inputContainer >>> .el-input__inner {
  height: 24px;
  background-color: white;
}

.lastInputContainer >>> .el-input__inner {
  text-align: right;
  color: black;
  background-color: white !important;
  padding: 7px;
}

.unit_text {
  color: var(--Grey-777, var(--777, #777));
  font-family: Poppins;
  font-size: 12px;
  font-style: normal;
  font-weight: 400;
  line-height: normal;
}

.custom-slider {
  min-width: 315px;
  width: 95%;
}

.el-popper-container-2058 >>> .el-popper {
  background-color: white;
  color: black;
}

.mainContainer >>> .el-card__body {
  padding: 0;
}

.errorContainer >>> .el-card__body {
  padding: 0;
}

.wrapper {
  display: flex;
  align-items: center;
}

.input {
  width: 100%;
}

.unitsContainer {
  margin-left: auto;
}

.info_description {
  color: var(--777, #777);
  font-family: Arial;
  font-size: 14px;
  font-style: normal;
  font-weight: 400;
  line-height: normal;
}

.selectContainer {
  display: flex;
  align-items: center;
  justify-content: space-around;
}

.textContainer {
  display: flex;
  flex: 2;
}

.inputContainer >>> .el-input__wrapper {
  box-shadow: none;
  padding: 0;
  height: 1.5rem;
}

.multipleInputs >>> .el-radio__input.is-checked + .el-radio__label {
  color: #006eaf;
}

.multipleInputs >>> .el-radio__input.is-checked .el-radio__inner {
  border-color: #006eaf;
  background-color: white;
  border: 2px solid #006eaf;
}

.multipleInputs >>> .el-radio__inner::after {
  height: 7px;
  width: 7px;
  background-color: #006eaf;
  /* left: 51%; */
  top: 50%;
}

.inputContainer >>> .el-input-group__append {
  box-shadow: none;
  background-color: white;
  padding: 0;
  height: 24px;
}

.inputContainer >>> .el-input-group__prepend {
  box-shadow: none;
  background-color: white;
  padding: 0;
}
.note {
  color: var(--777, #777);
  font-family: Arial;
  font-size: 14px;
  font-style: normal;
  font-weight: 400;
  line-height: normal;
}

.errorInput >>> input[type="number"]::-webkit-inner-spin-button,
.errorInput input[type="number"]::-webkit-outer-spin-button {
  -webkit-appearance: none;
  margin: 0;
  color: red;
}

.no-spinner >>> input[type="number"]::-webkit-inner-spin-button,
.no-spinner input[type="number"]::-webkit-outer-spin-button {
  -webkit-appearance: none;
  margin: 0;
  color: red;
}

.slider_option >>> .el-input-number__decrease {
  border-radius: 25px;
  background-color: #0d0d0d;
  color: white;
  font-size: 10px;
  width: 20px;
  font-weight: 700;
  height: 20px;
  margin-left: 16px;
  margin-top: 5px;
}

.slider_option {
  display: flex;
  flex-direction: column;
  align-items: flex-start;
  justify-content: center;
  gap: 10px;
  margin-top: 8px;
}

.slider_option_inner {
  display: flex;
  justify-content: space-between;
  align-items: center;
}

.slider_option >>> .el-input-number__increase {
  border-radius: 25px;
  background-color: #0d0d0d;
  color: white;
  width: 20px;
  height: 20px;
  font-size: 10px;
  font-weight: 700;
  margin-top: 5px;
}

.slider_option :deep() .el-slider__bar {
  background-color: #006eaf;
}

.slider_option >>> .el-input__inner {
  border: 1px solid var(--999, #999);
  box-shadow: 0 0 0 1px var(--el-input-border-color, var(--el-border-color))
    inset;
  width: 60px;
  background: white;
  border-radius: 5px;
  margin-left: 1.5px;
}

.slider_option >>> .el-input__wrapper {
  box-shadow: none;
  background: #edf1f5;
}

.slider_option >>> .el-slider__button {
  border: 3px solid var(--White, #fff);
  background: var(--Primary, #006eaf);
  box-shadow: 0px 0px 2px 0px rgba(0, 0, 0, 0.5);
  height: 15px;
  width: 15px;
}

.number_input {
  display: flex;
  align-items: center;
  justify-content: end;
  gap: 10px;
}
.time_button {
  height: 22px;
  width: 22px;
  border-radius: 50%;
  border: none;
  color: white;
  background-color: #0d0d0d;
  display: flex;
  align-items: center;
  justify-content: center;
  cursor: pointer;
}

.time_button_disabled {
  height: 22px;
  width: 22px;
  border-radius: 50%;
  border: none;
  color: white;
  background-color: #ccc;
  display: flex;
  align-items: center;
  justify-content: center;
  border: 0;
  cursor: not-allowed;
}
.time_input_container {
  border-radius: 4px;
  border: 1px solid var(--999, #999);
  background: var(--White, #fff);
  width: 70px;
  padding: 5px;
  display: flex;
  align-items: center;
}

.time_input {
  outline: none;
  border: none;
  width: 30px;
}

.slider_inner_button {
  cursor: pointer;
}

.slider_inner_disable_button {
  cursor: not-allowed;
}

.sliderContainer {
  padding: 5px 16px;
  background: var(--White, #fff);
  height: 55px;
}

.no-arrow-buttons >>> .is_focus {
  display: none;
}
.warning {
  color: red;

  font-size: 12px;
}

@media screen and (max-width: 1180px) and (min-width: 375px) {
  .mainContainer {
    height: auto;
  }

  .media_label {
    width: 87px;
  }
}

@media screen and (max-width: 740px) and (min-width: 360px) {
  .mainContainer {
    height: auto;
  }

  .sliderContainer {
    height: auto;
    padding: 6px 16px;
  }

  .media_label {
    width: 87px;
  }
}

@media screen and (max-width: 1024px) and (min-width: 768px) {
  .mainContainer {
    height: auto;
  }

  .media_label {
    width: 100%;
  }
}

@media screen and (max-width: 1366px) and (min-width: 1024px) {
  .mainContainer {
    height: auto;
    padding: 28px;
    margin-top: 28px;
    margin-bottom: 18px;
  }

  .media_label {
    width: 100%;
  }

  .sliderContainer {
    height: auto;
    padding: 28px;
  }
}

@media screen and (max-width: 1368px) and (min-width: 912px) {
  .mainContainer {
    height: auto;
    padding: 28px;
    margin-top: 28px;
    margin-bottom: 18px;
  }

  .media_label {
    width: 100%;
  }

  .sliderContainer {
    height: auto;
    padding: 28px;
  }
}

@media screen and (max-width: 740px) and (min-width: 360px) {
  .media_label {
    width: 57px;
  }

  .sliderContainer {
    height: auto;
    padding: 6px 16px;
  }
}

@media screen and (max-width: 740px) and (min-width: 360px) {
  .media_label {
    width: 100%;
  }

  .sliderContainer {
    height: auto;
    padding: 6px 16px;
  }
}

@media screen and (max-width: 1366px) and (min-width: 1024px) {
  .media_label {
    width: 100%;
  }
}
</style>
