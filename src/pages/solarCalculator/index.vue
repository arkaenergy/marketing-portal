<template>
  <div
    class="common-layout"
    v-loading="loading"
    :loading-options="{ text: 'Loading...' }"
  >
    <el-alert
      v-if="loading_error"
      title="Unable to fetch the data"
      type="error"
      effect="dark"
      style="
        position: absolute;
        width: 40%;
        right: 0;
        margin-top: 10px;
        margin-right: 10px;
      "
    >
    </el-alert>
    <navbar :showNavBar="!isMobile() || (isMobile() && showFormPage)" />
    <div class="goBack" v-if="isMobile() && !showFormPage">
      <div style="padding: 1rem">
        <img src="./assets/arrow-left.svg" @click="goBackToGenerationPage" />
      </div>
      <div class="pincode-back-mobile">
        <p>{{ calculatorData.pin_code }}</p>
        <img
          src="./assets/pencil.svg"
          style="width: 20px; height: 20px"
          @click="goBackToGenerationPage"
        />
      </div>
    </div>
    <div class="bottom_container">
      <div
        class="left"
        style="backgroundcolor: #fff"
        v-show="isMobile() && showFormPage"
      >
        <div class="left-inner" style="backgroundcolor: #fff" v-if="tabsData">
          <div>
            <div style="margin-top: 10px">
              <AllFields
                :data="tabsData.sections[0].fields"
                @changeDisability="changeDisability"
                @changePowerPhase="changePowerPhase"
              />
            </div>
          </div>
        </div>
        <div
          v-if="isMobile()"
          class="generateButton"
          style="height: fit-content"
        >
          <button
            style="height: 48px; border-radius: 0"
            :class="getButtonStyle()"
            @click="generateResults"
            :disabled="buttonDisabled()"
            @mouseover="updateTheNotification"
          >
            Generate Result
          </button>
        </div>
        <div v-else class="generateButton">
          <div class="wrapper">
            <button
              :class="getButtonStyle()"
              @click="generateResults"
              :disabled="buttonDisabled()"
              @mouseover="updateTheNotification"
            >
              Generate Result
            </button>
          </div>
        </div>
      </div>
      <div class="left" v-show="!isMobile()">
        <!-- pinCode -->
        <div class="left-inner" v-if="tabsData">
          <div>
            <div
              v-if="tabsData.sections[0].fields[0].label === 'Pincode'"
              style="margin-bottom: 15px"
            >
              <AllFields
                :data="tabsData.sections[0].fields.slice(0, 1)"
                @changeDisability="changeDisability"
                @changePowerPhase="changePowerPhase"
                @restictInput="restictInput"
              />
            </div>
            <hr class="hrClass" />
            <div style="margin-top: 10px">
              <AllFields
                :data="tabsData.sections[0].fields.slice(1)"
                @changeDisability="changeDisability"
                @changePowerPhase="changePowerPhase"
              />
            </div>
            <img :src="Journey" alt="" style="width: 100%" />
          </div>
        </div>

        <div class="generateButton">
          <div class="wrapper">
            <button
              :style="is"
              :class="getButtonStyle()"
              @click="generateResults"
              :disabled="buttonDisabled()"
              @mouseover="updateTheNotification"
            >
              Generate Result
            </button>
          </div>
        </div>
      </div>
      <div :style="rightStyles" class="rightContainer">
        <div v-if="generate">
          <div v-for="data in info_data.value?.sections">
            <div v-for="item in data.fields">
              <TabsComponent
                :tabsData="item"
                :type="info"
                @generateResults="generateResults"
                :fetching_error="fetching_error"
                @handleErrorResponse="handleErrorResponse"
              />
            </div>
          </div>
        </div>
        <div v-else><WelcomeCarosual /></div>
      </div>
    </div>
    <div class="loading_popup">
      <el-dialog
        v-model="centerDialogVisible"
        width="25%"
        :top="'45vh'"
        :close-on-click-modal="false"
      >
        <div
          style="
            display: flex;
            align-items: center;
            flex-direction: column;
            padding-bottom: 10px;
          "
        >
          <img
            class="loading_gif"
            style="width: 70px; height: 70px"
            src="./assets/giphy.gif"
          />
          <p>{{ loadingMessage }}</p>
        </div>
      </el-dialog>
    </div>
  </div>
</template>
<script setup>
import navbar from "./Components/navbar.vue";
import { solarCalculatorStore } from "../store/solarCalculator";
import calculatorTemplate from "./Components/Form/Components/ne.json";
import Welcome from "./Components/InformationTab/Welcome.vue";
import WelcomeCarosual from "./Components/InformationTab/WelcomeCarosual.vue";
import AllFields from "./allFields.vue";
import { ref, computed, provide, reactive, onMounted } from "vue";
import { GOOGLE_API_KEY } from "../../services/api";
import API from "../../services/api";
import Journey from "./assets/journey.png";
import axios from "axios";
import TabsComponent from "./Components/Form/Components/TabsComponent.vue";

