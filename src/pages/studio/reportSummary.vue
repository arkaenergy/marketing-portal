<template>
  <div class="parentContainer" v-loading="isLoading">
    <Navbar :isStepsShow="false" :isBackBtnShow="false" />
    <div class="link3dContainer">
      <p class="savingHeading">Here's your roof in 3D with solar</p>
      <img :src="canvasImage" class="linkImg" />
      <!-- <el-button type="primary" class="linkBtnMD"
        >Click here for 3D Model</el-button
      > -->
    </div>
    <div class="detailsContainer">
      <p class="savingHeading">Our Recommendation</p>
      <div class="container">
        <div class="cards">
          <div class="imgTxtCont">
            <div class="imgContainer blueIcon">
              <img :src="allIcon.get('Group2280')" alt="" />
            </div>
            <p class="cardTxt">Estimated System
              Size</p>
          </div>
          <h4 class="cardValue">{{ this.projectSize.toFixed(2) }} kWp</h4>
        </div>
        <div class="cards">
          <div class="imgTxtCont">
            <div class="imgContainer orngIcon">
              <img :src="allIcon.get('noun-solar-4792183')" alt="" />
            </div>
            <p class="cardTxt">Estimated Generation</p>
          </div>
          <h4 class="cardValue">{{ this.annualGeneration.toFixed(2) }} kWh</h4>
        </div>
        <!-- <div class="cards centerCard">
          <div class="imgContainer prpleIcon centerIcon">
            <img src="/assets/Group2420.svg" alt="" />
          </div>
          <p class="cardTxt">3D View</p>
        </div> -->
      </div>
      <p class="savingHeading">Your Savings</p>
      <div class="container">
        <div class="cards">
          <div class="imgTxtCont">
            <div class="imgContainer blueIcon">
              <img :src="allIcon.get('Union25')" alt="" />
            </div>
            <p class="cardTxt">Estimated Lifetime
              Savings</p>
          </div>
          <h4 class="cardValue" v-if="isRil">${{ (this.lifetimeSavings/82).toFixed(2) }}</h4>
          <h4 class="cardValue" v-else>₹{{ this.lifetimeSavings.toFixed(2) }}</h4>
        </div>
        <div class="cards">
          <div class="imgTxtCont">
            <div class="imgContainer orngIcon">
              <img :src="allIcon.get('noun-roi-2514388')" alt="" />
            </div>
            <p class="cardTxt">Payback Period</p>
          </div>
          <h4 class="cardValue">{{ this.paybackPeriod }} </h4>
        </div>
        <div class="cards">
          <div class="imgTxtCont">
            <div class="imgContainer blueIcon">
              <img :src="allIcon.get('Union25')" alt="" />
            </div>
            <p class="cardTxt">Estimated System
              Cost</p>
          </div>
          <h4 class="cardValue" v-if="isRil">${{ (this.systemCost/82).toFixed(2) }}</h4>
          <h4 class="cardValue" v-else>₹{{ this.systemCost.toFixed(2) }}</h4>
        </div>
      </div>
      <p class="savingHeading">Your Contribution to Environment</p>
      <div class="container marginBottom">
        <div class="cards">
          <div class="imgTxtCont">
            <div class="imgContainer blueIcon">
              <img :src="allIcon.get('co2gas')" alt="" />
            </div>
            <p class="cardTxt">CO<sub>2</sub> Reduced</p>
          </div>
          <h4 class="cardValue">{{ this.co2.toFixed(2) }} tons</h4>
        </div>
        <div class="cards">
          <div class="imgTxtCont">
            <div class="imgContainer orngIcon">
              <img :src="allIcon.get('tree')" alt="" />
            </div>
            <p class="cardTxt">Tree Planted</p>
          </div>
          <h4 class="cardValue">{{ this.trees.toFixed(0) }}</h4>
        </div>
      </div>
    </div>
    <div class="bottomBtnContainer">
      <el-button type="primary" :loading="isButtonLoading" class="dwnldBtn" @click="downloadReport">Send Email</el-button>
    </div>
  </div>
