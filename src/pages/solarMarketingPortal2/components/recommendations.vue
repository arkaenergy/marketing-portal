<template>
  <div class="container">
    <Header
      :pageNo="3"
      :heading="heading"
      @reset="$emit('reset')"
      :extraInfoForSolarkReport="extraInfoForSolarkReport"
    />
    <div
      :class="{ 'rec-body': true, 'disable-scroll': openAdjustLoads }"
      v-loading="isLoading"
    >
      <!-- Recommendations -->
      <GlobalDialog
        :dialogTitle="'Adjust Loads'"
        :dialogVisible="openAdjustLoads"
        :width="'50%'"
        :footerButtonText="'Update'"
        @handleClick="openAdjustLoads = false"
        @handleClose="openAdjustLoads = false"
      >
        <!-- :requireLoadsFooterButtons="true" -->
        <template v-slot:body>
          <AdjustLoads @closeAdjustLoads="handleCloseAjustLoads" />
        </template>
      </GlobalDialog>
      <GlobalDialog
        :dialogTitle="'Select Inverter'"
        :dialogVisible="openSelectInverter"
        :width="'33%'"
        :requireFooterButtons="false"
        @handleClick="
          openSelectInverter = false;
          batteryFieldSetting();
        "
        @handleClose="
          openSelectInverter = false;
          batteryFieldSetting();
        "
      >
        <template v-slot:body>
          <div class="inverter-selection">
            <div class="align-as-column">
              <el-radio-group v-model="inverterChoice" class="field-value">
                <el-radio
                  v-for="option in filteredInverterOptionsArray()"
                  :key="option.value"
                  :label="option.value"
                  class="bottom-margin-8"
                >
                  {{ option.label }}
                </el-radio>
              </el-radio-group>
            </div>
            <img src="../assets/Sol-Ark-8K-22.png" />
          </div>
        </template>
      </GlobalDialog>
      <GlobalDialog
        :dialogTitle="'Battery Requirements'"
        :dialogVisible="openSelectBattery"
        :width="'40%'"
        :requireFooterButtons="false"
        @handleClick="
          openSelectBattery = false;
          inverterFieldSetting();
          initializeDataFromLS();
        "
        @handleClose="
          openSelectBattery = false;
          inverterFieldSetting();
          initializeDataFromLS();
        "
      >
        <template v-slot:body>
          <div class="inverter-selection">
            <div class="align-as-column">
              <div class="align-as-column bottom-box-border bottom-margin-16">
                <span
                  class="sub-heading bottom-margin-8"
                  style="font-size: 1rem"
                  >Select Battery Backup Goal</span
                >
                <el-radio-group v-model="batteryChoice" class="field-value">
                  <el-radio
                    v-for="option in batteryOptionsArray"
                    :key="option.value"
                    :label="option.value"
                    class="bottom-margin-8"
                  >
                    {{ option.label }}
                  </el-radio>
                </el-radio-group>
              </div>
              <div class="align-as-column">
                <span
                  class="sub-heading bottom-margin-8"
                  style="font-size: 1rem"
                  >Battery Location</span
                >
                <div class="bottom-margin-8">
                  <el-radio-group
                    v-model="batteryLocation"
                    class="field-value align-as-row"
                    @change="
                      saveDataInLocalStorage(
                        'jsonToSendForCalculation',
                        'batteryLocation',
                        batteryLocation
                      )
                    "
                  >
                    <el-radio label="Indoor" class="field-value"
                      >Indoor</el-radio
                    >
                    <el-radio label="Outdoor" class="field-value"
                      >Outdoor</el-radio
                    >
                  </el-radio-group>
                </div>
              </div>
              <div class="align-as-column">
                <span
                  class="sub-heading bottom-margin-8"
                  style="font-size: 1rem"
                  >Energy Storage Features</span
                >
                <div class="align-as-row">
                  <el-checkbox-group
                    v-model="energyStorageFeatures"
                    @change="
                      saveDataInLocalStorage(
                        'jsonToSendForCalculation',
                        'energyStorageFeatures',
                        energyStorageFeatures
                      )
                    "
                  >
                    <el-checkbox label="Heated">Heated</el-checkbox>
                    <el-checkbox label="California"
                      >California Standard</el-checkbox
                    >
                  </el-checkbox-group>
                </div>
              </div>
            </div>

            <img
              src="../assets/Screenshot_2023-07-12_174638-removebg-preview1.png"
            />
          </div>
        </template>
      </GlobalDialog>
      <!-- layout redone -->
      <el-row :gutter="20" class="vertical-gap">
        <el-col :sm="24" :lg="16">
          <ImageCard>
            <template v-slot:footer>
              <div class="sub-field">
                <div>
                  <el-row :gutter="20">
                    <el-col :xs="24" :sm="8">
                      <div
                        class="field blue-background"
                        style="margin-bottom: 0"
                      >
                        <span class="sub-sub-heading">Battery Capacity</span>
                        <span class="grey-text"
                          >{{
                            formatNumberInternational(batteryCapacity)
                          }}
                          kWh</span
                        >
                      </div>
                    </el-col>
                    <el-col :xs="24" :sm="8">
                      <div
                        class="field blue-background"
                        style="margin-bottom: 0"
                      >
                        <span class="sub-sub-heading">Energy Backup</span>
                        <span class="grey-text">{{ energyBackup }}</span>
                      </div>
                    </el-col>
                    <el-col
                      :xs="24"
                      :sm="8"
                      v-if="Number(additionalSavingsWithBattery) > 0"
                    >
                      <div
                        class="field blue-background"
                        style="margin-bottom: 0"
                      >
                        <span class="sub-sub-heading"
                          >Additional Savings with Battery</span
                        >
                        <span class="grey-text"
                          >${{
                            formatNumberInternational(
                              additionalSavingsWithBattery
                            )
                          }}</span
                        >
                      </div>
                    </el-col>
                    <el-col :xs="24" :sm="8">
                      <div
                        class="field blue-background"
                        style="margin-bottom: 0"
                      >
                        <span class="sub-sub-heading">Annual Consumption</span>
                        <span class="grey-text"
                          >{{
                            formatNumberInternational(annualConsumption)
                          }}
                          kWh</span
                        >
                      </div>
                    </el-col>
                    <el-col :xs="24" :sm="8">
                      <div
                        class="field blue-background"
                        style="margin-bottom: 0"
                      >
                        <div class="sub-sub-heading">Battery Features</div>
                        <ul class="field-value list-padding align-as-row">
                          <li
                            v-for="(item, index) in batteryFeatures"
                            :key="index"
                          >
                            {{ item }}
                          </li>
                        </ul>
                      </div>
                    </el-col>
                    <el-col :xs="24" :sm="8">
                      <div
                        class="field blue-background"
                        style="margin-bottom: 0"
                      >
                        <span class="sub-sub-heading"
                          >Recommended Partners</span
                        >
                        <ul class="field-value list-padding align-as-row">
                          <li
                            class="link-with-underline"
                            @click="fetchSelectedBatteries('Endure Energy')"
                            v-if="recommendedPartners().includes('Endurenergy')"
                          >
                            Endurenergy
                          </li>
                          <li
                            class="link-with-underline"
                            @click="fetchSelectedBatteries('Home Grid')"
                            v-if="recommendedPartners().includes('Homegrid')"
                          >
                            Homegrid
                          </li>
                          <li
                            class="link-with-underline"
                            @click="fetchSelectedBatteries('Pytes Battery')"
                            v-if="recommendedPartners().includes('Pytes')"
                          >
                            Pytes
                          </li>
                          <li
                            class="link-with-underline"
                            @click="fetchSelectedBatteries('Storz Power')"
                            v-if="recommendedPartners().includes('Storz Power')"
                          >
                            Storz Power
                          </li>
                        </ul>
                      </div>
                    </el-col>
                  </el-row>
                </div>
                <div class="field">
                  <el-button type="primary" @click="handleClickSelectBattery"
                    >Select Battery</el-button
                  >
                </div>
                <div class="field">
                  <span
                    >*Final battery capacity depends upon partner
                    selection</span
                  >
                </div>
              </div>
            </template>
          </ImageCard>
        </el-col>
        <el-col :sm="12" :lg="8">
          <ImageCard :minWidth="'341px'">
            <template v-slot:left>
              <img
                src="../assets/Screenshot_2023-07-12_122041-removebg-preview1.png"
                style="max-height: 300px"
              />
            </template>
            <template v-slot:right>
              <div class="right-content">
                <div class="field">
                  <div class="sub-heading bottom-margin-8">Solar Capacity</div>
                  <el-input-number
                    v-model="solarCapacity"
                    @change="handleChangeSolarCapacity"
                    :min="0"
                    :max="50"
                  >
                  </el-input-number>
                  <span
                    class="grey-text"
                    style="font-size: 16px; font-weight: 400; padding-left: 5px"
                    >kWp</span
                  >
                </div>
                <div class="align-as-row">
                  <div class="field" style="margin-right: 1rem">
                    <div class="sub-sub-heading">Annual Production</div>
                    <span class="field-value"
                      >{{
                        formatNumberInternational(annualProduction)
                      }}
                      kWh</span
                    >
                  </div>
                  <div class="field">
                    <div class="sub-sub-heading">Annual Savings</div>
                    <span class="field-value"
                      >${{ formatNumberInternational(annualSavings) }}</span
                    >
                  </div>
                </div>
                <div class="field">
                  <div class="sub-sub-heading">Features</div>
                  <ul class="field-value list-padding">
                    <li>All Black</li>
                    <li>High Efficiency</li>
                  </ul>
                </div>
              </div>
            </template>
          </ImageCard>
        </el-col>
        <el-col :sm="12" :lg="8">
          <ImageCard :minWidth="'341px'">
            <template v-slot:left>
              <img
                src="../assets/Sol-Ark-8K-22.png"
                style="max-height: 300px"
              />
            </template>
            <template v-slot:right>
              <div class="right-content">
                <div class="bottom-margin-8">
                  <div class="sub-heading">Inverter Capacity</div>
                </div>
                <div class="field align-as-column">
                  <span class="grey-text">{{ inverterCapacity }} kW</span>
                  <span class="field-value">{{ inverterProductName }}</span>

                  <span class="field-value"
                    >Quantity: {{ inverterQuantity }}</span
                  >
                  <span
                    class="link"
                    @click="downloadFile(inverterSpecSheetLink)"
                    >View Spec Sheet</span
                  >
                </div>
                <div class="field">
                  <el-button type="primary" @click="handleClickSelectInverter"
                    >Select Inverter</el-button
                  >
                </div>
              </div>
            </template>
          </ImageCard>
        </el-col>
        <el-col :sm="12" :lg="8">
          <ImageCard :minWidth="'341px'">
            <template v-slot:left>
              <img
                src="../assets/image_6-removebg-preview1.png"
                style="max-height: 300px"
              />
            </template>
            <template v-slot:right>
              <div class="right-content">
                <div class="field">
                  <div class="sub-heading">Monitoring</div>
                </div>
                <div class="field">
                  <span style="font-weight: 600; color: var(--black, #222)"
                    >Sol-Ark 0900-80V</span
                  >
                </div>
                <div class="field">
                  <span
                    class="field link"
                    @click="downloadFile(monitoringSpecSheetLink)"
                    >View Spec Sheet</span
                  >
                </div>
                <div class="field" style="min-width: 133px">
                  <div class="sub-heading">Features</div>
                  <ul
                    class="field-value list-padding"
                    style="word-break: normal"
                  >
                    <li>Module Level Monitoring</li>
                    <li>Shade Management</li>
                    <li>Rapid Shutdown Compliance</li>
                  </ul>
                </div>
              </div>
            </template>
          </ImageCard>
        </el-col>
        <el-col :sm="12" :lg="8">
          <ImageCard :minWidth="'341px'">
            <template v-slot:left>
              <img
                src="../assets/smart-load-cover-e16418781573811.png"
                style="max-height: 300px"
              />
            </template>
            <template v-slot:right>
              <div class="right-content">
                <div class="field">
                  <div class="sub-heading">Load Control</div>
                </div>
                <div class="field">
                  <div class="sub-sub-heading">Additional Savings</div>
                </div>
                <div class="field">
                  <span style="font-size: 1.25rem" class="grey-text"
                    >${{ formatNumberInternational(additionalSavings) }} per
                    year</span
                  >
                </div>
                <div class="field">
                  <el-button type="primary" @click="handleClickAdjustLoads"
                    >Adjust Loads</el-button
                  >
                </div>
              </div>
            </template>
            <template v-slot:footer>
              <div class="card-footer">
                <div class="field" style="margin-right: 1rem; width: 100%">
                  <span class="sub-heading" style="font-size: 1rem"
                    >Without Sol-Ark</span
                  >
                  <div
                    class="sub-field-parent align-as-row"
                    style="width: 100%"
                  >
                    <div class="sub-field">
                      <span class="sub-sub-heading" style="font-size: 0.875rem"
                        >Inverter<br />Capacity</span
                      >
                      <span class="sub-heading" style="font-size: 1rem"
                        >{{ formatNumberInternational(withoutSolIC) }} kW</span
                      >
                    </div>
                    <div class="sub-field">
                      <span class="sub-sub-heading" style="font-size: 0.875rem"
                        >Battery<br />Capacity</span
                      >
                      <span class="sub-heading" style="font-size: 1rem"
                        >{{ formatNumberInternational(withoutSolBC) }} kWh</span
                      >
                    </div>
                  </div>
                </div>
                <div class="field left-box-border" style="width: 100%">
                  <span class="sub-heading" style="font-size: 1rem"
                    >With Sol-Ark
                  </span>
                  <div
                    class="sub-field-parent align-as-row"
                    style="width: 100%"
                  >
                    <div class="sub-field">
                      <span class="sub-sub-heading" style="font-size: 0.875rem"
                        >Inverter<br />Capacity</span
                      >
                      <span class="sub-heading" style="font-size: 1rem"
                        >{{ formatNumberInternational(withSolIC) }} kW</span
                      >
                    </div>
                    <div class="sub-field">
                      <span class="sub-sub-heading" style="font-size: 0.875rem"
                        >Battery<br />Capacity</span
                      >
                      <span class="sub-heading" style="font-size: 1rem"
                        >{{ formatNumberInternational(withSolBC) }} kWh</span
                      >
                    </div>
                  </div>
                </div>
              </div>
            </template>
          </ImageCard>
        </el-col>
        <el-col :sm="24" :lg="16">
          <div class="system-design">
            <span class="system-design-heading">System Design</span>
            <img :src="showDiagram()" class="diagram" />
          </div>
        </el-col>
        <el-col :sm="12" :lg="8">
          <div style="height: 100%">
            <img
              class="responsive-image"
              :src="generateGoogleStaticMapImage()"
            />
          </div>
        </el-col>
        <el-col :sm="24">
          <ImageCard>
            <template v-slot:footer>
              <div style="align-self: start">
                <span class="sub-heading">Loads on backup</span>
                <ul
                  class="align-as-row list-padding"
                  style="padding-top: 1rem; justify-content: normal"
                >
                  <li
                    style="padding-right: 5px"
                    v-for="load in loadsOnBackup"
                    :key="load.id"
                  >
                    {{ load.name }}
                  </li>
                </ul>
              </div>
            </template>
          </ImageCard>
        </el-col>
      </el-row>
    </div>

    <Footer
      :pageNo="3"
      @pageNumberAfterNext="pageNumberAfterNext"
      @pageNumberAfterBack="pageNumberAfterBack"
    />
  </div>