const store = solarCalculatorStore();
const calculatorData = store.CALCULATOR_DATA_STATE;
let tabsData = ref(calculatorTemplate);
const loading = ref(false);
const loading_error = ref(false);
let info_data = reactive({});
const generate = ref(false);
const emi = ref(0);
const centerDialogVisible = ref(true);
const loadingMessage = ref("");
const fetching_error = ref(false);
const showFormPage = ref(true);

provide("provideValue", "inject");

onMounted(async () => {
  getUserLocation();
});

const isMobile = () => {
  return window.innerWidth < 740;
};

const goBackToGenerationPage = () => {
  generate.value = false;
  showFormPage.value = true;
};

const updateTheNotification = () => {
  if (calculatorData.pin_code_error === true) {
    ElMessage({
      showClose: true,
      message: "Please enter valid pincode",
      type: "error",
      center: true,
    });
  }
};

const getButtonStyle = () => {
  if (
    calculatorData.pin_code !== "" &&
    calculatorData.rooftop_area !== 0 &&
    calculatorData.monthly_bill !== 0 &&
    calculatorData.tariff_rate > 3 &&
    calculatorData.sanction_load !== 0 &&
    calculatorData.pin_code !== 0 &&
    calculatorData.error !== true &&
    calculatorData.rooftop_area !== null &&
    calculatorData.pin_code_error !== true
  ) {
    return "button";
  } else {
    return "button_disabled";
  }
};

const buttonDisabled = () => {
  if (
    calculatorData.pin_code !== "" &&
    calculatorData.rooftop_area !== 0 &&
    calculatorData.monthly_bill !== 0 &&
    calculatorData.sanction_load !== 0 &&
    calculatorData.tariff_rate > 3 &&
    calculatorData.pin_code !== 0 &&
    calculatorData.error !== true &&
    calculatorData.rooftop_area !== null &&
    calculatorData.pin_code_error !== true
  ) {
    return false;
  } else {
    return true;
  }
};

const restictInput = (item) => {
  tabsData.value.sections.map((data) =>
    data.fields.map((i) => {
      if (i.label === "Pincode") {
        i.additional_info.default_option = item.slice(0, 6);
      }
    })
  );
};

const changeDisability = (label, change) => {
  const newLabel = label === "neutral" ? calculatorData.supply_phase : label;
  store.UPDATE_CALCULATOR_DATA(newLabel, "Power Supply Phase");
  tabsData.value.sections.map((data) =>
    data.fields.map((i) => {
      if (i.label === "Power Supply Phase") {
        i.additional_info.default_option =
          label === "neutral" ? calculatorData.supply_phase : label;
        i.options.map((data) => {
          if (label === "Three Phase") {
            if (data.option_text === "Single Phase") {
              data.tab_disable = change;
            }
            if (data.option_text === "Three Phase") {
              data.tab_disable = !change;
            }
          }
          if (label === "Single Phase") {
            if (data.option_text === "Three Phase") {
              data.tab_disable = change;
            }
            if (data.option_text === "Single Phase") {
              data.tab_disable = !change;
            }
          }
          if (label === "neutral") {
            if (data.option_text === "Three Phase") {
              data.tab_disable = change;
            }
            if (data.option_text === "Single Phase") {
              data.tab_disable = change;
            }
          }
        });
      }
    })
  );
};

