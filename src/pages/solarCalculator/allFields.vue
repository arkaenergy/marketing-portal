<template>
  <div v-if="isMobile()" style="backgroundColor: #FFF">
    <div v-for="data in data" style="padding: 5px 16px 0px 16px">
      <div
        v-if="
          (data.question_type === 'short_answer' ||
            data.question_type === 'number') &&
          data.label === 'Pincode'
        "
      >
        <InputContainerMobile
          :data="data"
          @getUserLocation="getUserLocation"
          :errorForm="errorForm"
          @changeError="changeError"
          @restrictPincode="restrictPincode"
        />
      </div>

      <div
        v-if="
          (data.question_type === 'short_answer' ||
            data.question_type === 'number') &&
          data.label !== 'Pincode'
        "
      >
        <InputContainerMobile
          :data="data"
          :errorForm="errorForm"
          @changeError="changeError"
          @changeData="changeData"
        />
      </div>

      <div
        v-if="
          data.additional_info.no_style &&
          data.question_type === 'multiple_choice'
        "
      >
        <InputContainerMobile
          :data="data"
          @changeData="changeData"
          :errorForm="errorForm"
          @changeError="changeError"
        />
      </div>

      <div
        v-if="
          !data.additional_info.no_style &&
          data.question_type === 'multiple_choice'
        "
      >
        <InputContainerMobile
          :data="data"
          @changeData="changeData"
          :errorForm="errorForm"
          @changeError="changeError"
        />
      </div>

      <div v-if="data.question_type === 'slider'">
        <InputContainerMobile
          :data="data"
          @changeData="changeData"
          :errorForm="errorForm"
          @changeError="changeError"
        />
      </div>

      <div v-if="data.question_type === 'tab_choice'">
        <Tabs :data="data" />
      </div>
    </div>
  </div>
  <div v-else>
    <div v-for="data in data" style="padding: 5px 16px 0px 16px">
      <div
        v-if="
          (data.question_type === 'short_answer' ||
            data.question_type === 'number') &&
          data.label === 'Pincode'
        "
      >
        <InputContainer
          :data="data"
          @getUserLocation="getUserLocation"
          :errorForm="errorForm"
          @changeError="changeError"
          @restrictPincode="restrictPincode"
        />
      </div>

      <div
        v-if="
          (data.question_type === 'short_answer' ||
            data.question_type === 'number') &&
          data.label !== 'Pincode'
        "
      >
        <InputContainer
          :data="data"
          :errorForm="errorForm"
          @changeError="changeError"
          @changeData="changeData"
        />
      </div>

      <div
        v-if="
          data.additional_info.no_style &&
          data.question_type === 'multiple_choice'
        "
      >
        <InputContainer
          :data="data"
          @changeData="changeData"
          :errorForm="errorForm"
          @changeError="changeError"
        />
      </div>

      <div
        v-if="
          !data.additional_info.no_style &&
          data.question_type === 'multiple_choice'
        "
      >
        <InputContainer
          :data="data"
          @changeData="changeData"
          :errorForm="errorForm"
          @changeError="changeError"
        />
      </div>

      <div v-if="data.question_type === 'slider'">
        <InputContainer
          :data="data"
          @changeData="changeData"
          :errorForm="errorForm"
          @changeError="changeError"
        />
      </div>

      <div v-if="data.question_type === 'tab_choice'">
        <Tabs :data="data" />
      </div>
    </div>
  </div>
</template>

<script setup>
import { onMounted, ref, reactive } from "vue";
import Tabs from "./Components/Form/Components/Tabs.vue";
import { solarCalculatorStore } from "../store/solarCalculator";

import InputContainer from "./Components/Form/Components/InputContainer.vue";
import InputContainerMobile from "./Components/Form/Components/InputContainerMobile.vue";
import axios from "axios";
import API from '@/services/api';


const { data } = defineProps(["data"]);
const emits = defineEmits([
  "changeDisability",
  "changePowerPhase",
  "restictInput",
]);
const isFetchingUserLocation = ref(false);

const store = solarCalculatorStore();

const isMobile = () => {
  return window.innerWidth < 740;
};

const errorForm = reactive({
  rooftop_error: false,
  sanction_error: false,
  bill_error: false,
  tariff_error: false,
  pincode_error: false,
  change_phase_error: false,
  max_bill_error: false,
  max_area_error: false,
  validation_for_pin: false,
});

const checkError = () => {
  if (
    errorForm.rooftop_error === true ||
    errorForm.sanction_error === true ||
    errorForm.bill_error === true ||
    errorForm.tariff_error === true ||
    errorForm.pincode_error === true ||
    errorForm.change_phase_error === true ||
    errorForm.max_bill_error === true ||
    errorForm.max_area_error === true
  ) {
    store.UPDATE_CALCULATOR_DATA(true, "Error");
  } else {
    store.UPDATE_CALCULATOR_DATA(false, "Error");
  }
};

const changeError = (label, status) => {
  switch (label) {
    case "Pincode":
      errorForm.pincode_error = status;
      checkError();
      break;
    case "Tariff Rates":
      errorForm.tariff_error = status;
      checkError();
      break;
    case "Sanction Load":
      errorForm.sanction_error = status;
      checkError();
      break;
    case "Rooftop Area":
      errorForm.rooftop_error = status;
      checkError();
      break;
    case "Monthly Electricity Bill":
      errorForm.bill_error = status;
      checkError();
      break;
    case "Power Supply Phase":
      errorForm.change_phase_error = status;
      checkError();
      break;
    case "Max Bill":
      errorForm.max_bill_error = status;
      checkError();
      break;
    case "Max Area":
      errorForm.max_area_error = status;
      checkError();
      break;

    default:
      break;
  }
};

const changeData = (label, change) => {
  emits("changeDisability", label, change);
};

const restrictPincode = (data) => {
  emits("restictInput", data);
};

const getUserLocation = (data) => {
  isFetchingUserLocation.value = false;
  const successCallback = async (position) => {
    const long = position.coords.longitude;
    const lat = position.coords.latitude;
   const qParams={
                            lat:lat,
                            lng :long 
                        }
    let response = await API.STUDIO_API.GET_GMAPS_JSON(qParams);

    const results = response.data.results[0];
    let addressComponent = results?.address_components?.filter((el) => {
      return el.types[0] === "postal_code";
    });

    const pin = addressComponent[0].long_name;
  };

  const errorCallback = () => {
    alert("Something went wrong try again");
    isFetchingUserLocation.value = false;
  };
  navigator.geolocation.getCurrentPosition(successCallback, errorCallback);
};
</script>

<style scoped>
.outageForm {
  display: flex;
  gap: 10px;
  margin-top: 10px;
  margin-bottom: 10px;
}

.powerCard {
  flex: 1;
  display: flex;
  height: 64px;
  padding: 10px 16px;
  align-items: center;
  gap: 10px;
  border-radius: 8px;
  background: var(--White, #fff);
  box-shadow: 0px 0px 6px 0px rgba(0, 0, 0, 0.15);
}
</style>