</template>

<script>
import Footer from "./footer.vue";
import Header from "./header.vue";
import ImageCard from "./reusableImgCard.vue";
import GlobalDialog from "./globalDialog.vue";
import AdjustLoads from "./adjustLoads.vue";
import NoACNoDC5k8k12k from "../assets/NoACNoDC5k8k12k.svg";
import NoACYesDC5k8k12k from "../assets/NoACYesDC5k8k12k.svg";
import NoACYesDC15k from "../assets/NoACYesDC15k.svg";
import NoACNoDC15k from "../assets/NoACNoDC15k.svg";
import { GOOGLE_API_KEY } from "@/services/api/index.js";
import { saveDataInLocalStorage, formatNumberInternational } from "@/utils.js";
import API from "@/services/api";
import { saveAs } from "file-saver";
import debounce from "debounce";

export default {
  components: {
    Footer,
    Header,
    ImageCard,
    GlobalDialog,
    AdjustLoads,
  },
  created() {
    this.initializeDataFromLS();
    console.log("initialising");
    let jsonToSend = JSON.parse(
      localStorage.getItem("jsonToSendForCalculation")
    );
    console.log(jsonToSend);
    this.performCalculation(jsonToSend);
  },
  data() {
    return {
      isLoading: false,
      inverterOptionsArray: [
        { value: "1", label: "Most Popular Option" },
        { value: "2", label: "Recommended Option" },
        { value: "3", label: "Smallest Option" },
        { value: "4", label: "Upgraded Option" },
      ],
      batteryOptionsArray: [
        { value: "1", label: "Most Popular Option" },
        { value: "2", label: "Recommended Option" },
        { value: "3", label: "Smallest Option" },
        { value: "4", label: "No Battery" },
      ],
      solarCapacity: 0,
      annualProduction: 0,
      annualSavings: 0,
      inverterCapacity: 0,
      inverterProductName: "",
      inverterSpecSheetLink: "",
      monitoringSpecSheetLink:
        "https://www.sol-ark.com/wp-content/uploads/2023/03/O900-80V-SPECSHEET-1.pdf",
      inverterQuantity: 1,
      additionalSavings: 0,
      withoutSolIC: 0,
      withoutSolBC: 0,
      withSolIC: 0,
      withSolBC: 0,
      // loadsOnBackup: [
      //   { id: 1, label: "Refrigerator", checked: false },
      //   { id: 2, label: "Laptop/ Home PC", checked: false },
      //   { id: 3, label: "Television", checked: false },
      //   { id: 4, label: "Wi-Fi Router", checked: false },
      //   { id: 5, label: "Coffee Machine", checked: false },
      //   { id: 6, label: "Microwave", checked: false },
      // ],
      loadsOnBackup: this.getLoadsOnBackup(),
      batteryCapacity: 0,
      energyBackup: "0 days & 0 hours",
      additionalSavingsWithBattery: 0,
      annualConsumption: 0,
      openSelectInverter: false,
      inverterChoice: "2",
      previousInverterChoice: "2",
      openSelectBattery: false,
      heading: "Our Recommendations",
      batteryChoice: "2",
      previousBatteryChoice: "2",
      // indoorOutdoorBattery: "1",
      batteryLocation: "Indoor",
      energyStorageFeatures: ["Heated", "California"],
      openAdjustLoads: false,
      batteryFeatures: ["Indoor", "Heated", "California"],
      co2Offset: "",
      coalBurnAvoided: "",
      equivalentForestsSaved: "",
      userInfo: JSON.parse(localStorage.getItem("userInfo")),
    };
  },
  methods: {
    batteryFieldSetting() {
      //get the jsonToSend
      //set the keys
      //set in local storage
      //call API again
      console.log(this.inverterChoice);

      if (
        this.inverterChoice === "1" ||
        this.inverterChoice === "2" ||
        this.inverterChoice === "3"
      )
        this.batteryChoice = this.inverterChoice;
      let data = JSON.parse(localStorage.getItem("jsonToSendForCalculation"));
      data["selectedBatteryType"] = this.determineStringFromNumberBattery(
        this.batteryChoice
      );
      data["selectedInverterType"] = this.determineStringFromNumberInverter(
        this.inverterChoice
      );

      localStorage.setItem("jsonToSendForCalculation", JSON.stringify(data));
      if (this.inverterChoice !== this.previousInverterChoice) {
        console.log(
          "battery change",
          this.inverterChoice,
          this.previousInverterChoice
        );
        this.previousInverterChoice = this.inverterChoice;
        this.performCalculation(data);
      }
    },
    inverterFieldSetting() {
      //get the jsonToSend
      //set the keys
      //set in local storage
      //call API again
      console.log(this.batteryChoice);

      if (
        this.batteryChoice === "1" ||
        this.batteryChoice === "2" ||
        this.batteryChoice === "3"
      )
        this.inverterChoice = this.batteryChoice;
      if (this.batteryChoice === "4") this.inverterChoice = "2";
      let data = JSON.parse(localStorage.getItem("jsonToSendForCalculation"));
      data["selectedBatteryType"] = this.determineStringFromNumberBattery(
        this.batteryChoice
      );
      data["selectedInverterType"] = this.determineStringFromNumberInverter(
        this.inverterChoice
      );

      localStorage.setItem("jsonToSendForCalculation", JSON.stringify(data));
      if (this.batteryChoice !== this.previousBatteryChoice) {
        this.previousBatteryChoice = this.batteryChoice;
        this.performCalculation(data);
      }
    },
    handleCloseAjustLoads(isUpdate) {
      //console.log(isUpdate);
      this.openAdjustLoads = false;
      this.loadsOnBackup = this.getLoadsOnBackup();

      //redo calculations after user has adjusted loads if isUpdate is true
      //If isUpdate is false, the cancel butto has been clicked, no need to hit API
      //Note that jsonToSend already has the updated list of load categories
      if (isUpdate) {
        let jsonToSend = JSON.parse(
          localStorage.getItem("jsonToSendForCalculation")
        );
        console.log("calling for calculation");
        this.performCalculation(jsonToSend);
      }
    },
    showDiagram() {
      let data = JSON.parse(localStorage.getItem("jsonToSendForCalculation"));
      let userLookingFor = data.userLookingFor;
      switch (true) {
        case this.inverterCapacity < 15 &&
          userLookingFor == "Solar with Battery":
          return NoACYesDC5k8k12k;
          break;
        case this.inverterCapacity == 15 &&
          userLookingFor == "Solar with Battery":
          return NoACYesDC15k;
          break;
        case this.inverterCapacity < 15 && userLookingFor == "Batteries Only":
          return NoACNoDC5k8k12k;
          break;
        case this.inverterCapacity == 15 && userLookingFor == "Batteries Only":
          return NoACNoDC15k;
      }
    },
    generateGoogleStaticMapImage() {
      let data = JSON.parse(localStorage.getItem("jsonToSendForCalculation"));
      let lat = data.center.lat;
      let lng = data.center.lng;
      let zoom = data.zoom;
      let mapImage = `https://maps.googleapis.com/maps/api/staticmap?center=${lat},${lng}&scale=2&zoom=${zoom}&maptype=satellite&size=1024x1024&key=${GOOGLE_API_KEY}&markers=color:red|${lat},${lng}`;
      return mapImage;
    },
    initializeDataFromLS() {
      let dataFromLS = JSON.parse(
        localStorage.getItem("jsonToSendForCalculation")
      );
      this.batteryLocation = dataFromLS["batteryLocation"];
      this.energyStorageFeatures = [...dataFromLS["energyStorageFeatures"]];
      this.batteryFeatures = [
        ...this.energyStorageFeatures,
        this.batteryLocation,
      ];
      const inverterChoice = dataFromLS["selectedInverterType"];
      const batteryChoice = dataFromLS["selectedBatteryType"];
      console.log("inverter ls", inverterChoice);
      console.log("battery ls", batteryChoice);
      this.batteryChoice = this.determineNumberFromStringBattery(batteryChoice);
      this.inverterChoice =
        this.determineNumberFromStringInverter(inverterChoice);
    },
    determineNumberFromStringBattery(type) {
      if (type === "Most Popular Option") return "1";
      if (type === "Recommended Option") return "2";
      if (type === "Smallest Option") return "3";
      if (type === "No Battery") return "4";
    },
    determineNumberFromStringInverter(type) {
      if (type === "Most Popular Option") return "1";
      if (type === "Recommended Option") return "2";
      if (type === "Smallest Option") return "3";
      if (type === "Upgraded Option") return "4";
    },
    determineStringFromNumberBattery(number) {
      if (number === "1") return "Most Popular Option";
      if (number === "2") return "Recommended Option";
      if (number === "3") return "Smallest Option";
      if (number === "4") return "No Battery";
    },
    determineStringFromNumberInverter(number) {
      if (number === "1") return "Most Popular Option";
      if (number === "2") return "Recommended Option";
      if (number === "3") return "Smallest Option";
      if (number === "4") return "Upgraded Option";
    },

    pageNumberAfterNext(pageNo) {
      this.$emit("pageNumberAfterNext", pageNo);
    },
    pageNumberAfterBack(pageNo) {
      this.$emit("pageNumberAfterBack", pageNo);
    },
    // handleChangeSolarCapacity(value) {
    //   console.log(value);
    // },
    handleChangeSolarCapacity: debounce(function (value) {
      console.log("Solar capacity changed to: ", value);
      //update local storage
      let jsonToSend = JSON.parse(
        localStorage.getItem("jsonToSendForCalculation")
      );
      jsonToSend["pv_size"] = value;
      console.log("added solar cap", jsonToSend);
      localStorage.setItem(
        "jsonToSendForCalculation",
        JSON.stringify(jsonToSend)
      );
      this.performCalculation(jsonToSend);
    }, 1000), // 500ms debounce delay, adjust as needed
    async performCalculation(data) {
      this.isLoading = true;
      const response = await API.SOLARK.FETCH_CALCULATION(data);

      console.log(response.data);
      //Make a call to a generic function to set all the dynamic or dependent fields
      this.setRecommendationFields(response.data);
      this.isLoading = false;
    },

    setRecommendationFields(calculatedObj) {
      this.batteryCapacity = Number(calculatedObj.total_size_battery).toFixed(
        2
      );
      this.energyBackup = calculatedObj.energy_backup;
      this.additionalSavingsWithBattery =
        calculatedObj.additional_savings_post_battery;
      this.annualConsumption = Number(calculatedObj.annual_consumption).toFixed(
        2
      );

      this.solarCapacity = Number(calculatedObj.pv_size).toFixed(2);
      this.annualProduction = Number(calculatedObj.annual_generation).toFixed(
        2
      );
      this.annualSavings = Number(calculatedObj.savings).toFixed(2);

      this.inverterCapacity = calculatedObj.total_size_inverter;
      this.inverterQuantity = calculatedObj.count_of_inverter;
      this.inverterProductName =
        calculatedObj.suggested_inverter_details[0].fields.Manufacturer.toUpperCase() +
        " " +
        calculatedObj.suggested_inverter_details[0].fields.Make.toUpperCase();
      this.inverterSpecSheetLink =
        calculatedObj.suggested_inverter_details[0].fields.Source_link;

      this.additionalSavings = calculatedObj.additional_savings;
      this.withoutSolIC = Number(
        calculatedObj.without_solark.total_size_inverter
      ).toFixed(2);
      this.withoutSolBC = Number(
        calculatedObj.without_solark.total_size_battery
      ).toFixed(2);
      this.withSolIC = Number(
        calculatedObj.with_solark.total_size_inverter_withSolark
      ).toFixed(2);
      this.withSolBC = Number(
        calculatedObj.with_solark.total_size_battery_withSolark
      ).toFixed(2);

      (this.co2Offset = calculatedObj.co2_offset),
        (this.coalBurnAvoided = calculatedObj.coal_burn_avoided);
      this.equivalentForestsSaved = calculatedObj.acres_of_forest;
      //set "upgradedOptionInverterTypeValue" to the next(inverterCapacity)
      //Supposed to be only if the user selected Upgraded Option in the inverter box
      //How to distinguis call??
      //set in Local storage
      let jsonToSend = JSON.parse(
        localStorage.getItem("jsonToSendForCalculation")
      );
      jsonToSend["upgradedOptionInverterTypeValue"] = this.getNextInverter(
        this.inverterCapacity
      );
      localStorage.setItem(
        "jsonToSendForCalculation",
        JSON.stringify(jsonToSend)
      );
    },
    getNextInverter(value) {
      if (value === 5) return 8;
      if (value === 8) return 12;
      if (value === 12) return 15;
    },
    filteredInverterOptionsArray() {
      if (this.inverterCapacity === 15) {
        // Filter out the "Upgraded Option" if inverterCapacity is 15
        return this.inverterOptionsArray.filter(
          (option) => option.value !== "4"
        );
      } else {
        return this.inverterOptionsArray;
      }
    },
    downloadFile(url) {
      let fileUrl = url;
      let splitArray = fileUrl.split("?")[0].split("/");
      let fileName = splitArray[splitArray.length - 1];
      saveAs(fileUrl, fileName);
    },

    handleClickSelectInverter() {
      this.openSelectInverter = true;
      console.log("open select inverter dialog");
    },
    handleClickSelectBattery() {
      this.openSelectBattery = true;
      console.log("open select inverter dialog");
    },
    handleClickAdjustLoads() {
      this.openAdjustLoads = true;
      console.log("open adjust loads dialog");
    },
    getLoadsOnBackup() {
      let jsonToSend = JSON.parse(
        localStorage.getItem("jsonToSendForCalculation")
      );

      return jsonToSend["final_critical_list"];
    },
    saveDataInLocalStorage,
    formatNumberInternational,
    async fetchSelectedBatteries(selectedBatteryName) {
      let response = await API.SOLARK.FETCH_SELECTED_BATTERIES_LIST(
        selectedBatteryName
      );
      let urls = this.getAllUrlsToDownload(response.data);
      this.downloadPDFOfgivenURLS(urls);
    },
    getAllUrlsToDownload(list) {
      let urls = [];
      for (let item of list) {
        if (item["link"]) {
          urls.push(item["link"]);
        }
      }
      return urls;
    },
    downloadPDFOfgivenURLS(urls) {
      for (let fileUrl of urls) {
        let splitArray = fileUrl.split("?")[0].split("/");
        let fileName = splitArray[splitArray.length - 1];
        saveAs(fileUrl, fileName);
      }
    },
    recommendedPartners() {
      let outdoorArray = ["Homegrid"];
      let indoorArray = ["Homegrid", "Endurenergy", "Pytes", "Storz Power"];
      let heatedArray = ["Homegrid"];
      let californiaArray = ["Homegrid", "Pytes"];
      let intersection = ["Homegrid", "Endurenergy", "Pytes", "Storz Power"];
      if (this.batteryFeatures.includes("Outdoor")) {
        intersection = intersection.filter((item) =>
          outdoorArray.includes(item)
        );
      }
      if (this.batteryFeatures.includes("Indoor")) {
        intersection = intersection.filter((item) =>
          indoorArray.includes(item)
        );
      }
      if (this.batteryFeatures.includes("Heated")) {
        intersection = intersection.filter((item) =>
          heatedArray.includes(item)
        );
      }
      if (this.batteryFeatures.includes("California")) {
        intersection = intersection.filter((item) =>
          californiaArray.includes(item)
        );
      }
      console.log("Intersection array is", intersection);
      return intersection;
    },
  },
  computed: {
    extraInfoForSolarkReport() {
      // console.log(" this.recommendedPartners", this.recommendedPartners());
      let obj = {
        inverterProductName: this.inverterProductName,
        inverterCapacity: this.inverterCapacity,
        inverterQuantity: this.inverterQuantity,
        solarCapacity: this.solarCapacity,
        annualProduction: this.annualProduction,
        annualSavings: this.annualSavings,
        batteryCapacity: this.batteryCapacity,
        batteryFeatures: [...this.batteryFeatures],
        // "recommendedPartners": [... this.recommendedPartners],
        recommendedPartners: this.recommendedPartners(),
        additionalSavings: this.additionalSavings,
        withoutSolIC: this.withoutSolIC,
        withoutSolBC: this.withoutSolBC,
        withSolIC: this.withSolIC,
        withSolBC: this.withSolBC,
        userLookingFor: this.userLookingFor,
        co2Offset: this.co2Offset,
        coalBurnAvoided: this.coalBurnAvoided,
        equivalentForestsSaved: this.equivalentForestsSaved,
        userInfo: JSON.parse(localStorage.getItem("userInfo")),
        energyBackup: this.energyBackup,
      };
      return obj;
    },
  },
  mounted() {
    this.showDiagram();
  },
  watch: {},
};
</script>