const generateResults = async () => {
  loadingMessage.value = "Calculating your results...";
  centerDialogVisible.value = true;
  const calculatedData = {
    pin_code: calculatorData.pin_code,
    latitude: calculatorData.latitude,
    longitude: calculatorData.longitude,
    monthly_bill: calculatorData.monthly_bill,

    tariff_rate: calculatorData.tariff_rate,
    supply_phase: calculatorData.supply_phase,
    rooftop_area: calculatorData.rooftop_area,
    morning_total_energy:
      calculatorData.selected_grid === "Off-Grid"
        ? calculatorData.morning_outage_hours
        : 0,
    evening_total_energy:
      calculatorData.selected_grid === "Off-Grid"
        ? calculatorData.night_outage_hours
        : 0,
    token: calculatorData.site_survey_token,
    loan_tenure: calculatorData.loan_tenure,
    interest_rate: calculatorData.interest_rate,
    sanction_load: calculatorData.sanction_load,
    is_ac_present: calculatorData.is_ac_added,
    total_consumption:
      calculatorData.selected_grid === "Off-Grid"
        ? parseFloat(calculatorData.total_consumption)
        : 0,
    total_power:
      calculatorData.selected_grid === "Off-Grid"
        ? parseFloat(calculatorData.backup_power)
        : 0,
    backup_energy:
      calculatorData.selected_grid === "Off-Grid"
        ? parseFloat(calculatorData.backup_energy)
        : 0,
  };
  if (
    calculatorData.pin_code !== "" &&
    // calculatorData.rooftop_area !== 0 &&
    calculatorData.monthly_bill !== 0 &&
    calculatorData.sanction_load !== 0
  ) {
    try {
      const { data } = await API.SOLARCALCULATOR.CALCULATE_SOLAR_DATA(
        calculatedData
      );
      createSectionsData(data);
      if (isMobile()) {
        showFormPage.value = false;
      }

      const years = data?.loan_term_years > 0.8 ? data?.loan_term_years : 1;
      store.UPDATE_CALCULATOR_DATA(data, "calculate_data");
      store.UPDATE_CALCULATOR_DATA(data.n_panels, "System Size");
      store.UPDATE_CALCULATOR_DATA(data.token, "Site Survey");
      store.UPDATE_CALCULATOR_DATA(Math.round(years), "Loan Term");
      store.UPDATE_CALCULATOR_DATA(10, "Loan Rate");
      store.UPDATE_CALCULATOR_DATA(data.loan_amount, "System Cost");
      store.UPDATE_CALCULATOR_DATA(data.emi, "emi_update");
      store.UPDATE_CALCULATOR_DATA(data.bill_with_solar, "with_solar");
      store.UPDATE_CALCULATOR_DATA(data.bill_without_solar, "without_solar");
      store.UPDATE_CALCULATOR_DATA(data.recommended_system_size, "dc_size");
      calculateEmi(data.loan_amount);
      // store.UPDATE_CALCULATOR_DATA(data.recommended_system_size, "dc_size");

      if (data.system_type === "on_grid") {
        store.UPDATE_CALCULATOR_DATA(data.price, "price_without_battery");
      }
      if (data.system_type === "off_grid") {
        store.UPDATE_CALCULATOR_DATA(data.price, "price_with_battery");
      }

      centerDialogVisible.value = false;
    } catch (err) {
      centerDialogVisible.value = false;
      let active_tab = 0;
      let active_grid = "";
      if (calculatorData.active_tab === 0) {
        active_tab = 1;
        active_grid = "Off-Grid";
      } else {
        active_tab = 0;
        active_grid = "On-Grid";
      }
      store.UPDATE_CALCULATOR_DATA(active_tab, "active_tab");
      store.UPDATE_CALCULATOR_DATA(active_grid, "SelectedGrid");
      fetching_error.value = true;
      ElMessage({
        showClose: true,
        message: "Error in fetching the data",
        type: "error",
        center: true,
      });
    }
  } else {
    ElMessage({
      showClose: true,
      message: "All fields are required",
      type: "error",
      center: true,
    });
  }
};

const handleErrorResponse = () => {
  fetching_error.value = false;
};

const rightStyles = computed(() => {
  if (!generate.value) {
    return {
      flex: 3,
      height: "100%",
    };
  } else {
    return {
      flex: 3,
      maxHeight: "90vh",
      padding: "24px",
      overflowY: "scroll",
    };
  }
});

const UpdateOffGridData = () => {
  createSectionsData(info_data);
};

