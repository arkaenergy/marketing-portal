<template>
  <div class="parent-container reportLoaded">
    <div class="page first-page main-background">
      <img src="./assets/images/A4.svg" alt="" class="backgroundImg" />
      <div style="padding: 36px 0 0 36px">
        <span class="title">Homeowner’s Estimate Report v0.0</span>
        <div class="section">
          <div class="company-info">
            <span class="title" style="font-size: 1rem">{{ companyName }}</span>
            <span class="company-sub-detail">{{ companyAddress }}</span>
            <span class="company-sub-detail">{{ companyEmail }}</span>
          </div>
          <template v-if="!isRil">
            <span  class="rectangle"></span>
            <img src="./assets/images/arka_on_white_1.svg" />
          </template>
        </div>
        <div class="bottom-details">
          <span class="name">{{ personName }}</span>
          <span class="address">{{ personAddress }}</span>
          <span class="number-email">
            {{ `${personNumber} | ${personEmail}` }}
          </span>
        </div>
      </div>
    </div>

    <!-- 3D model view -->
    <!-- <div class="page third-page">
      <div style="margin-bottom: 10px;">
        <span class="section-heading" >3D View of Your Design</span>
      </div>
      <div class="map-image"><img :src="canvasImage" class="link-image" /></div>
      <p style="font-size: 13px;margin-bottom: 0.5rem;">
        Lorem ipsum dolor sit amet, consectetur adipiscing elit. Nunc vel libero sapien. dignissim, odio nec vulputate posuere, tortor magna bibendum ipsum, in laoreet ante magna rhoncus augue. Aenean et lorem fermentum, feugiat tortor vitae, varius leo. Curabitur elementum ornare tellus, eget accumsan lorem condimentum ac.</p>
    </div> -->

    <!-- Recommendations and estimations -->
    <div class="page third-page">
      <div class="map-image"><img :src="canvasImage" class="link-image" /></div>
      <p style="font-size: 13px;margin-bottom: 0.5rem;">
        Generation Losses are decreases in system performance due to environmental factors, the climate and the system’s load. Shading Analysis accounts for decrease in performance from shadows cast on the PV modules.</p>
      <div class="section">
        <span class="section-heading">Our Recommendations and Estimations</span>
        <el-row :gutter="11" class="vertical-gap" style="margin-top:12px">
          <el-col :span="12">
            <Card>
              <template v-slot:left>
                <div class="icon-area icon-primary">
                  <img src="./assets/images/charger.svg" alt="" />
                </div>
              </template>
              <template v-slot:right>
                <div class="content-area">
                  <span class="card-heading">System Size</span>
                  <span class="value"
                    >{{
                      formatNumberInternational(estimatedSystemSize)
                    }}
                    kWp</span
                  >
                </div>
              </template>
            </Card>
          </el-col>
          <el-col :span="12">
            <Card>
              <template v-slot:left>
                <div class="icon-area icon-warning">
                  <img src="./assets/images/solar_power.svg" alt="" />
                </div>
              </template>
              <template v-slot:right>
                <div class="content-area">
                  <span class="card-heading">Annual Generation</span>
                  <span class="value"
                    >{{
                      formatNumberInternational(estimatedGeneration)
                    }}
                    kWh</span
                  >
                </div>
              </template>
            </Card>
          </el-col>
          <el-col :span="24">
            <Card>
              <template v-slot:right>
                <el-row style="width:100%">
                  <el-col :span="12">
                    <div class="content-area">
                      <span class="card-heading">Module</span>
                      <span class="value">{{ module  }}</span>
                    </div>
                  </el-col>
                  <el-col :span="12">
                    <div class="content-area">
                      <span class="card-heading">Quantity </span>
                      <span class="value" style="margin-left: 5px;">{{ moduleQuantity }}</span>
                    </div>
                  </el-col>
                </el-row>

              </template>
            </Card>
          </el-col>
          <!-- <el-col :span="12">
            <Card>
              <template v-slot:right>
                <div class="content-area">
                  <span class="card-heading">Inverter</span>
                  <span class="value">{{ inverter }}</span>
                </div>
              </template>
            </Card>
          </el-col> -->
        </el-row>
      </div>
      <div class="disclaimer">
        <div class="footer-top-border" style="padding-top: 0px; width:100%">
          <p class="disclaimer-text" style="margin-top: 10px;" >
            *Annual Generation is an estimate of the power available to you over the period of a year.         
          </p>
        </div>
      </div>
    </div>

    <div class="page third-page">
      <div class="section">
        <span class="section-heading">Your Estimated Savings</span>
        <el-row :gutter="11" class="vertical-gap" style="margin-top:12px">
          <el-col :span="12">
            <Card>
              <template v-slot:left>
                <div class="icon-area icon-primary">
                  <img src="./assets/images/routine.svg" alt="" />
                </div>
              </template>
              <template v-slot:right>
                <div class="content-area">
                  <span class="card-heading">Lifetime Savings*</span>
                  <span class="value"
                    >₹
                    {{
                      formatNumberInternational(estimatedLifetimeSavings)
                    }}</span
                  >
                </div>
              </template>
            </Card>
          </el-col>
          <el-col :span="12">
            <Card>
              <template v-slot:left>
                <div class="icon-area icon-warning">
                  <img src="./assets/images/currency_exchange.svg" alt="" />
                </div>
              </template>
              <template v-slot:right>
                <div class="content-area">
                  <span class="card-heading">Payback Period</span>
                  <span class="value">{{ paybackPeriod }}</span>
                </div>
              </template>
            </Card>
          </el-col>
          <el-col :span="12">
            <Card>
              <template v-slot:left>
                <div class="icon-area icon-success">
                  <img src="./assets/images/request_quote.svg" alt="" />
                </div>
              </template>
              <template v-slot:right>
                <div class="content-area">
                  <span class="card-heading">System Cost**</span>
                  <span class="value"
                    >₹
                    {{ formatNumberInternational(estimatedSystemCost) }}</span
                  >
                </div>
              </template>
            </Card>
          </el-col>
        </el-row>
      </div>
      <div class="section">
        <span class="section-heading"
          >Your Contribution to the Environment</span
        >
        <el-row :gutter="11" class="vertical-gap" style="margin-top:12px">
          <el-col :span="12">
            <Card>
              <template v-slot:left>
                <div class="icon-area icon-primary">
                  <img src="./assets/images/co2.svg" alt="" />
                </div>
              </template>
              <template v-slot:right>
                <div class="content-area">
                  <span class="card-heading">CarbonDioxide Offset</span>
                  <span class="value"
                    >{{
                      formatNumberInternational(cardbonDioxideOffset)
                    }}
                    metric tons</span
                  >
                </div>
              </template>
            </Card>
          </el-col>
          <el-col :span="12">
            <Card>
              <template v-slot:left>
                <div class="icon-area icon-warning">
                  <img src="./assets/images/forest.svg" alt="" />
                </div>
              </template>
              <template v-slot:right>
                <div class="content-area">
                  <span class="card-heading">Equivalent Forests Saved</span>
                  <span class="value"
                    >{{
                      formatNumberInternational(equivalentForestsSaved)
                    }}
                    acres</span
                  >
                </div>
              </template>
            </Card>
          </el-col>
          <el-col :span="12">
            <Card>
              <template v-slot:left>
                <div class="icon-area icon-success">
                  <img src="./assets/images/mode_heat_off.svg" alt="" />
                </div>
              </template>
              <template v-slot:right>
                <div class="content-area">
                  <span class="card-heading">Coal Burn Avoided</span>
                  <span class="value"
                    >{{ formatNumberInternational(coalBurnAvoided) }} metric
                    tons</span
                  >
                </div>
              </template>
            </Card>
          </el-col>
        </el-row>
      </div>
      <div class="footer-top-border" style="padding-top: 6px;">
        <p class="disclaimer-text">
          <span class="bold-text">Disclaimer -</span> This report contains estimates derived from the design you’ve created. It is not a proposal from our company. Please contact our sales team for an accurate proposal. 
        </p>
        <p class="disclaimer-text" style="margin-top: 10px;">
          <span class="bold-text">Generated on:</span> 13 September 2023 at 11:15 AM
        </p>
      </div>

      <div class="disclaimer">
        <div class="footer-top-border" style="padding-top: 0px; width:100%">
          <p class="disclaimer-text" style="margin-top: 10px;" >
            *Lifetime Savings is an estimate of the savings over the lifetime of the system. 
          </p>
          <p class="disclaimer-text" style="margin-top: 5px;" >
            **System Cost is an estimate of the cost of the system not incluing installation and storage. 
          </p>
        </div>
      </div>
    </div>
  </div>