</template>

<script>
import API from '@/services/api';
import utils from '@/pages/siteSurvey/utils';
import { useStudioStore } from '../store/studioStore';
import { FLOOR_STATE } from './constants';
import { SAVE_REPORT_LAMBDA_ENDPOINT } from '../../constants';
import { v4 } from "uuid";
import { isRil } from "../../constants";

export default {
  data() {
    return {
      annualSavings: 0,
      lifetimeSavings: 0,
      annualGeneration: 0,
      paybackPeriod: 0,
      projectSize: 0,
      co2: 0,
      systemCost: 0,
      trees:0,
      leadId: 0,
      emailId:'',
      isLoading: false,
      canvasImage: null,
      allIcon: utils.images,
      studioStore: useStudioStore(),
      isButtonLoading:false,
      isRil
    }
  },
  created() {
    if (!localStorage.getItem('currentAppState')) {
      this.$router.push({ name: 'homePage' });
    }
    if (localStorage.getItem('canvasImage')) {
      this.canvasImage = localStorage.getItem('canvasImage');
    } else {
      this.canvasImage = "https://cdn.pixabay.com/photo/2012/08/27/14/19/mountains-55067__340.png";
    }
  },
  async mounted() {
    this.isLoading = true;
    let componentData = localStorage.getItem('componentData');
    if (componentData) {
      componentData = JSON.parse(componentData);
      this.leadId = componentData.savingsData.leadId;
      this.emailId = componentData.savingsData.emailId;
    }
  
    const response = await this.getReportData();
    this.isLoading = false;
    this.annualSavings = response.annual_saving;
    this.lifetimeSavings = response.lifetime_savings;
    this.annualGeneration = response.annual_generation;
    this.paybackPeriod = this.formatDuration(response.payback);
    this.projectSize = response.project_size;
    this.co2 = response.co2_offset;
    this.systemCost = response.system_cost;
    this.trees = response.trees;
  },
  methods: {
    formatDuration(duration) {
      const years = duration.years || 0;
      const months = duration.months || 0;
      if (years === 0 && months === 0) {
        return "0 years and 0 months"; // Return "0 years and 0 months" string
      }
      let result = "";
      if (years > 0) {
        result += years === 1 ? "1 year" : `${years} years`;
      }
      if (months > 0) {
        if (years > 0) {
          result += " and ";
        }
        result += months === 1 ? "1 month" : `${months} months`;
      }
      return result;
    },
    async getReportData() {
      if (!this.$stageInstance) {
        return JSON.parse(localStorage.getItem("tempReportData"));
      }
      const panelMap = this.$stageInstance.panelMapExporter();
      const postData = {
        "inverterElectricalMap": {
          "micro": [],
          "string": [
            {
              "inverterDatabaseId": 5736,
              "inverterMake": "PVS-120-TL",
              "inverterManufacturer": "ABB",
              "electricalProperties": {
                "id": 5736,
                "image": null,
                "deleted": false,
                "deleted_at": null,
                "Manufacturer": "ABB",
                "Make": "PVS-120-TL",
                "model": null,
                "series": null,
                "Source_link": "https://cdn.enfsolar.com/Product/pdf/Inverter/5bac295a532e9.PDF",
                "Note": "",
                "Size": 120,
                "Number_of_MPPT": 6,
                "Number_of_Strings": "4/4/4/4/4/4",
                "MPPT_Low_V": 570,
                "MPPT_High_V": 850,
                "max_efficiency": 98.9,
                "euro_efficiency": 98.6,
                "nominal_dc_voltage": null,
                "rated_dc_voltage": null,
                "max_dc_voltage": 1000,
                "min_dc_voltage_to_start_feed_in": 420,
                "nominal_dc_power": null,
                "rated_dc_power": null,
                "max_dc_power": 123000,
                "nominal_dc_current": null,
                "rated_dc_current": null,
                "max_dc_current": "36/36/36/36/36/36",
                "power_factor_min": null,
                "power_factor_max": 1,
                "power_consumption_at_night": null,
                "number_of_feed_in_phases": null,
                "nominal_ac_voltage": [
                  0
                ],
                "rated_ac_voltage": null,
                "output_ac_voltage_range_end": null,
                "output_ac_voltage_range_start": null,
                "nominal_ac_power": null,
                "rated_ac_power": null,
                "max_ac_power_VA": 120000,
                "max_ac_power_W": 120000,
                "nominal_ac_current": null,
                "rated_ac_current": null,
                "max_ac_current": 145,
                "depth": null,
                "height": null,
                "weight": null,
                "width": null,
                "distortion": null,
                "frequency": null,
                "interface": null,
                "operation_temperature_end": null,
                "operation_temperature_start": null,
                "protection_class": null,
                "reference_id": null,
                "region": null,
                "inverter_type": null,
                "image_link": null,
                "organisation_specific_inverter": null
              },
              "mppts": [
                {
                  "linkedSubarraysIds": [
                    3
                  ],
                  "stringRange": {
                    "minimum": 18,
                    "maximum": 19
                  },
                  "strings": [],
                  "maxStrings": 4,
                  "suggestedStringCount": 4
                },
                {
                  "linkedSubarraysIds": [
                    3
                  ],
                  "stringRange": {
                    "minimum": 18,
                    "maximum": 19
                  },
                  "strings": [],
                  "maxStrings": 4,
                  "suggestedStringCount": 4
                },
                {
                  "linkedSubarraysIds": [
                    3
                  ],
                  "stringRange": {
                    "minimum": 18,
                    "maximum": 19
                  },
                  "strings": [],
                  "maxStrings": 4,
                  "suggestedStringCount": 4
                },
                {
                  "linkedSubarraysIds": [
                    3
                  ],
                  "stringRange": {
                    "minimum": 18,
                    "maximum": 19
                  },
                  "strings": [],
                  "maxStrings": 4,
                  "suggestedStringCount": 4
                },
                {
                  "linkedSubarraysIds": [
                    3
                  ],
                  "stringRange": {
                    "minimum": 18,
                    "maximum": 19
                  },
                  "strings": [],
                  "maxStrings": 4,
                  "suggestedStringCount": 4
                },
                {
                  "linkedSubarraysIds": [
                    3
                  ],
                  "stringRange": {
                    "minimum": 18,
                    "maximum": 19
                  },
                  "strings": [],
                  "maxStrings": 4,
                  "suggestedStringCount": 4
                }
              ]
            },
            {
              "inverterDatabaseId": 5736,
              "inverterMake": "PVS-120-TL",
              "inverterManufacturer": "ABB",
              "electricalProperties": {
                "id": 5736,
                "image": null,
                "deleted": false,
                "deleted_at": null,
                "Manufacturer": "ABB",
                "Make": "PVS-120-TL",
                "model": null,
                "series": null,
                "Source_link": "https://cdn.enfsolar.com/Product/pdf/Inverter/5bac295a532e9.PDF",
                "Note": "",
                "Size": 120,
                "Number_of_MPPT": 6,
                "Number_of_Strings": "4/4/4/4/4/4",
                "MPPT_Low_V": 570,
                "MPPT_High_V": 850,
                "max_efficiency": 98.9,
                "euro_efficiency": 98.6,
                "nominal_dc_voltage": null,
                "rated_dc_voltage": null,
                "max_dc_voltage": 1000,
                "min_dc_voltage_to_start_feed_in": 420,
                "nominal_dc_power": null,
                "rated_dc_power": null,
                "max_dc_power": 123000,
                "nominal_dc_current": null,
                "rated_dc_current": null,
                "max_dc_current": "36/36/36/36/36/36",
                "power_factor_min": null,
                "power_factor_max": 1,
                "power_consumption_at_night": null,
                "number_of_feed_in_phases": null,
                "nominal_ac_voltage": [
                  0
                ],
                "rated_ac_voltage": null,
                "output_ac_voltage_range_end": null,
                "output_ac_voltage_range_start": null,
                "nominal_ac_power": null,
                "rated_ac_power": null,
                "max_ac_power_VA": 120000,
                "max_ac_power_W": 120000,
                "nominal_ac_current": null,
                "rated_ac_current": null,
                "max_ac_current": 145,
                "depth": null,
                "height": null,
                "weight": null,
                "width": null,
                "distortion": null,
                "frequency": null,
                "interface": null,
                "operation_temperature_end": null,
                "operation_temperature_start": null,
                "protection_class": null,
                "reference_id": null,
                "region": null,
                "inverter_type": null,
                "image_link": null,
                "organisation_specific_inverter": null
              },
              "mppts": [
                {
                  "linkedSubarraysIds": [
                    3
                  ],
                  "stringRange": {
                    "minimum": 18,
                    "maximum": 19
                  },
                  "strings": [],
                  "maxStrings": 4,
                  "suggestedStringCount": 4
                },
                {
                  "linkedSubarraysIds": [
                    3
                  ],
                  "stringRange": {
                    "minimum": 18,
                    "maximum": 19
                  },
                  "strings": [],
                  "maxStrings": 4,
                  "suggestedStringCount": 4
                },
                {
                  "linkedSubarraysIds": [
                    3
                  ],
                  "stringRange": {
                    "minimum": 18,
                    "maximum": 19
                  },
                  "strings": [],
                  "maxStrings": 4,
                  "suggestedStringCount": 4
                },
                {
                  "linkedSubarraysIds": [
                    3
                  ],
                  "stringRange": {
                    "minimum": 18,
                    "maximum": 19
                  },
                  "strings": [],
                  "maxStrings": 4,
                  "suggestedStringCount": 4
                },
                {
                  "linkedSubarraysIds": [
                    3
                  ],
                  "stringRange": {
                    "minimum": 18,
                    "maximum": 19
                  },
                  "strings": [],
                  "maxStrings": 4,
                  "suggestedStringCount": 4
                },
                {
                  "linkedSubarraysIds": [
                    3
                  ],
                  "stringRange": {
                    "minimum": 18,
                    "maximum": 19
                  },
                  "strings": [],
                  "maxStrings": 4,
                  "suggestedStringCount": 4
                }
              ]
            },
            {
              "inverterDatabaseId": 5736,
              "inverterMake": "PVS-120-TL",
              "inverterManufacturer": "ABB",
              "electricalProperties": {
                "id": 5736,
                "image": null,
                "deleted": false,
                "deleted_at": null,
                "Manufacturer": "ABB",
                "Make": "PVS-120-TL",
                "model": null,
                "series": null,
                "Source_link": "https://cdn.enfsolar.com/Product/pdf/Inverter/5bac295a532e9.PDF",
                "Note": "",
                "Size": 120,
                "Number_of_MPPT": 6,
                "Number_of_Strings": "4/4/4/4/4/4",
                "MPPT_Low_V": 570,
                "MPPT_High_V": 850,
                "max_efficiency": 98.9,
                "euro_efficiency": 98.6,
                "nominal_dc_voltage": null,
                "rated_dc_voltage": null,
                "max_dc_voltage": 1000,
                "min_dc_voltage_to_start_feed_in": 420,
                "nominal_dc_power": null,
                "rated_dc_power": null,
                "max_dc_power": 123000,
                "nominal_dc_current": null,
                "rated_dc_current": null,
                "max_dc_current": "36/36/36/36/36/36",
                "power_factor_min": null,
                "power_factor_max": 1,
                "power_consumption_at_night": null,
                "number_of_feed_in_phases": null,
                "nominal_ac_voltage": [
                  0
                ],
                "rated_ac_voltage": null,
                "output_ac_voltage_range_end": null,
                "output_ac_voltage_range_start": null,
                "nominal_ac_power": null,
                "rated_ac_power": null,
                "max_ac_power_VA": 120000,
                "max_ac_power_W": 120000,
                "nominal_ac_current": null,
                "rated_ac_current": null,
                "max_ac_current": 145,
                "depth": null,
                "height": null,
                "weight": null,
                "width": null,
                "distortion": null,
                "frequency": null,
                "interface": null,
                "operation_temperature_end": null,
                "operation_temperature_start": null,
                "protection_class": null,
                "reference_id": null,
                "region": null,
                "inverter_type": null,
                "image_link": null,
                "organisation_specific_inverter": null
              },
              "mppts": [
                {
                  "linkedSubarraysIds": [
                    3
                  ],
                  "stringRange": {
                    "minimum": 18,
                    "maximum": 19
                  },
                  "strings": [],
                  "maxStrings": 4,
                  "suggestedStringCount": 4
                },
                {
                  "linkedSubarraysIds": [
                    3
                  ],
                  "stringRange": {
                    "minimum": 18,
                    "maximum": 19
                  },
                  "strings": [],
                  "maxStrings": 4,
                  "suggestedStringCount": 4
                },
                {
                  "linkedSubarraysIds": [
                    3
                  ],
                  "stringRange": {
                    "minimum": 18,
                    "maximum": 19
                  },
                  "strings": [],
                  "maxStrings": 4,
                  "suggestedStringCount": 4
                },
                {
                  "linkedSubarraysIds": [
                    3
                  ],
                  "stringRange": {
                    "minimum": 18,
                    "maximum": 19
                  },
                  "strings": [],
                  "maxStrings": 4,
                  "suggestedStringCount": 4
                },
                {
                  "linkedSubarraysIds": [
                    3
                  ],
                  "stringRange": {
                    "minimum": 18,
                    "maximum": 19
                  },
                  "strings": [],
                  "maxStrings": 4,
                  "suggestedStringCount": 4
                },
                {
                  "linkedSubarraysIds": [
                    3
                  ],
                  "stringRange": {
                    "minimum": 18,
                    "maximum": 19
                  },
                  "strings": [],
                  "maxStrings": 4,
                  "suggestedStringCount": 4
                }
              ]
            },
            {
              "inverterDatabaseId": 5736,
              "inverterMake": "PVS-120-TL",
              "inverterManufacturer": "ABB",
              "electricalProperties": {
                "id": 5736,
                "image": null,
                "deleted": false,
                "deleted_at": null,
                "Manufacturer": "ABB",
                "Make": "PVS-120-TL",
                "model": null,
                "series": null,
                "Source_link": "https://cdn.enfsolar.com/Product/pdf/Inverter/5bac295a532e9.PDF",
                "Note": "",
                "Size": 120,
                "Number_of_MPPT": 6,
                "Number_of_Strings": "4/4/4/4/4/4",
                "MPPT_Low_V": 570,
                "MPPT_High_V": 850,
                "max_efficiency": 98.9,
                "euro_efficiency": 98.6,
                "nominal_dc_voltage": null,
                "rated_dc_voltage": null,
                "max_dc_voltage": 1000,
                "min_dc_voltage_to_start_feed_in": 420,
                "nominal_dc_power": null,
                "rated_dc_power": null,
                "max_dc_power": 123000,
                "nominal_dc_current": null,
                "rated_dc_current": null,
                "max_dc_current": "36/36/36/36/36/36",
                "power_factor_min": null,
                "power_factor_max": 1,
                "power_consumption_at_night": null,
                "number_of_feed_in_phases": null,
                "nominal_ac_voltage": [
                  0
                ],
                "rated_ac_voltage": null,
                "output_ac_voltage_range_end": null,
                "output_ac_voltage_range_start": null,
                "nominal_ac_power": null,
                "rated_ac_power": null,
                "max_ac_power_VA": 120000,
                "max_ac_power_W": 120000,
                "nominal_ac_current": null,
                "rated_ac_current": null,
                "max_ac_current": 145,
                "depth": null,
                "height": null,
                "weight": null,
                "width": null,
                "distortion": null,
                "frequency": null,
                "interface": null,
                "operation_temperature_end": null,
                "operation_temperature_start": null,
                "protection_class": null,
                "reference_id": null,
                "region": null,
                "inverter_type": null,
                "image_link": null,
                "organisation_specific_inverter": null
              },
              "mppts": [
                {
                  "linkedSubarraysIds": [
                    3
                  ],
                  "stringRange": {
                    "minimum": 18,
                    "maximum": 19
                  },
                  "strings": [],
                  "maxStrings": 4,
                  "suggestedStringCount": 4
                },
                {
                  "linkedSubarraysIds": [
                    3
                  ],
                  "stringRange": {
                    "minimum": 18,
                    "maximum": 19
                  },
                  "strings": [],
                  "maxStrings": 4,
                  "suggestedStringCount": 4
                },
                {
                  "linkedSubarraysIds": [
                    3
                  ],
                  "stringRange": {
                    "minimum": 18,
                    "maximum": 19
                  },
                  "strings": [],
                  "maxStrings": 4,
                  "suggestedStringCount": 4
                },
                {
                  "linkedSubarraysIds": [
                    3
                  ],
                  "stringRange": {
                    "minimum": 18,
                    "maximum": 19
                  },
                  "strings": [],
                  "maxStrings": 4,
                  "suggestedStringCount": 4
                },
                {
                  "linkedSubarraysIds": [
                    3
                  ],
                  "stringRange": {
                    "minimum": 18,
                    "maximum": 19
                  },
                  "strings": [],
                  "maxStrings": 4,
                  "suggestedStringCount": 4
                },
                {
                  "linkedSubarraysIds": [
                    3
                  ],
                  "stringRange": {
                    "minimum": 18,
                    "maximum": 19
                  },
                  "strings": [],
                  "maxStrings": 4,
                  "suggestedStringCount": 4
                }
              ]
            },
            {
              "inverterDatabaseId": 5736,
              "inverterMake": "PVS-120-TL",
              "inverterManufacturer": "ABB",
              "electricalProperties": {
                "id": 5736,
                "image": null,
                "deleted": false,
                "deleted_at": null,
                "Manufacturer": "ABB",
                "Make": "PVS-120-TL",
                "model": null,
                "series": null,
                "Source_link": "https://cdn.enfsolar.com/Product/pdf/Inverter/5bac295a532e9.PDF",
                "Note": "",
                "Size": 120,
                "Number_of_MPPT": 6,
                "Number_of_Strings": "4/4/4/4/4/4",
                "MPPT_Low_V": 570,
                "MPPT_High_V": 850,
                "max_efficiency": 98.9,
                "euro_efficiency": 98.6,
                "nominal_dc_voltage": null,
                "rated_dc_voltage": null,
                "max_dc_voltage": 1000,
                "min_dc_voltage_to_start_feed_in": 420,
                "nominal_dc_power": null,
                "rated_dc_power": null,
                "max_dc_power": 123000,
                "nominal_dc_current": null,
                "rated_dc_current": null,
                "max_dc_current": "36/36/36/36/36/36",
                "power_factor_min": null,
                "power_factor_max": 1,
                "power_consumption_at_night": null,
                "number_of_feed_in_phases": null,
                "nominal_ac_voltage": [
                  0
                ],
                "rated_ac_voltage": null,
                "output_ac_voltage_range_end": null,
                "output_ac_voltage_range_start": null,
                "nominal_ac_power": null,
                "rated_ac_power": null,
                "max_ac_power_VA": 120000,
                "max_ac_power_W": 120000,
                "nominal_ac_current": null,
                "rated_ac_current": null,
                "max_ac_current": 145,
                "depth": null,
                "height": null,
                "weight": null,
                "width": null,
                "distortion": null,
                "frequency": null,
                "interface": null,
                "operation_temperature_end": null,
                "operation_temperature_start": null,
                "protection_class": null,
                "reference_id": null,
                "region": null,
                "inverter_type": null,
                "image_link": null,
                "organisation_specific_inverter": null
              },
              "mppts": [
                {
                  "linkedSubarraysIds": [
                    3
                  ],
                  "stringRange": {
                    "minimum": 18,
                    "maximum": 19
                  },
                  "strings": [],
                  "maxStrings": 4,
                  "suggestedStringCount": 4
                },
                {
                  "linkedSubarraysIds": [
                    3
                  ],
                  "stringRange": {
                    "minimum": 18,
                    "maximum": 19
                  },
                  "strings": [],
                  "maxStrings": 4,
                  "suggestedStringCount": 4
                },
                {
                  "linkedSubarraysIds": [
                    3
                  ],
                  "stringRange": {
                    "minimum": 18,
                    "maximum": 19
                  },
                  "strings": [],
                  "maxStrings": 4,
                  "suggestedStringCount": 4
                },
                {
                  "linkedSubarraysIds": [
                    3
                  ],
                  "stringRange": {
                    "minimum": 18,
                    "maximum": 19
                  },
                  "strings": [],
                  "maxStrings": 4,
                  "suggestedStringCount": 4
                },
                {
                  "linkedSubarraysIds": [
                    3
                  ],
                  "stringRange": {
                    "minimum": 18,
                    "maximum": 19
                  },
                  "strings": [],
                  "maxStrings": 4,
                  "suggestedStringCount": 4
                },
                {
                  "linkedSubarraysIds": [
                    3
                  ],
                  "stringRange": {
                    "minimum": 18,
                    "maximum": 19
                  },
                  "strings": [],
                  "maxStrings": 4,
                  "suggestedStringCount": 4
                }
              ]
            }
          ],
          "central": [],
          "isStringing": false
        },
        "panelMap": panelMap,
        "latitude": localStorage.getItem("google-map-info") ? JSON.parse(localStorage.getItem("google-map-info")).lat : 35.1253198980841361,
        "longitude": localStorage.getItem("google-map-info") ? JSON.parse(localStorage.getItem("google-map-info")).lng : -117.9861747031105068,
        "dc_size": this.$stageInstance.getDcSize(),
      };
      try {
        const response = await API.STUDIO_API.GET_FINANCIAL_DATA(this.leadId, postData);
        this.isLoading = false;
        localStorage.setItem("tempReportData", JSON.stringify(response.data));
        return response.data;
      }
      catch (e) {
        this.isLoading = false;
        console.error(e);
        ElMessage({
          showClose: true,
          message: "Error in fethcing the financial data.",
          type: "error",
          center: true
        });
      }
    },
    async downloadReport(){
        this.isButtonLoading = true;
        let referenceId = v4();
        const route = { name: "proposalTemplate" };
        let url = this.$router.resolve(route).href;
        url = "https://" + window.location.host + url + `/?leadId=${this.leadId}`;
        // url = "https://devgosolar.thesolarlabs.com/proposalTemplate/?leadId=1835"
        let payload = {
            "reference_id": referenceId,
            "base_url": url,
            "scale": 1.33,
            "landscape": false,
            "is_marketing_portal": true,
        }
        //----------------------------------------------Test data-------------------------------------------------//
        // payload.base_url = "https://devgosolar.thesolarlabs.com/solarkReport?email=sanchitagrawal429@gmail.com";
        // payload.scale = 1
        // payload.is_marketing_portal = false;
        // payload.is_solark=true;
        //------------------------------------------Test data end-----------------------------------------------//
        try{
            let response = await fetch(SAVE_REPORT_LAMBDA_ENDPOINT, {
                method: 'POST',
                body: JSON.stringify(payload),
            })
            let respText = await response.text();
            if (!response.ok) {
                throw respText
            }
            let reportUrl = respText;
            reportUrl = reportUrl.replace(/\s/g, '');
            await this.sendEmail(reportUrl);
            console.log("report url now is",reportUrl);
            // this.downloadFileHelper(reportUrl, ".pdf");
            this.isButtonLoading = false;
        }
        catch(e){
            console.error(e);
            this.isButtonLoading = false;
            ElMessage({
                showClose: true,
                message: "Error downloading report. Please try again.",
                type: "error",
                center: true
            });
        }
    },
    async sendEmail(reportUrl){
        let payload = {
          "recipients":[this.emailId],
          "subject":"Solar Self Design Report",
          "report":reportUrl,
          "lead":this.leadId
        }
        try{
          await API.STUDIO_API.SEND_EMAIL(payload);
          this.isButtonLoading = false;
          this.$router.push({ name: 'reportSuccess' });
          this.clearLocalStorage();
        }
        catch(e){
          console.error(e);
          this.isButtonLoading = false;
          ElMessage({
                showClose: true,
                message: "There is some error in sending email. Please try again",
                type: "error",
                center: true
          });
        }
    },
    clearLocalStorage() {
      localStorage.removeItem('componentData');
      localStorage.removeItem('currentAppState');
      localStorage.removeItem('stageData');
      localStorage.removeItem('google-map-info');
      this.studioStore.$patch({
        currentAppState: FLOOR_STATE,
      });
      this.studioStore.$patch({
        basePolygonDrawn: false,
      });
      this.studioStore.$patch({
        atleast3PointsDrawn: false,
      });
      this.studioStore.$patch({
        obstructionPlacedInScene: false,
      });
      this.studioStore.$patch({
        undoEnabled : false,
      });
      this.studioStore.$patch({
        zoomValue : 3,
      });
    },
  },
  computed:{
    monthVariable(){
      return this.paybackPeriod>1 ? 'Months' : 'Month';
    }
  }
}
</script>