const createSectionsData = (data) => {
  const sectionData = {
    title: "",
    sections: [
      {
        title: "",
        description: "Description",
        fields: [
          {
            label: "",
            description: "Description",
            is_required: true,
            question_type: "tab_choice",
            photos_videos_required: false,
            options: [
              {
                option_text: "",
                sub_options: [],
                tab_name: "On-Grid",
                description:
                  " On-Grid solar power generating system is connected to the utility grid; allows export/import of power to/from the grid",

                tab_fields: [
                  {
                    label: "Our Recommendation",
                    description: "Description",
                    is_required: true,
                    question_type: "info_card",
                    photos_videos_required: false,
                    options: [
                      {
                        option_text: "",
                        sub_options: [],

                        label: "Recommended solar capacity",
                        description:
                          data.recommended_system_size.toLocaleString("en-IN") +
                          " kWp",
                        question_type: "",
                        additional_info: {
                          prepend_image: "systemSizeImage",
                          default_option: data.recommended_system_size,

                          field_unit: "sq.ft",
                          default_note_value: data.n_panels * 120,
                        },
                      },

                      {
                        option_text: "",
                        sub_options: [],
                        label: "Required area for solar installation",
                        description:
                          (data.recommended_system_size * 120).toLocaleString(
                            "en-IN"
                          ) + " sq.ft",
                        question_type: "",
                        additional_info: {
                          prepend_image: "areaImage",
                          field_unit: "sq.ft",
                          additional_field_unit: "",
                          additional_data:
                            Math.round(data.recommended_system_size * 11.15) +
                            " sq.m",
                        },
                      },

                      {
                        option_text: "",
                        sub_options: [],
                        label: "Bill Savings",
                        description: `${data.monthly_bill_saving}%`,
                        question_type: "",
                        additional_info: {
                          prepend_image: "moneySaveImage",
                        },
                      },
                    ],
                    allowed_file_type: [],
                    max_files: 1,
                    additional_data: {
                      field_unit: "kW",
                    },
                  },
                  {
                    label: "Savings and Payback From Solar",
                    description: "Description",
                    is_required: true,
                    question_type: "info_card",
                    photos_videos_required: false,
                    options: [
                      {
                        option_text: "",
                        sub_options: [],
                        label: "Bill With Solar",
                        // description: "",
                        question_type: "info_card",
                        additional_info: {
                          prepend_image: "chargedImage",
                          additional_prepend_image: "dischargedImage",
                          current_bill: ` ₹${Math.round(
                            data.bill_without_solar.reduce(
                              (acc, current) => acc + current,
                              0
                            )
                          ).toLocaleString("en-IN")}`,
                          bill_with_solar: ` ₹${Math.round(
                            data.bill_with_solar.reduce(
                              (acc, current) => acc + current,
                              0
                            )
                          ).toLocaleString("en-IN")}`,
                          note: "*25 Years Savings is an estimate of the savings over the period of time of the system.",
                        },
                      },
                      {
                        option_text: "",
                        sub_options: [],
                        label: "25 Years Return on Investment",
                        description: `${data.roi.toLocaleString("en-IN")} %`,
                        question_type: "",
                        additional_info: {
                          prepend_image: "returnsImage",
                        },
                      },

                      {
                        option_text: "",
                        sub_options: [],
                        label: "Payback Period",
                        description: `${data.payback.years}.${data.payback.months} Years`,
                        question_type: "info_card",
                        additional_info: {
                          prepend_image: "calenderImage",
                        },
                      },
                    ],
                    allowed_file_type: [],
                    max_files: 1,
                    additional_data: {},
                  },
                  {
                    label: "Savings",
                    description: "Description",
                    is_required: true,
                    question_type: "line_chart",
                    photos_videos_required: false,
                    options: [],
                    additional_info: {
                      first_label: "Post-Solar",
                      second_label: "Pre-Solar",
                    },
                  },
                  {
                    label: "Title",
                    description: "Description",
                    is_required: true,
                    question_type: "info_card",
                    photos_videos_required: false,
                    options: [
                      {
                        option_text: "",
                        sub_options: [],
                        label: "Monthly Savings",
                        description: ` ₹${Math.round(
                          data.average_monthly_saving
                        ).toLocaleString("en-IN")}`,
                        question_type: "",
                        additional_info: {
                          prepend_image: "walletImage",
                          // note: "*Annual Generation is an estimate of the power available to you over the period of a year.",
                        },
                      },
                      {
                        option_text: "",
                        sub_options: [],
                        label: "Annual Savings",
                        description: ` ₹${Math.round(
                          data.annual_saving
                        ).toLocaleString("en-IN")}`,
                        question_type: "",
                        additional_info: {
                          prepend_image: "bigMoneyImage",
                        },
                      },
                      {
                        option_text: "",
                        sub_options: [],
                        label: "25 Years Savings",
                        description: ` ₹${Math.round(
                          data.lifetime_savings
                        ).toLocaleString("en-IN")}`,
                        question_type: "info_card",
                        additional_info: {
                          prepend_image: "savingMoneyImage",
                        },
                      },
                    ],
                    allowed_file_type: [],
                    max_files: 1,
                    additional_data: {
                      field_units: "sq. ft.",
                      note: "*Note - 1kW system requires ~120sq ft area",
                    },
                  },

                  {
                    label: "Payback Analysis",
                    description: "Description",
                    is_required: true,
                    question_type: "bar_graph",
                    photos_videos_required: false,
                    options: [],
                    additional_info: {
                      first_label: "Bill With Solar",
                      second_label: "Bill Without Solar",
                    },
                  },
                  {
                    label: "Your Contribution to Environment",
                    description: "Description",
                    is_required: true,
                    question_type: "grey_image_card",
                    photos_videos_required: false,
                    options: [
                      {
                        option_text: "",
                        sub_options: [],
                        label: "Estimated CO2 Reduced",
                        description: `${data.co2_offset.toLocaleString(
                          "en-IN"
                        )}`,
                        question_type: "",
                        field_unit: "metric tons",
                        additional_info: {
                          prepend_image: "carbonImage",
                        },
                      },
                      {
                        option_text: "",
                        sub_options: [],
                        label: "No. of Trees Planted",
                        description: `${Math.round(data.trees).toLocaleString(
                          "en-IN"
                        )}`,
                        question_type: "",

                        additional_info: {
                          prepend_image: "treeImage",
                        },
                      },
                      {
                        option_text: "",
                        sub_options: [],
                        label: "Coal Burn Avoided",
                        description: `${data.coal_burned.toLocaleString(
                          "en-IN"
                        )}`,
                        question_type: "",
                        field_unit: "metric tons",
                        additional_info: {
                          prepend_image: "coalBurnImage",
                        },
                      },
                    ],
                    allowed_file_type: [],
                    max_files: 1,
                    additional_data: {},
                  },
                  {
                    label: "Pricing",
                    description: "Description",
                    is_required: true,
                    question_type: "grey_card",
                    photos_videos_required: false,
                    options: [
                      {
                        option_text: "",
                        sub_options: [],
                        options: [],
                        label: "Price*",
                        description: ` ₹ ${Math.round(
                          data.system_cost
                        ).toLocaleString("en-IN")}`,
                        question_type: "",

                        additional_info: {
                          note: [
                            {
                              info: "*Subsidy may be applicable as per state regulation",
                            },
                          ],
                        },
                      },
                      {
                        option_text: "",
                        sub_options: [
                          {
                            label: "EMI Calculator",
                            loan_amount: 2000,
                            term: Math.round(data.loan_term_years),
                            interest_rate: 10,
                          },
                        ],
                        label: "EMI starts from",
                        description: `₹${Math.round(emi.value).toLocaleString(
                          "en-IN"
                        )}/month`,
                        question_type: "emi_card",
                        options: [{ label: "Emi Calculator" }],
                        additional_info: {
                          label: "Current Electricity Bill",
                          description: " ₹10,000/month",
                        },
                      },
                    ],
                    allowed_file_type: [],
                    max_files: 1,
                    additional_data: {
                      field_unit: "kW",
                      note: [
                        {
                          info: "*Subsidy may be applicable as per state regulation",
                        },
                        {
                          info: "The price provided here is for informational purposes only and may not be current or accurate.",
                        },
                      ],
                    },
                  },
                  {
                    label: "Patners",
                    description: "Description",
                    is_required: true,
                    question_type: "logo",
                    photos_videos_required: false,
                    options: [],
                    allowed_file_type: [],
                    max_files: 1,
                    additional_data: {},
                  },
                  {
                    label: "Blue Card",
                    description:
                      "If you have power cut, please check our Off-Grid section.",
                    is_required: true,
                    question_type: "blue_card",
                    photos_videos_required: false,
                    options: [],
                    allowed_file_type: [],
                    max_files: 1,
                    additional_data: {
                      field_unit: "kW",
                    },
                  },
                ],
              },
              {
                option_text: "",
                sub_options: [],
                tab_name: "Off-Grid",
                description:
                  "Off-Grid solar power generating system is not connected to the utility grid, and provides power backup through batteries in case of power cuts",
                tab_fields: [
                  {
                    label: "Power Outage",
                    options: [
                      {
                        option_text: "Yes",
                        sub_options: [
                          {
                            label: "Number of hours of power outage",
                            options: [
                              {
                                label: "hr",
                                description: "10 am to 3 pm",
                                option_text: "",
                                sub_options: [],
                                question_type: "number",
                                additional_data: {
                                  default_option: 1,
                                  label: "Morning",
                                },
                              },
                              {
                                label: "hr",
                                description: "3 pm tp 10 am",
                                option_text: "",
                                sub_options: [],
                                question_type: "number",
                                additional_data: {
                                  default_option: 4,
                                  label: "Night",
                                },
                              },
                            ],
                            question_type: "time",
                          },
                        ],
                        additional_info: {
                          render_in: 1,
                        },
                      },
                      {
                        option_text: "No",
                        sub_options: [],
                      },
                    ],
                    max_files: 1,
                    description: "Description",
                    is_required: true,
                    question_type: "multiple_choice",
                    additional_info: {
                      append_img: "",
                      append_text: "",
                      prepend_img: "batteryImg",
                      default_option: "Yes",
                    },
                    allowed_file_type: [],
                    photos_videos_required: false,
                  },
                  {
                    label: "Appliances",
                    description: "Description",
                    is_required: true,
                    question_type: "",
                    photos_videos_required: false,
                    options: [],
                    allowed_file_type: [],
                    max_files: 1,
                    additional_data: {
                      field_unit: "kW",
                    },
                  },
                  {
                    label: "Our Recommendation",
                    description: "Description",
                    is_required: true,
                    question_type: "info_card",
                    photos_videos_required: false,
                    options: [
                      {
                        option_text: "",
                        sub_options: [],
                        label: "Recommended System",
                        description:
                          data.recommended_system_size.toLocaleString("en-IN") +
                          " kW",
                        question_type: "",
                        additional_info: {
                          prepend_image: "systemSizeImage",
                          default_option: data.n_panels,
                          field_unit: "sq.ft",
                          default_note_value: data.n_panels * 120,
                          background: "#E8EDF2",
                          height: "100vh",
                          type: "longCard",
                          recommended_solar: data.recommended_system_size
                            ? data.recommended_system_size.toLocaleString(
                                "en-IN"
                              ) + " kWp"
                            : "",
                          invertor_capacity:
                            data.inverter_capacity && data.voltage
                              ? `${data.inverter_capacity} KVA ${data.voltage} V`
                              : "",
                          battery: data.estimated_battery_capacity
                            ? `${data.estimated_battery_capacity} AH`
                            : "",
                        },
                      },

                      {
                        option_text: "",
                        sub_options: [],
                        label: "Required area for solar installation",
                        description:
                          (data.recommended_system_size * 120).toLocaleString(
                            "en-IN"
                          ) + " sq.ft",
                        question_type: "",
                        additional_info: {
                          prepend_image: "areaImage",
                          field_unit: "sq.ft",
                          background: "#E8EDF2",

                          additional_data:
                            Math.round(data.recommended_system_size * 11.15) +
                            " sq.m",
                        },
                      },
                      {
                        option_text: "",
                        sub_options: [],
                        label: "Bill Savings",
                        description: `${Math.round(
                          data.monthly_bill_saving
                        ).toLocaleString("en-IN")}%`,
                        question_type: "",
                        additional_info: {
                          prepend_image: "moneySaveImage",
                        },
                      },
                      {
                        option_text: "",
                        sub_options: [],
                        label: "Power Back-up Available",
                        description:data.backup_on_storage ? `${Math.round(data.backup_on_storage)} Hours` : 1 + "Hours",
                        question_type: "",
                        additional_info: {
                          prepend_image: "batteryImage",
                        },
                      },
                    ],
                    allowed_file_type: [],
                    max_files: 1,
                    additional_data: {
                      field_unit: "kW",
                      cardType: "Spilted",
                    },
                  },
                  {
                    label: "Savings and Payback From Solar",
                    description: "Description",
                    is_required: true,
                    question_type: "info_card",
                    photos_videos_required: false,
                    options: [
                      {
                        option_text: "",
                        sub_options: [],
                        label: "Bill With Solar",

                        question_type: "info_card",
                        additional_info: {
                          prepend_image: "chargedImage",
                          additional_prepend_image: "dischargedImage",
                          current_bill: ` ₹${Math.round(
                            data.bill_without_solar[0]
                          ).toLocaleString("en-IN")}`,
                          bill_with_solar: ` ₹${Math.round(
                            data.bill_with_solar[0]
                          ).toLocaleString("en-IN")}`,
                          note: "*25 Years Savings is an estimate of the savings over the period of time of the system.",
                        },
                      },
                      {
                        option_text: "",
                        sub_options: [],
                        label: "25 Years Return on Investment",
                        description: `${data.roi.toLocaleString("en-IN")} %`,
                        question_type: "",
                        additional_info: {
                          prepend_image: "returnsImage",
                        },
                      },

                      {
                        option_text: "",
                        sub_options: [],
                        label: "Payback Period",
                        description: `${data.payback.years}.${data.payback.months} Years`,
                        question_type: "info_card",
                        additional_info: {
                          prepend_image: "calenderImage",
                        },
                      },
                    ],
                    allowed_file_type: [],
                    max_files: 1,
                    additional_data: {},
                  },

                  {
                    label: "Savings",
                    description: "Description",
                    is_required: true,
                    question_type: "line_chart",
                    photos_videos_required: false,
                    options: [],
                    additional_info: {
                      first_label: "Post-Solar",
                      second_label: "Pre-Solar",
                    },
                  },
                  {
                    label: "Title",
                    description: "Description",
                    is_required: true,
                    question_type: "info_card",
                    photos_videos_required: false,
                    options: [
                      {
                        option_text: "",
                        sub_options: [],
                        label: "Monthly Savings",
                        description: `₹${Math.round(
                          data.average_monthly_saving
                        ).toLocaleString("en-IN")}`,
                        question_type: "",
                        additional_info: {
                          prepend_image: "walletImage",
                          // note: "*Annual Generation is an estimate of the power available to you over the period of a year.",
                        },
                      },
                      {
                        option_text: "",
                        sub_options: [],
                        label: "Annual Savings",
                        description: `₹${Math.round(
                          data.annual_saving
                        ).toLocaleString("en-IN")}`,
                        question_type: "",
                        additional_info: {
                          prepend_image: "bigMoneyImage",
                        },
                      },
                      {
                        option_text: "",
                        sub_options: [],
                        label: "25 Years Savings",
                        description: `₹${Math.round(
                          data.lifetime_savings
                        ).toLocaleString("en-IN")}`,
                        question_type: "info_card",
                        additional_info: {
                          prepend_image: "savingMoneyImage",
                        },
                      },
                    ],
                    allowed_file_type: [],
                    max_files: 1,
                    additional_data: {
                      field_units: "sq. ft.",
                      note: "*Note - 1kW system requires ~120sq ft area",
                    },
                  },
                  {
                    label: "Payback Analysis",
                    description: "Description",
                    is_required: true,
                    question_type: "bar_graph",
                    photos_videos_required: false,
                    options: [],
                    additional_info: {
                      first_label: "Bill With Solar",
                      second_label: "Bill Without Solar",
                    },
                  },
                  {
                    label: "Your Contribution to Environment",
                    description: "Description",
                    is_required: true,
                    question_type: "grey_image_card",
                    photos_videos_required: false,
                    options: [
                      {
                        option_text: "",
                        sub_options: [],
                        label: "Estimated CO2 Reduced",
                        description: `${data.co2_offset.toLocaleString(
                          "en-IN"
                        )}`,
                        question_type: "",
                        field_unit: "metric tons",
                        additional_info: {
                          prepend_image: "carbonImage",
                        },
                      },
                      {
                        option_text: "",
                        sub_options: [],
                        label: "No. of Trees Planted",
                        description: `${Math.round(data.trees).toLocaleString(
                          "en-IN"
                        )}`,
                        question_type: "",

                        additional_info: {
                          prepend_image: "treeImage",
                        },
                      },
                      {
                        option_text: "",
                        sub_options: [],
                        label: "Coal Burn Avoided",
                        description: `${data.coal_burned.toLocaleString(
                          "en-IN"
                        )}`,
                        question_type: "",
                        field_unit: "metric tons",
                        additional_info: {
                          prepend_image: "coalBurnImage",
                        },
                      },
                    ],
                    allowed_file_type: [],
                    max_files: 1,
                    additional_data: {},
                  },
                  {
                    label: "Pricing",
                    description: "Description",
                    is_required: true,
                    question_type: "grey_card",
                    photos_videos_required: false,
                    options: [
                      {
                        option_text: "",
                        sub_options: [],
                        options: [],
                        label: "Price*",
                        description: ` ₹ ${Math.round(
                          data.system_cost
                        ).toLocaleString("en-IN")}`,
                        question_type: "",

                        additional_info: {
                          note: [
                            {
                              info: "*Subsidy may be applicable as per state regulation",
                            },
                          ],
                          price_without_battery:
                            "₹" +
                            calculatorData.price_without_battery.toLocaleString(
                              "en-IN"
                            ),
                          price_with_battery:
                            "₹" +
                            calculatorData.price_with_battery.toLocaleString(
                              "en-IN"
                            ),
                          information_icon: true,
                        },
                      },
                      {
                        option_text: "",
                        sub_options: [
                          {
                            label: "EMI Calculator",
                            loan_amount: 2000,
                            term: 5,
                            interest_rate: 10,
                          },
                        ],
                        label: "EMI starts from",
                        description: `₹${emi.value.toLocaleString(
                          "en-IN"
                        )}/month`,
                        question_type: "emi_card",
                        options: [{ label: "EMI Calculator" }],
                        additional_info: {
                          label: "Current Electricity Bill",
                          description: " ₹10,000/month",
                        },
                      },
                    ],
                    allowed_file_type: [],
                    max_files: 1,
                    additional_data: {
                      field_unit: "kW",
                    },
                  },
                  {
                    label: "Patners",
                    description:
                      "If you have power cut, please check our offgrid section.",
                    is_required: true,
                    question_type: "logo",
                    photos_videos_required: false,
                    options: [],
                    allowed_file_type: [],
                    max_files: 1,
                    additional_data: {},
                  },
                ],
              },
            ],
            allowed_file_type: [],
            max_files: 1,
            additional_data: {
              type: "card_elements",
            },
          },
        ],
      },
    ],
    description: "Please fill out these details to view your savings.",
  };

  info_data.value = sectionData;

  generate.value = true;
};