</template>

<script>
import API from "@/services/api";
import Card from "./reusableCard.vue";
import { formatNumberInternational, waitForImagesToLoad } from "@/utils.js";
import { isRil } from "../../../constants";

export default {
  components: {
    Card,
  },
  data() {
    return {
      companyName: "[Company Name]",
      companyAddress: "[Address]",
      companyEmail: "[Company Email]",
      personName: "John Doe",
      personAddress: "132, My Street, Kingston, New York 12401",
      personNumber: "(555) 555-1234",
      personEmail: "johndoe@gmail.com",
      canvasImage: null,
      estimatedSystemSize: "29.40",
      estimatedGeneration: "45645.85",
      module: "REC Alpha Pro M 640 W",
      inverter: "Enphase IQ8A-72-M-US",
      estimatedLifetimeSavings: "252047.16",
      paybackPeriod: "1 year 4 months",
      estimatedSystemCost: "1622400.00",
      cardbonDioxideOffset: "623.02",
      equivalentForestsSaved: "6205.00",
      coalBurnAvoided: "9098.20",
      isRil,
    };
  },
  async created() {
    // if (!localStorage.getItem("currentAppState")) {
    //   this.$router.push({ name: "homePage" });
    // }
    // if (localStorage.getItem("canvasImage")) {
    //   this.canvasImage = localStorage.getItem("canvasImage");
    // } else {
    //   this.canvasImage =
    //     "https://cdn.pixabay.com/photo/2012/08/27/14/19/mountains-55067__340.png";
    // }
    // this.canvasImage =
    //   "https://downloadstsl.blob.core.windows.net/marketingportal/b6e54801-f697-4ea3-a79b-c9562a0e699c";
    //get lead_id from url
    let lead_id = this.$route.query.leadId;
    //2829
    console.log("lead_id", lead_id);
    //call API and populate fields for report
    await this.fetchReportInfo(lead_id);
  },

  mounted() {
    waitForImagesToLoad();
  },

  methods: {
    formatNumberInternational,
    async fetchReportInfo(lead_id) {
      const response = await API.STUDIO_API.FETCH_STUDIO_REPORT_INFO(lead_id);
      //console.log(response);
      const upperData = response.data.results[0];
      console.log(upperData);
      const reportData = response.data.results[0].report_json;
      console.log(reportData);
      this.companyName = upperData.lead_details.company.name;
      this.companyAddress = upperData.lead_details.company.address;
      this.companyEmail = upperData.lead_details.company.email;
      this.personName = upperData.lead_details.name;
      this.personAddress = upperData.lead_details.address;
      this.personNumber = upperData.lead_details.phone;
      this.personEmail = upperData.lead_details.email;
      this.canvasImage = upperData.files[0]?.file_url;
      this.estimatedSystemSize = reportData.project_size;
      this.estimatedGeneration = reportData.annual_generation;
      this.module = reportData.panel[0].brand + " " + reportData.panel[0].model;
      this.moduleQuantity = reportData.n_panels;
      this.inverter =
        reportData.inverter.string[0].manufactuerer +
        " " +
        reportData.inverter.string[0].make;
      this.estimatedLifetimeSavings = reportData.lifetime_savings;
      this.paybackPeriod = this.formatDuration(reportData.payback);
      this.estimatedSystemCost = reportData.system_cost;
      this.cardbonDioxideOffset = reportData.co2_offset;
      this.equivalentForestsSaved = reportData.acres_of_forest;
      this.coalBurnAvoided = reportData.coal_burned;
      console.log(reportData.coal_burned);
    },
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
  },
};
</script>