<style scoped>
* {
  font-family: "Poppins";
}
.container {
  width: 100%;
  min-height: calc(100vh - 96px);
  padding: 1.5rem 2rem;
  padding-bottom: 120px;
}
.rec-body {
  font-family: Poppins;
  line-height: normal;
  font-style: normal;
  font-size: 1rem;

  margin: 2rem 0;
}

.field {
  margin-bottom: 1rem;
}

.sub-heading {
  font-weight: 600;
  font-size: 1.25rem;
  color: var(--greyscale-off-black, #0d0d0d);
  font-family: Poppins;
}

.sub-sub-heading {
  color: var(--grey-grey-54, #808080);
  font-size: 1rem;
  font-weight: 600;
}

.field-value {
  color: var(--black, #222);
  font-size: 1rem;
  font-weight: 400;
}

.el-radio-group {
  display: flex;
  flex-flow: column wrap;
  justify-content: space-between;
  align-items: flex-start;
}
.link {
  font-weight: 600;
  color: var(--brand-blue, #006aa9);
}

.link:hover {
  cursor: pointer;
}

.link-with-underline {
  color: var(--blue-blue-54, #006eaf);
  font-weight: 600;
  text-decoration-line: underline;
  cursor: pointer;
}
.right-content {
  margin-left: min(2rem, 20%);
}

.card-footer {
  display: flex;
  gap: 5px;
  width: 100%;
}

.left-box-border {
  border-left: 1px solid var(--grey-grey-75, #bfbfbf);
  padding-left: 1rem;
}

.bottom-box-border {
  border-bottom: 1px solid var(--grey-grey-75, #bfbfbf);
}

.sub-field {
  display: flex;
  flex-direction: column;
}

.upper-grid {
  display: flex;
  flex-flow: row wrap;
  justify-content: space-evenly;
}
.responsive-image {
  border-radius: 8px;
  width: 100%; /* Set the width to 100% */
  height: auto; /* Maintain aspect ratio */
  max-width: 100%; /* Optional: To prevent the image from exceeding its original size */
}

.blue-background {
  background-color: #e5f6ff;
  display: flex;
  flex-flow: column;
  padding: 1.5rem;
  height: 100%;
}

.grey-text {
  font-weight: 600;
  color: var(--grey-grey-25, #404040);
}

::v-deep .el-button--primary {
  background: var(--blue-blue-54, #006eaf);
  border-radius: 4px;
  padding: 4px 1rem;
}

.field :deep() .el-button > span {
  font-family: "Poppins";
  color: var(--greyscale-off-white, #f2f2f2);
  font-size: 0.875rem;
  font-style: normal;
  font-weight: 600;
  line-height: 28px; /* 200% */
}

.system-design-heading {
  color: var(--grey-grey-5, #0d0d0d);
  font-size: 1.75rem;
  font-style: normal;
  font-weight: 600;
  line-height: 2.45rem;
  letter-spacing: 1.124px;
}

.system-design {
  display: flex;
  height: 100%;
  flex-flow: column;
  justify-content: space-between;
}

.list-padding {
  padding-left: 1.25rem;
}

.vertical-gap .el-col {
  margin-bottom: 1.25rem; /* Adjust the value as needed */
}

.inverter-selection {
  display: flex;
  flex-flow: row wrap;
  justify-content: space-around;
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

.align-as-row li {
  margin-right: 20px;
}

:deep() .el-radio__label {
  font-size: 16px;
  font-family: "poppins";
  color: #0d0d0d;
}

:deep() .el-radio__inner {
  width: 24px;
  height: 24px;
  border: 1px solid #bfbfbf;
}
:deep() .el-radio__input.is-checked + .el-radio__label {
  color: #0d0d0d;
}

.container :deep() .el-radio__inner::after {
  background-color: #f7941d;
  width: 12px;
  height: 12px;
}
:deep() .el-radio__input.is-checked .el-radio__inner {
  border-color: #f7941d;
  background: #fff;
  border-width: 3px;
}

:deep() .el-checkbox__inner {
  width: 18px;
  height: 18px;
  border: 1px solid #bfbfbf;
}
:deep() .el-checkbox__label {
  font-size: 1rem;
  font-family: "Poppins";
}

.inverter-selection :deep() .el-checkbox__inner::after {
  border: 2px solid #fff;
  border-left: 0;
  border-top: 0;
  height: 8px;
  left: 5px;
  top: 2px;
  width: 3px;
}

.inverter-selection
  :deep()
  .el-checkbox__input.is-checked
  + .el-checkbox__label {
  color: #0d0d0d;
}

.inverter-selection :deep() .el-checkbox__input.is-checked .el-checkbox__inner {
  border-color: #f7941d;
  background-color: #f7941d;
}

.bottom-margin-16 {
  margin-bottom: 1rem;
}

.bottom-margin-8 {
  margin-bottom: 0.5rem;
}

::v-deep .el-input-number {
  width: 7.5rem;
}
</style>