const getUserLocation = async () => {
  loadingMessage.value = "Fetching your location...";
  centerDialogVisible.value = true;
  const successCallback = async (position) => {
    const long = position.coords.longitude;
    const lat = position.coords.latitude;
    store.UPDATE_CALCULATOR_DATA(lat, "Latitude");
    store.UPDATE_CALCULATOR_DATA(long, "Longitude");
const qParams={
  lat:lat,
  lng :long 
}
    let response = await API.STUDIO_API.GET_GMAPS_JSON(qParams);

    let address_pin_code = 0;

    response.data.results.map((address) => {
      address.address_components.map((data) => {
        if (data.types[0] === "postal_code") {
          address_pin_code = data.long_name;
          store.UPDATE_CALCULATOR_DATA(address_pin_code, "Pincode");
        }
      });
    });

    const pin = address_pin_code;

    tabsData.value.sections.map((data) =>
      data.fields.map((i) => {
        if (i.label === "Pincode") {
          i.additional_info.default_option = pin;
        }
      })
    );
    store.UPDATE_CALCULATOR_DATA(pin, "Pincode");
    centerDialogVisible.value = false;
  };

  const errorCallback = () => {
    ElMessage({
      showClose: true,
      message: "Enable your location to get pin",
      type: "error",
      center: true,
    });
    centerDialogVisible.value = false;
  };
  navigator.geolocation.getCurrentPosition(successCallback, errorCallback, {
    enableHighAccuracy: true,
  });
};