<style scoped>
* {
  font-family: "Switzer";
  box-sizing: border-box;
}

.align-as-column {
  display: flex;
  flex-flow: column wrap;
  justify-content: space-around;
}

.align-as-row {
  display: flex;
  flex-flow: row wrap;
  justify-content: space-between;
}

.parent-container {
  width: 100%;
  background-color: #e8edf2;
  /* To center the report*/
  display: flex;
  flex-direction: column;
  align-items: center;
}
.page {
  height: 842px;
  width: 595px;
  padding: 1.50rem;
  background-color: #fff;
}

.first-page {
  position: relative;
  background-color: #d9d9d9 !important;
  padding: 0 !important;
  position: relative;
}

.third-page {
  position: relative;
}

.title {
  position: relative;
  color: #000;
  font-family: "Switzer";
  font-size: 24px;
  font-style: normal;
  font-weight: 600;
  line-height: normal;
}

.section {
  position: relative;
}

.section-heading {
  color: var(--arka-text, #141414);
  font-family: "Switzer";
  font-size: 1.5rem;
  font-style: normal;
  font-weight: 500;
  line-height: 1.75rem;
  margin-bottom: 0.75rem;
}

.vertical-gap .el-col {
  margin-bottom: 0.93rem;
}

.icon-area {
  display: flex;
  width: 2.875rem;
  height: 2.875rem;
  padding: 6px;
  flex-direction: column;
  justify-content: center;
  align-items: center;
  gap: 8px;
  flex-shrink: 0;
  border-radius: 2rem;
}

.icon-primary {
  background: var(--primary, #06c);
}

.icon-warning {
  background: var(--warning, #c60);
}

.icon-success {
  background: var(--success, #00a300);
}

.content-area {
  display: flex;
  flex-direction: column;
  margin-left: 0.875rem;
}

.card-heading {
  color: var(--arka-777, #777);
  font-size: 0.875rem;
  font-style: normal;
  font-weight: 500;
  line-height: 1.5rem;
}

.value {
  color: var(--arka-text, #141414);
  font-family: "Switzer";
  font-size: 1.125rem;
  font-style: normal;
  font-weight: 600;
  line-height: 1.5rem; /* 133.333% */
}

.backgroundImg {
  position: absolute;
  top: 0px;
  right: 0px;
  width: 100%;
  height: 100%;
}

/* .main-background {
  background-image: url("./assets/images/A4.svg");
  background-repeat: no-repeat;
  background-size: cover;
  background-position: center;
} */

.company-info {
  display: flex;
  flex-direction: column;
  align-items: flex-start;
  margin-top: 24px;
}

.company-sub-detail {
  color: #000;
  font-family: "Switzer";
  font-size: 14px;
  font-style: normal;
  font-weight: 400;
  line-height: normal;
}

.rectangle {
  width: 131px;
  height: 2px;
  background: var(--black, #222);
  display: block;
  margin: 1rem 0;
}

.bottom-details {
  display: inline-flex;
  flex-direction: column;
  align-items: flex-end;
  gap: 4px;
  position: absolute;
  bottom: 0;
  right: 0;
  margin: 0 2rem 2rem 0;
}
.name {
  color: #fff;
  text-align: right;
  font-family: "Switzer";
  font-size: 16px;
  font-style: normal;
  font-weight: 600;
  line-height: normal;
}

.address,
.number-email {
  color: #fff;
  text-align: right;
  font-family: "Switzer";
  font-size: 14px;
  font-style: normal;
  font-weight: 400;
  line-height: normal;
}

.link-image {
  width: 100%;
  height: 355px;
  object-fit: cover;
  border-radius: 8px;
  margin-bottom: 0.5rem;
}

.disclaimer {
  position: absolute;
  bottom: 0;
  right: 0;
  display: flex;
  width:100%;
  padding: 0rem 1.5rem 1rem 1.5rem;
  /* justify-content: center; */
  /* align-items: center; */
  /* gap: 10px; */
  /* margin: 0 2.25rem 2.25rem 2.25rem; */
}

.footer-top-border{
  border-top: 1px solid #ccc;
}

.disclaimer-text {
  color: #141414;
  font-family: "Switzer";
  font-size: 10px;
  font-style: normal;
  font-weight: 400;
  line-height: normal;
}

.bold-text {
  color: #141414;
  font-family: "Switzer";
  font-size: 10px;
  font-style: normal;
  font-weight: 600;
  line-height: normal;
}
</style>