<style scoped>
@font-face {
  font-family: "SegoeUI";
  src: url(/fonts/SegoeUI.ttf);
}

@font-face {
  font-family: "SegoeUI";
  src: url(/fonts/SegoeUIBold.ttf);
}

.link3dContainer {
  padding: 20px 16px;
}

.linkImg {
  width: 100%;
  height: 50vh;
  object-fit: cover;
  border-radius: 8px;
}

/* .linkBtnMD {
  width: 100%;
  height: 44px;
  margin-top: -3px;
  border-radius: 0px;
  border-bottom-right-radius: 8px;
  border-bottom-left-radius: 8px;
  font-size: 16px;
  font-weight: 600;
  font-family: "SegoeUI";
} */

.detailsContainer {
  background-color: #f6f9fb;
  padding: 16px 16px;
}

.savingHeading {
  font-size: 18px;
  font-weight: 600;
  color: #222;
  margin-bottom: 10px;
  font-family: "SegoeUI";
}

.container {
  display: grid;
  grid-template-columns: 1fr;
  justify-content: space-between;
  gap: 16px;
  margin-bottom: 16px;
}

.marginBottom {
  margin-bottom: 48px;
}

.cards {
  padding: 16px 16px 16px 16px;
  border-radius: 12px;
  background-color: #fff;
  display: flex;
  justify-content: space-between;
  align-items: center;
  gap: 16px;
  box-shadow: 0 3px 6px 0 rgba(0, 0, 0, 0.16);
}

.imgTxtCont {
  display: flex;
  gap: 16px;
  align-items: center;
}

.centerCard {
  display: grid;
  place-items: center;
}

.imgContainer {
  border-radius: 50%;
  width: 40px;
  height: 40px;
  display: grid;
  place-items: center;
  color: #fff;
}

.blueIcon {
  background-color: #409eff;
}

.orngIcon {
  background-color: #f88227;
}

.prpleIcon {
  background-color: #4d6ab7;
}

.centerIcon {
  margin-bottom: -40px;
}

.cardTxt {
  font-size: 14px;
  font-weight: 600;
  line-height: 1.43;
  color: #777;
  max-width: 128px;
  font-family: "SegoeUI";
}

.cardValue {
  font-size: 20px;
  font-weight: 600;
  line-height: 1.35;
  color: #222;
  font-family: "SegoeUI";
}

.dwnldBtn {
  position: fixed;
  bottom: 0;
  width: 100%;
  height: 48px;
  font-size: 16px;
  font-weight: 600;
  font-family: "SegoeUI";
  border-radius: 0px;
}

.parentContainer :deep() .el-button>span {
  font-family: "SegoeUI";
}
</style>