const calculateEmi = () => {
  const system_cost = calculatorData.loan_amount;
  const loan_term_years = 5;
  const interest_rate = 10 / 1200;
  const loan_months = loan_term_years * 12;

  store.UPDATE_CALCULATOR_DATA(loan_term_years, "Loan Term");
  store.UPDATE_CALCULATOR_DATA(interest_rate, "Loan Rate");

  const emi_cost = Math.round(
    (system_cost * interest_rate * Math.pow(1 + interest_rate, loan_months)) /
      (Math.pow(1 + interest_rate, loan_months) - 1)
  );

  const calculate_emi = emi_cost;

  emi.value = calculate_emi;

  store.UPDATE_CALCULATOR_DATA(calculate_emi, "emi_update");
};
</script>

<style scoped>
.pincode-back-mobile {
  padding: 1rem;
  display: flex;
  justify-content: space-between;
  background-color: #e8edf2;
  color: #222222;
}

.bottom_container {
  display: flex;
}
.left {
  flex: 1.5;
  height: 89vh;
}

.left-inner {
  background: #edf1f5;
  box-shadow: 1px 0px 4px 0px rgba(0, 0, 0, 0.25);
  height: 80vh;
  overflow-y: scroll;
}

.right {
  flex: 3;
  padding: 24px;
  height: 100%;
}

.inputContainer {
  border: none;
  margin-left: 1vw;
  outline: none;
}
.imgContainer {
  height: 30px;
  width: 30px;
}

.bottom-left {
  padding: 0px 16px 16px 16px;
}

.generateButton {
  background-color: white;
  height: 75px;
  border-top: 1px solid rgb(218, 218, 214);
  padding-top: auto;
}

.button {
  width: 100%;
  height: 100%;
  background-color: #006eaf;
  border: none;
  outline: none;
  color: var(--grey-grey-100, var(--White, #fff));
  font-family: Arial;
  font-size: 14px;
  font-style: normal;
  font-weight: 700;
  line-height: normal;
  text-transform: uppercase;
  border-radius: 8px;
  cursor: pointer;
}

.button_disabled {
  width: 100%;
  border: none;
  height: 100%;
  background-color: #e8edf2;
  outline: none;
  color: #ccc;
  font-family: Arial;
  font-size: 14px;
  font-style: normal;
  font-weight: 700;
  line-height: normal;
  text-transform: uppercase;
  border-radius: 8px;
  cursor: not-allowed;
}

.el-loading-mask {
  color: white !important;
}

.wrapper {
  width: 100%;
  height: 100%;
  padding: 12px;
  display: flex;
  align-items: center;
  justify-content: center;
  box-shadow: 1px 0px 4px 0px rgba(0, 0, 0, 0.25);
}

.left-inner::-webkit-scrollbar {
  display: none;
}

.hrClass {
  border-top: 1px solid #cccccc;
}

.loading_popup >>> .el-dialog__headerbtn {
  display: none;
}

.loading_popup >>> .el-dialog__header {
  display: none;
}

.loading_popup :deep() .el-dialog {
  padding: 0px;
  border-radius: 8px;
}

.left-inner {
  -ms-overflow-style: none; /* IE and Edge */
  scrollbar-width: none; /* Firefox */
}

@media screen and (max-width: 1180px) and (min-width: 375px) {
  .bottom_container {
    flex-direction: column-reverse;
  }

  .rightContainer {
    margin-top: 10px;
  }

  .rightContainer::-webkit-scrollbar {
    display: none;
  }

  .rightContainer {
    -ms-overflow-style: none; /* IE and Edge */
    scrollbar-width: none; /* Firefox */
  }

  .loading_popup :deep() .el-dialog {
    padding: 0px;
    border-radius: 8px;
    width: 50%;
  }
}

@media screen and (max-width: 740px) and (min-width: 360px) {
  .bottom_container {
    flex-direction: column-reverse;
  }

  .rightContainer {
    margin-top: 0;
  }

  .loading_popup :deep() .el-dialog {
    padding: 0px;
    border-radius: 8px;
    width: 90%;
  }
}
</style>
