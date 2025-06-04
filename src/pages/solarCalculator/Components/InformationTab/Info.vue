<template>
  <div>
    <div v-for="tabsData in tabsData">
      <div v-if="tabsData.label === 'Appliances'">
        <p class="appliances_title">Appliances</p>

        <hr class="hrClass" />

        <div class="main_appliances_container">
          <div class="appliances_details_container">
            <div class="appliances_details">
              Total Load:
              <span class="appliances_values"
                >{{ totalLoad }} W</span
              >
            </div>
          </div>

          <div class="appliances_table" v-if="!isMobile">
            <tableView :tableData="tableData">
              <template #name="{ row, column }">
                <el-select
                  v-model="row[column.id]"
                  placeholder="Select Appliances"
                  v-if="row.is_new"
                  @change="handleAppliancesSelect(row, column)"
                >
                  <el-option
                    v-for="item in appliancesList"
                    :key="item.label"
                    :label="item.label"
                    :value="item.label"
                  >
                  </el-option>
                </el-select>

                <p class="appliances_names" v-if="!row.is_new">
                  {{ row[column.id] }}
                </p>
              </template>

              <template #textbox="{ row, column }">
                <div class="watt_appliances">
                  <input
                    placeholder="watt"
                    type="number"
                    v-model="row[column.id]"
                    @input="handleAppliancesWatt(row, column)"
                    class="appliances_watt_value"
                    @blur.prevent="recalculateTableData(row)"
                  />
                </div>
              </template>

              <template #number_input="{ row, column }">
                <div class="appliances_number_input">
                  <div class="input_number">
                    <img
                      :src="
                        handleAppliancesDecrementButton(row, column, 'decrease')
                      "
                      alt="image"
                      @click="handleAppliancesClicks(row, column, 'decrease')"
                      :class="
                        handleAppliancesButtonStyles(row, column, 'decrease')
                      "
                    />
                    <div class="appliances_input">
                      <input
                        type="number"
                        v-model="row[column.id]"
                        class="appliances_input_value"
                        @input="handleAppliancesButtonInput(row, column)"
                        @blur.prevent="handleAppliancesButtonBlur(row, column)"
                      />
                    </div>
                    <img
                      :src="
                        handleAppliancesIncrementButton(row, column, 'increase')
                      "
                      alt="image"
                      @click="handleAppliancesClicks(row, column, 'increase')"
                      :class="
                        handleAppliancesButtonStyles(row, column, 'increase')
                      "
                    />
                  </div>
                </div>
              </template>

              <template #edit_application="{ row, column }">
                <div :class="appliancesContainerStyles(row, column)">
                  <div v-if="row.is_new" @click="confirmDataTable(row, column)">
                    <p :style="handleTickColor(row, column)">✓</p>
                  </div>
                  <img
                    src="../../assets/deleteIcon.svg"
                    alt=""
                    style="cursor: pointer"
                    @click="handleTableData(row, column)"
                  />
                </div>
              </template>
            </tableView>
          </div>

          <div v-else class="collapse_container">
            <el-collapse >
              <el-collapse-item v-for="(row,index) in tableData" :key="index" :name="index">
    <template #title>
      <div style="display: flex;justify-content: space-between;align-items: center;width: 100%;padding: 16px;">
      <p v-if="row.is_new" style="font-weight: 700;">{{ 'Add New Appliance' }}</p>
      <p v-else  style="font-weight: 700;">{{ row.name }}</p>
      <p class="btn_container" >
                  <div v-if="row.is_new" @click="confirmDataTable(row, column)">
                    <p :style="handleTickColor(row, column)">✓</p>
                  </div>
                  <img
                    src="../../assets/deleteIcon.svg"
                    alt=""
                    style="cursor: pointer;padding-left: 16px;"
                    @click="handleTableData(row, column)"
                  />
                </p>
              </div>
    </template>

<div class="collaps-content" v-for="(column,index) in applianceLabel" :key="index">

  <div class="collaps-content-label" v-if="column.type!=='name'">{{ column.title }}</div>
  <div :class=" column.type=='name'?'collaps-content-name' :'collaps-content-value'">
    <div v-if="column.type=='name'">
      <el-select
                  v-model="row[column.id]"
                  placeholder="Select Appliances"
                  v-if="row.is_new"
                  @change="handleAppliancesSelect(row, column)"
                >
                  <el-option
                    v-for="item in appliancesList"
                    :key="item.label"
                    :label="item.label"
                    :value="item.label"
                  >
                  </el-option>
                </el-select>
              </div>
                <div class="watt_appliances" v-if="column.type=='textbox'" style="margin-right: 27px;">
                  <input
                    placeholder="watt"
                    type="number"
                    v-model="row[column.id]"
                    @input="handleAppliancesWatt(row, column)"
                    class="appliances_watt_value"
                    @blur.prevent="recalculateTableData(row)"
                  />
                </div>

         
                <div class="appliances_number_input" v-if="column.type=='number_input'">
                  <div class="input_number">
                    <img
                      :src="
                        handleAppliancesDecrementButton(row, column, 'decrease')
                      "
                      alt="image"
                      @click="handleAppliancesClicks(row, column, 'decrease')"
                      :class="
                        handleAppliancesButtonStyles(row, column, 'decrease')
                      "
                    />
                    <div class="appliances_input">
                      <input
                        type="number"
                        v-model="row[column.id]"
                        class="appliances_input_value"
                        @input="handleAppliancesButtonInput(row, column)"
                        @blur.prevent="handleAppliancesButtonBlur(row, column)"
                      />
                    </div>
                    <img
                      :src="
                        handleAppliancesIncrementButton(row, column, 'increase')
                      "
                      alt="image"
                      @click="handleAppliancesClicks(row, column, 'increase')"
                      :class="
                        handleAppliancesButtonStyles(row, column, 'increase')
                      "
                    />
                  </div>
                </div>

  </div>

</div>
  </el-collapse-item>

            </el-collapse>
          </div>

          <div class="appliances_add_button">
            <button
              class="appliances_button"
              @click="addAppliancesData"
              :style="handleAppliancesButtonColor()"
            >
              <span style="font-size: x-large">+</span> Add New Appliances
            </button>
          </div>
        </div>
      </div>

      <div v-if="tabsData.label === 'Our Recommendation'">
        <Detailed
          :cardData="tabsData"
          :heading="'Our recommendation'"
          @updateCalculatorsData="updateCalculatorsData"
        />

        <div style="margin-bottom: 30px">
          <p class="info_note">
            *Above plant size is only indicative and derived based on your
            inputs.
          </p>
          <p class="info_note">
            The actual plant size capacity will be based on available rooftop
            area.
          </p>
          <p class="info_note">
            If the area available is more than the recommended area required,
            higher capacities can be installed and vice-versa.
          </p>
        </div>
      </div>

      <div v-if="showContent">
        <div v-if="tabsData.label === 'Savings and Payback From Solar'">
          <Detailed :cardData="tabsData" :heading="'Our recommendation'" />
        </div>

        <div v-if="tabsData.label === 'Title'">
          <Detailed :cardData="tabsData" :heading="'Our recommendation'" />
        </div>

        <div v-if="tabsData.label === 'Configuration/Item Description'">
          <Detailed
            :cardData="tabsData"
            :heading="'Our recommendation'"
            :info_style="'width'"
          />
        </div>

        <div v-if="tabsData.question_type === 'grey_card'">
          <PriceContainer :data="tabsData" />
        </div>

        <Contribution
          :newData="tabsData"
          v-if="tabsData.question_type === 'grey_image_card'"
        />

        <div v-if="tabsData.question_type === 'logo'">
          <LogoCard />
        </div>
      </div>
      <div v-if="tabsData.question_type === 'blue_card' && !showContent">
        <BlueCard
          :data="tabsData"
          @tabsChanges="tabsChanges"
          @updateData="updateData()"
        />
      </div>
    </div>

    <div class="blueContainer" v-if="isCalculateRoi">
      <button class="blueButton" @click="handleRoi">
        Check your ROI, Savings & EMI
      </button>
    </div>

    <div class="details_card" v-if="showContent">
      <div class="cardWrapper">
        <p class="contact_info">
          If you have any queries, please feel free to call us on this toll-free
          number.
        </p>
        <div class="contact_card">
          <div class="contact_wrapper">
            <div class="contact_left">
              <img src="../../assets/phone.svg" alt="" />
            </div>
            <div class="contact_right">
              <p class="contact_details">CALL US (TOLL FREE)</p>
              <p class="contact_details">1800 25 77777</p>
            </div>
          </div>
        </div>
      </div>
    </div>

    <!-- Basic Information PopUp //////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////// -->

    <div class="dialogCustom">
      <div
        style="border-radius: 8px; display: flex"
        v-for="formTemplate in data.sections"
      >
        <el-dialog
          v-model="dialogVisible"
          width="34%"
          :close-on-click-modal="false"
          ><template #header="{ close, titleId, titleClass }">
            <div
              style="
                display: flex;
                align-items: center;
                justify-content: space-between;
                position: sticky;
              "
              class="fixed-header"
            >
              <h4 :id="titleId" :class="titleClass" class="my-header">
                {{ formTemplate.title }}
              </h4>
              <img
                @click="handleLeadCaptureClose()"
                src="../../assets/close.svg"
                style="height: 20px; width: 20px; cursor: pointer"
              />
            </div>
          </template>
          <div>
            <div
              style="
                display: flex;
                flex-direction: column;
                gap: 10px;
                padding-left: 20px;
                padding-right: 20px;

                padding-top: 10px;
              "
            >
              <span class="dialog_title">{{ formTemplate.description }}</span>
              <div v-for="fields in formTemplate.fields">
                <div
                  class="productTypes"
                  v-if="fields.question_type === 'multiple_choice'"
                >
                  <p class="dialog_title">
                    {{ fields.label }}
                    <span
                      class="requiredClass"
                      v-if="fields.is_required === true"
                      >*</span
                    >
                  </p>
                  <div class="categoryInput">
                    <el-radio-group
                      v-model="fields.additional_info.default_option"
                      @change="
                        updateCalculatorData(
                          fields.additional_info.default_option,
                          fields.label,
                          fields.question_type,
                          fields
                        )
                      "
                    >
                      <el-radio
                        :label="option.option_text"
                        class="categoryOptions"
                        v-for="option in fields.options"
                        :key="option.option_text"
                      >
                        {{ option.option_text }}
                      </el-radio>
                      </el-radio-group>
                        <div class="input_containers" v-for="option in fields.options" :key="option.option_text">
                          <div  v-if="option.sub_options && fields.additional_info.default_option =='Company/Society/Institution'"  v-for="subOption in option.sub_options" :key="subOption.label">
                            <p class="dialog_title">
                              {{ subOption.label }}<span
                                class="requiredClass"
                                v-if="(subOption.is_required = true)"
                                >*</span
                              >
                            </p>
                            <el-input
                              :placeholder="getPlaceHolder(subOption.label)"
                              :class="getInputStyles(subOption.label)"
                              v-model="subOption.additional_info.default_option"  
                              style="color: black; font-size: 16px"
                              @input="updateCalculatorData(subOption.additional_info.default_option,
                             subOption.label,
                             subOption.question_type,
                            subOption)"
                            >
                            </el-input>
                          </div>
                        </div>

                    <div
                      v-if="fields.additional_info.default_option === 'Yes'"
                      v-for="data in fields.options"
                      class="productTypes"
                    >
                      <div v-for="options in data.sub_options">
                        <p class="dialog_title">{{ options.label }}</p>
                        <el-select
                          v-model="options.additional_info.default_option"
                          placeholder="Select the Timeline"
                          style="margin-top: 5px; width: 100%"
                          @change="updateAnswerApi(fields)"
                        >
                          <el-option
                            v-for="item in options.options"
                            :label="item.option_text"
                            :value="item.option_text"
                          >
                          </el-option>
                        </el-select>
                      </div>
                    </div>
                  </div>
                </div>

                <div
                  v-if="fields.question_type === 'dropdown'"
                  class="dropdownContainer"
                >
                  <p class="dialog_title">{{ fields.label }}</p>

                  <el-select
                    v-model="fields.additional_info.default_option"
                    placeholder="Select the Timeline"
                    style="margin-top: 10px; width: 100%"
                    @change="
                      updateCalculatorData(
                        fields.additional_info.default_option,
                        fields.label,
                        fields.question_type,
                        fields
                      )
                    "
                  >
                    <el-option
                      v-for="item in fields.options"
                      :label="item.option_text"
                      :value="item.option_text"
                    >
                    </el-option>
                  </el-select>
                </div>

                <div v-if="fields.question_type === 'file_upload'">
                  <p class="dialog_title">
                    {{ fields.label }}
                  </p>
                  <div
                    v-if="!uploadedFile.file_name"
                    class="file_upload_card"
                    @click="openUploadDialog"
                  >
                    <img src="../../assets/upload.svg" alt="" />
                    <p>Upload File</p>
                    <input
                      id="fileInput"
                      type="file"
                      ref="fileInput"
                      :multiple="false"
                      @change="fileUpload($event, fields)"
                      class="file_input"
                      accept="image/*,.pdf"
                    />
                  </div>

                  <div v-if="imageUrl">
                    <img :src="imageUrl" alt="" />
                  </div>

                  <div class="img_container" v-if="uploadedFile.file_name">
                    <img src="../../assets/img.svg" alt="" />
                    <el-tooltip
                      class="item"
                      effect="dark"
                      :content="uploadedFile.file_info"
                      placement="top-start"
                    >
                      <p
                        style="
                          width: 90%;
                          overflow: hidden;
                          white-space: nowrap;
                          overflow: hidden;
                          text-overflow: ellipsis;
                          cursor: pointer;
                          text-align: center;
                        "
                      >
                        {{ uploadedFile.file_info }}
                      </p>
                    </el-tooltip>
                    <img
                      src="../../assets/deleteIcon.svg"
                      alt=""
                      @click="deleteUploadedFiles"
                      style="cursor: pointer"
                    />
                  </div>
                </div>

                <div
                  v-if="
                    fields.label === 'Recommended Solar Capacity' &&
                    fields.photos_videos_required !== true
                  "
                  class="input_containers"
                >
                  <p class="dialog_title">
                    {{ fields.label }}
                  </p>

                  <div
                    style="display: flex; align-items: center"
                    class="input_capacity"
                  >
                    <input
                      v-model="calculatorData.dc_size"
                      disabled
                      placeholder="Please input your System size."
                      class="capacity_input"
                    />
                    <p style="margin-left: auto; color: #ccc">kW</p>
                  </div>
                </div>

                <div
                  v-if="
                    (fields.question_type === 'short_answer' ||
                      fields.question_type === 'number') &&
                    fields.photos_videos_required !== true &&
                    fields.label !== 'Pincode' &&
                    fields.label !== 'Recommended Solar Capacity'
                  "
                  class="input_containers"
                >
                  <p class="dialog_title">
                    {{ fields.label }}
                    <span
                      class="requiredClass"
                      v-if="(fields.is_required = true)"
                      >*</span
                    >
                  </p>
                  <el-input
                    :placeholder="getPlaceHolder(fields.label)"
                    v-model="fields.additional_info.default_option"
                    :type="fields.label === 'Mobile Number' ? 'number' : 'text'"
                    :maxlength="fields.label === 'Mobile Number' ? 10 : 100"
                    @focus="handleFocus(fields.label)"
                    @blur.prevent="
                      handleValidation(
                        fields.additional_info.default_option,
                        fields.label
                      )
                    "
                    :class="getInputStyles(fields.label)"
                    @input="
                      updateCalculatorData(
                        fields.additional_info.default_option,
                        fields.label,
                        fields.question_type,
                        fields
                      )
                    "
                    @keydown="preventSpecialCharacters(fields.label, $event)"
                    style="color: black; font-size: 16px"
                  >
                  </el-input>

                  <!-- <div v-if="fields.label === 'Name'">hello</div> -->
                  <div
                    v-if="fields.label === 'Email' && email_error === true"
                    class="error_field"
                  >
                    Input valid email ID
                  </div>
                  <div
                    v-if="
                      fields.label === 'Mobile Number' && mob_no_error === true
                    "
                    class="error_field"
                  >
                    Input valid mobile number.
                  </div>
                  <div
                    v-if="fields.label === 'Name' && name_error === true"
                    class="error_field"
                  >
                    Input valid name
                  </div>
                </div>

                <div
                  v-if="
                    fields.label === 'Pincode' &&
                    fields.photos_videos_required !== true
                  "
                  class="input_containers"
                >
                  <p class="dialog_title">
                    {{ fields.label }}
                  </p>

                  <div
                    style="display: flex; align-items: center"
                    class="input_capacity"
                  >
                    <input
                      v-model="pincode"
                      disabled
                      placeholder="Please input your System size."
                      class="capacity_input"
                    />
                  </div>
                </div>
              </div>
            </div>
            <div class="check_box" style="display: flex; align-items: center">
              <el-checkbox
                v-model="readAgreement"
                class="custom-checkbox"
              ></el-checkbox>
              <span style="margin-left: 10px" color="black">
                I have read and agree to
                <span>
                  <span
                    style="
                      font-weight: bold;
                      text-decoration: underline;
                      cursor: pointer;
                      margin-left: 2px;
                      color: black;
                    "
                    @click.stop="getTerms"
                    >Terms & Conditions</span
                  >. Sign me up for updates.</span
                >
              </span>
            </div>
            <div
              class="Verification"
              style="position: sticky; bottom: 0; padding: 10px"
            >
              <el-button
                :class="buttonStyles()"
                :disabled="buttonDisabled()"
                @click="verifyDetails"
                style="text-transform: none"
              >
                Verify Your Number
              </el-button>
            </div>
          </div>
        </el-dialog>
      </div>
    </div>

    <div class="dialogVerification" style="border-radius: 8px; display: flex">
      <el-dialog
        v-model="verificationDialog"
        width="37%"
        :close-on-click-modal="false"
      >
        <template #header="{ close, titleId, titleClass }">
          <div
            style="
              display: flex;
              align-items: center;
              justify-content: space-between;
            "
          >
            <h4 :id="titleId" :class="titleClass" class="my-header">
              Verify OTP
            </h4>
            <img
              @click="close()"
              src="../../assets/close.svg"
              style="height: 20px; width: 20px; cursor: pointer"
            />
          </div>
        </template>
        <div
          style="
            display: flex;
            flex-direction: column;
            gap: 20px;
            align-items: center;
            justify-content: center;
            margin-top: 10px;
          "
        >
          <span class="verifyHeader">
            Enter the 4 digit OTP sent to your mobile number.</span
          >

          <div class="pinInputContainer" ref="pinContainer">
            <input
              v-for="n in otpProps.length"
              @input="(e) => handleOtpKey(e, n - 1)"
              type="text"
              :key="n"
              v-model="optArray[n - 1]"
              maxlength="1"
              class="pinInput"
            />
          </div>

          <p class="otp_not_received">Didn't receive an OTP?</p>
          <div style="display: flex; align-items: center; gap: 10px">
            <p
              style="text-decoration: underline"
              :class="timer > 0 ? 'otp_send_disabled' : 'otp_send'"
              @click="resendOtp()"
              v-if="timer === 0"
            >
              Resend OTP
            </p>
            <span v-if="timer > 0" style="color: #777; text-decoration: none"
              >Time Remaining: {{ timer }} <span v-if="timer > 1">secs</span>
              <span v-else>sec</span></span
            >
          </div>
        </div>
        <div
          class="veri_button"
          style="display: flex; align-items: center; justify-content: center"
        >
          <button
            type="button"
            :disabled="handleButtonDisabled()"
            :class="handleVerifyStyles()"
            style="
              height: 7vh;
              display: flex;
              align-items: center;
              justify-content: center;
              text-transform: none;
            "
            @click="verifyOtp"
          >
            <p class="verify_received"></p>
            Verify
          </button>
        </div>
      </el-dialog>
    </div>
    <div class="loading_popup">
      <el-dialog
        v-model="loading"
        width="30%"
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
            src="../../assets/giphy.gif"
          />
          <p>Sending OTP To Your Mobile Number</p>
        </div>
      </el-dialog>
    </div>
  </div>
</template>

<script setup>
import { ref, reactive, onMounted, watch, defineExpose,onBeforeUnmount,computed} from "vue";
import debounce from "debounce";
import Graph from "../../graph.vue";
import Contribution from "./Contribution.vue";
import { v4 } from "uuid";
import API from "../../../../services/api";
import Detailed from "./Detailed.vue";
import DetailtedGraphs from "./DetailtedGraphs.vue";
import BlueCard from "./BlueCard.vue";
import PriceContainer from "./PriceContainer.vue";
import { uploadFileToBlob } from "@/utils.js";
import { sasToken } from "../../../../services/api/index";
import { storageAccountName } from "../../../../services/api/index";
import LogoCard from "./LogoCard.vue";
import tableView from "./tableView.vue";
import { solarCalculatorStore } from "../../../store/solarCalculator";
import { column } from "element-plus/es/components/table-v2/src/common";
import addButton from "../../assets/addButton.svg";
import addDisabled from "../../assets/add_disable.svg";
import subsButton from "../../assets/substract.svg";
import subsDisabled from "../../assets/substract_disabled.svg";
import { SOLAR_CALCULATOR_ID } from "../../../../constants";

const props = defineProps({
  tabsData: Array,
});

const uploadUrl = `https://${storageAccountName}.blob.core.windows.net/?${sasToken}`;

const emits = defineEmits(["tabChanges, calculateData"]);
const otpProps = reactive({
  length: 4,
});
const store = solarCalculatorStore();
const calculatorData = store.calculatorData;

const newAppliancesAdded = ref(false);

const optArray = ref([]);
const data = ref({});
const loading = ref(false);
const uploadedFile = ref({});
const name_error = ref(false);
const email_error = ref(false);
const mob_no_error = ref(false);
const imageUrl = ref("");
const fileInput = ref(null);
const shouldCallFinancialApi = ref(false);
const outageHoursApiCalling = ref(false);
// const morning_outage = ref(calculatorData.morning_outage_hours);
// const evening_outage = ref(calculatorData.night_outage_hours);
const verificationDialog = ref(false);
const dialogVisible = ref(false);
const showContent = ref(false);
const isCalculateRoi = ref(true);
const eveningOutageHours = ref(null);
const pinContainer = ref();
const pincode = ref(calculatorData.pin_code);
const readAgreement = ref(false);
const totalAppliancesConsumptionData = ref(0.22);
const totalBackupPower = ref(0);
const totalLoad = ref(0);
const totalBackupEnergy = ref(0);
const add = ref(addButton);
const subs = ref(subsButton);
const addDisabledImg = ref(addDisabled);
const subsDisabledImg = ref(subsDisabled);
const timer = ref(0);
const screenWidth=ref(window.innerWidth);

const applianceLabel=ref([

  {
    id: "name",
    title: "Application Name",
    type: "name",
    width: 200,
  },
  {
    id: "quantity",
    title: "Quantity",
    type: "number_input",
    width: 220,
  },
  {
    id: "default_load_kw",
    title: "Watt (w)",
    type: "textbox",
    width: 170,
  },
  {
    id: "operating_hour_morning",
    title: "Working Hours (10AM-3PM)",
    type: "number_input",
    width: 200,
  },

  {
    id: "operating_hour_evening",
    title: "Working Hours (3PM-10AM)",
    type: "number_input",
    width: 200,
  },

  {
    id: "edit_application",
    title: "",
    type: "edit_application",
    width: 90,
  },
])

const handleAppliancesButtonColor = () => {
  if (newAppliancesAdded.value === false) {
    return {
      color: "#184d93",
    };
  } else {
    return {
      color: "#ccc",
    };
  }
};

const tableData = ref([

  {
    id: 1,
    name: "Lights(CFL)",
    quantity: 1,
    default_load_kw: 30,
    operating_hour_morning: 1,
    operating_hour_evening: 1,
    is_new: false,
  },
  {
    id: 2,
    name: "Lights(LED)",
    quantity: 1,
    default_load_kw: 10,
    operating_hour_morning: 1,
    operating_hour_evening: 1,
    is_new: false,
  },
  {
    id: 3,
    name: "Fan",
    quantity: 1,
    default_load_kw: 60,
    operating_hour_morning: 1,
    operating_hour_evening: 1,
    is_new: false,
  },
  {
    id: 4,
    name: "Television",
    quantity: 1,
    default_load_kw: 120,
    operating_hour_morning: 1,
    operating_hour_evening: 1,
    is_new: false,
  },
]);
const appliancesList = ref([
  { label: "Desktop/Laptop" },
  { label: "Mixer/Grinder" },
  { label: "Refrigerator" },
  { label: "Air Conditioner" },
  { label: "1HP Pump" },
  { label: "Iron" },
  { label: "Washing Machine" },
]);

const applicationListValueSelect = ref([
  {
    name: "Lights(CFL)",
    quantity: 1,
    default_load_kw: 30,
    operating_hour_morning: 1,
    operating_hour_evening: 1,
  },
  {
    name: "Lights(LED)",
    quantity: 1,
    default_load_kw: 10,
    operating_hour_morning: 1,
    operating_hour_evening: 1,
  },
  {
    name: "Fan",
    quantity: 1,
    default_load_kw: 60,
    operating_hour_morning: 1,
    operating_hour_evening: 1,
  },
  {
    name: "Television",
    quantity: 1,
    default_load_kw: 120,
    operating_hour_morning: 1,
    operating_hour_evening: 1,
  },
  {
    name: "Desktop/Laptop",
    quantity: 1,
    default_load_kw: 200,
    operating_hour_morning: 1,
    operating_hour_evening: 1,
  },
  {
    name: "Mixer/Grinder",
    quantity: 1,
    default_load_kw: 300,
    operating_hour_morning: 1,
    operating_hour_evening: 1,
  },
  {
    name: "Refrigerator",
    quantity: 1,
    default_load_kw: 350,
    operating_hour_morning: 1,
    operating_hour_evening: 1,
  },
  {
    name: "Air Conditioner",
    quantity: 1,
    default_load_kw: 1500,
    operating_hour_morning: 1,
    operating_hour_evening: 1,
  },
  {
    name: "1HP Pump",
    quantity: 1,
    default_load_kw: 750,
    operating_hour_morning: 1,
    operating_hour_evening: 1,
  },
  {
    name: "Iron",
    quantity: 1,
    default_load_kw: 1000,
    operating_hour_morning: 1,
    operating_hour_evening: 1,
  },
  {
    name: "Washing Machine",
    quantity: 1,
    default_load_kw: 750,
    operating_hour_morning: 1,
    operating_hour_evening: 1,
  },
]);

const leadCaptureTemplate = ref({});

const video_img = "https://dev.arka360.com/assets/multimedia-626a4f3b.svg";

const setTimerValue = () => {
  timer.value = 60;
  const interval = setInterval(() => {
    if (timer.value > 0) {
      timer.value--;
    } else {
      clearInterval(interval);
    }
  }, 1000);
};

const tabsChanges = debounce(() => {
  emits("tabChanges");
}, 1000);

const handleTickColor = (row, column) => {
  if (row.name === "") {
    return {
      color: "#ccc",
      fontSize: "larger",
      cursor: "pointer",
    };
  } else {
    return {
      color: "green",
      fontSize: "larger",
      cursor: "pointer",
    };
  }
};

const appliancesContainerStyles = (row, column) => {
  if (row.is_new) {
    return "edit_data_actions";
  }
  return "edit_data";
};

const confirmDataTable = (row, column) => {
  if (row.name == "Air Conditioner") {
    store.UPDATE_CALCULATOR_DATA(true, "ac");
  }
  if (row.name === "") {
    return;
  } else {
    const newApplicationList = appliancesList.value.filter((item) => {
      return item.label !== row.name;
    });

    appliancesList.value = newApplicationList;
    row.is_new = false;
    newAppliancesAdded.value = false;
    totalAppliancesConsumption();
    backupPower();
    workingHours();
    updateCalculatorsData();
  }
};
const updateScreenWidth = () => {
  screenWidth.value = window.innerWidth;
};

onMounted(async () => {
  window.addEventListener('resize', updateScreenWidth);
  await API.SOLARCALCULATOR.GET_BASIC_FORM_TEMPLATE(SOLAR_CALCULATOR_ID).then(
    (items) => {
      items.data.sections.forEach(section => {
        section.fields.sort((a, b) => a.sequence - b.sequence);
      });
      data.value = items.data;
      leadCaptureTemplate.value = items.data;
    } 
  );
  totalAppliancesConsumption();
  backupPower();
  workingHours();
});
onBeforeUnmount(() => {
  window.removeEventListener('resize', updateScreenWidth);
});

watch(totalAppliancesConsumptionData, (newValue, oldValue) => {
  if (parseFloat(newValue) !== oldValue) {
    shouldCallFinancialApi.value = true;
  }
});


// watch(morning_outage, (newValue, oldValue) => {
//   if (parseInt(newValue) !== oldValue) {
//     outageHoursApiCalling.value = true;
//   }
// });

// watch(evening_outage, (newValue, oldValue) => {
//   if (parseInt(newValue) !== oldValue) {
//     outageHoursApiCalling.value = true;
//   }
// });

const preventSpecialCharacters = (label, e) => {
  if (label === "Mobile Number") {
    if (
      e.key === "e" ||
      e.key === "E" ||
      e.key === "+" ||
      e.key === "-" ||
      e.key === "."
    ) {
      e.preventDefault();
    }
  }
};

const handleLeadCaptureClose = () => {
  dialogVisible.value = !dialogVisible.value;
};

const openUploadDialog = () => {
  const fileInput = document.getElementById("fileInput");
  fileInput.click();
};

const handleAppliancesWatt = (row, column) => {
  if (parseInt(row.default_load_kw) > 1500) {
    row.default_load_kw = 1500;
  }

  if (parseInt(row.default_load_kw) < 0) {
    row.default_load_kw = 1;
  }
  if (parseInt(row.default_load_kw) === 0) {
    row.default_load_kw = 1;
  }

  if (
    parseInt(row.default_load_kw) < 1500 &&
    parseInt(row.default_load_kw) > 0
  ) {
    row.default_load_kw = Math.round(row.default_load_kw);
  }
  if (row.is_new === false) {
    totalAppliancesConsumption();
    backupPower();
  }
};

const handleAppliancesSelect = (row, column) => {
  const selectedValue = applicationListValueSelect.value.find(
    (item) => item.name === row[column.id]
  );
  row.name = selectedValue.name;
  row.quantity = row.quantity > 0 ? row.quantity : selectedValue.quantity;
  row.default_load_kw =  selectedValue.default_load_kw;
    // row.default_load_kw > 0
    //   ? row.default_load_kw
    //   :
  row.operating_hour =
    row.operating_hour > 0 ? row.operating_hour : selectedValue.operating_hour;


};

const deleteUploadedFiles = () => {
  const file_upload = {
    answer: {
      additional_info: {},
      corners: {
        address: "",
        center: {},
        coordinates: [],
        map_image: [],
        zoom: "",
      },
      deleted_files: [uploadedFile.value.file_name],
      files: [],
      options: [],
      sub_options: {
        question_type: "",
        value: "",
      },
      text: "",
    },
    question: uploadedFile.value.id,
    question_type: "file_upload",
    site_survey: calculatorData.site_survey_token,
  };

  const callApi = debounce(async () => {
    await API.EDITABLE_SITE_SURVEY_API.PATCH_ANSWERS(file_upload);
  });
  callApi();
  uploadedFile.value = {};
};

const handleTableData = (row, column) => {
  if (row.name == "Air Conditioner") {
    store.UPDATE_CALCULATOR_DATA(false, "ac");
  }

  // if(row.name == ""){
  //   return
  // }
  const newTable = tableData.value.filter((item) => {
    return item.name !== row.name;
  });
  const newAddedLabel = { label: row.name };
  if(row.name !== "" && !row.is_new ){
    appliancesList.value.push(newAddedLabel);
  }


  tableData.value = newTable;
  newAppliancesAdded.value = false;
  if (!row.is_new) {
    updateCalculatorsData();
    totalAppliancesConsumption();
    backupPower();
  }
};

// const handleMorningDecrementButton = (label, trigger) => {
//   if (
//     label === "Morning" &&
//     trigger === "decrease" &&
//     parseInt(morning_outage.value) === 0
//   ) {
//     return subsDisabledImg.value;
//   } else {
//     return subs.value;
//   }
// };

// const handleMorningIncrementButton = (label, trigger) => {
//   if (
//     label === "Morning" &&
//     trigger === "increase" &&
//     parseInt(morning_outage.value) === 5
//   ) {
//     return addDisabledImg.value;
//   } else {
//     return add.value;
//   }
// };

// const handleNightDecrementButton = (label, trigger) => {
//   if (
//     label === "Night" &&
//     trigger === "decrease" &&
//     parseInt(evening_outage.value) === 0
//   ) {
//     return subsDisabledImg.value;
//   } else {
//     return subs.value;
//   }
// };

// const handleNightIncrementButton = (label, trigger) => {
//   if (
//     label === "Night" &&
//     trigger === "increase" &&
//     parseInt(evening_outage.value) === 19
//   ) {
//     return addDisabledImg.value;
//   } else {
//     return add.value;
//   }
// };

// const handleIncrementDecrementStyles = (label, trigger) => {
//   if (
//     label === "Night" &&
//     trigger === "decrease" &&
//     evening_outage.value === 0
//   ) {
//     return "time_disabled_button";
//   }

//   if (
//     label === "Night" &&
//     trigger === "increase" &&
//     evening_outage.value === 19
//   ) {
//     return "time_disabled_button";
//   }

//   if (
//     label === "Morning" &&
//     trigger === "decrease" &&
//     morning_outage.value === 0
//   ) {
//     return "time_disabled_button";
//   }

//   if (
//     label === "Morning" &&
//     trigger === "increase" &&
//     morning_outage.value === 5
//   ) {
//     return "time_disabled_button";
//   }

//   return "time_button";
// };

const getInputStyles = (fields) => {
  switch (fields) {
    case "Mobile Number":
      if (mob_no_error.value === true) {
        return "input_error_fields";
      } else {
        return "input_fields";
      }
      break;
    case "Email":
      if (email_error.value === true) {
        return "input_error_fields";
      } else {
        return "input_fields";
      }
      break;
    case "Name":
      if (name_error.value === true) {
        return "input_error_fields";
      } else {
        return "input_fields";
      }
      break;
    default:
      return "input_fields";
      break;
  }
};

const getTerms = () => {
  window.open("https://www.tatapowersolar.com/terms-of-use/");
};

const handleRoi = async () => {
  data.value.sections[0].fields.map((item) => {
    if (item.label === "Type of Product") {
      item.additional_info.default_option = calculatorData.selected_grid;
    }

    if (item.label === "Recommended Solar Capacity") {
      item.additional_info.default_option = calculatorData.dc_size;
    }

    if (item.label === "Account Type") {
      item.additional_info.default_option = "Residential";
    }

    if (item.label === "Is your building under construction?") {
      item.additional_info.default_option = "No";
    }

    if (item.label === "Name") {
      item.additional_info.default_option = "";
      store.UPDATE_CALCULATOR_DATA("", "Name");
      name_error.value = false;
    }

    if (item.label === "Email") {
      item.additional_info.default_option = "";
      store.UPDATE_CALCULATOR_DATA("", "Email");
      email_error.value = false;
    }

    if (item.label === "Mobile Number") {
      item.additional_info.default_option = "";
      store.UPDATE_CALCULATOR_DATA(0, "Mobile Number");
      mob_no_error.value = false;
    }

    if (item.label === "Pincode") {
      item.additional_info.default_option = calculatorData.pin_code;
    }
  });
  uploadedFile.value = {};
  readAgreement.value = false;
  dialogVisible.value = !dialogVisible.value;
  data.value.sections[0].fields.forEach((item, index) => {
    if (
      item.additional_info.default_option &&
      item.additional_info.default_option !== "" &&
      item.additional_info.default_option !== 0
    ) {
      const file_upload = {
        answer: {
          additional_info: {
            financial_data: index === 0 ? calculatorData.calculated_data : "",
          },
          corners: {
            address: "",
            center: {},
            coordinates: [],
            map_image: [],
            zoom: "",
          },
          deleted_files: [],
          files: [],
          options: item.additional_info.default_option,
          sub_options: {
            question_type: "",
            value: "",
          },
          text: "",
        },
        question: item.id,
        question_type: item.question_type,
        site_survey: calculatorData.site_survey_token,
      };
      const callApi = debounce(async () => {
        await API.EDITABLE_SITE_SURVEY_API.PATCH_ANSWERS(file_upload);
      }, 1000);
      callApi();
    }
  });
};

const totalAppliancesConsumption = () => {
  if (tableData.value.length === 0) {
    totalAppliancesConsumptionData.value;
  }

  const morningTotalConsumption = tableData.value.reduce((sum, appliances) => {
    return (
      sum +
      appliances.quantity *
        appliances.default_load_kw *
        appliances.operating_hour_morning
    );
  }, 0);

  const eveningTotalConsumption = tableData.value.reduce((sum, appliances) => {
    return (
      sum +
      appliances.quantity *
        appliances.default_load_kw *
        appliances.operating_hour_evening
    );
  }, 0);

  totalAppliancesConsumptionData.value = (
    (morningTotalConsumption + eveningTotalConsumption) /
    1000
  ).toFixed(2);
  store.UPDATE_CALCULATOR_DATA(
    totalAppliancesConsumptionData.value,
    "total_consumption"
  );
  backupEnergy();
};

const backupPower = () => {
  if (tableData.value.length === 0) {
    totalAppliancesConsumptionData.value;
  }
  const totalConsumption = tableData.value.reduce((sum, appliances) => {
    return sum + appliances.quantity * appliances.default_load_kw;
  }, 0);
  totalBackupPower.value = (totalConsumption / 1000).toFixed(2);
  totalLoad.value = totalConsumption
  store.UPDATE_CALCULATOR_DATA(totalBackupPower.value, "backup_power");
  backupEnergy();
};

const backupEnergy = () => {
  if (tableData.value.length === 0) {
    totalAppliancesConsumptionData.value;
  }
  const totalBackup = totalBackupPower.value;
  const totalEveningConsumption = eveningOutageHours.value;
  const newValue =
    (totalBackup * totalEveningConsumption) / (0.85 * 0.95 * 0.95) / 0.7;
  totalBackupEnergy.value = newValue.toFixed(2);
  store.UPDATE_CALCULATOR_DATA(totalBackupEnergy.value, "backup_energy");
};

const handleButtonDisabled = () => {
  const condition = optArray.value.some((item) => item === null);

  if (condition === false && optArray.value.length === 4) {
    return false;
  } else {
    return true;
  }
};

const addAppliancesData = () => {
  const data = {
    name: "",
    quantity: 0,
    default_load_kw: 0,
    operating_hour_morning: 1,
    operating_hour_evening: 1,
    is_new: true,
  };
  if (newAppliancesAdded.value === false) {
    tableData.value.unshift(data);
    newAppliancesAdded.value = true;
  }
};

const handleAppliancesDecrementButton = (row, column, trigger) => {
  if (column.id === "quantity" && row[column.id] == 1) {
    return subsDisabledImg.value;
  }
  if (row[column.id] <= 0 && trigger === "decrease") {
    return subsDisabledImg.value;
  } else {
    return subs.value;
  }
};

const handleAppliancesIncrementButton = (row, column, trigger) => {
  if (trigger === "increase") {
    if (column.id === "operating_hour_morning" && row[column.id] === 5) {
      return addDisabledImg.value;
    }
    if (column.id === "operating_hour_evening" && row[column.id] === 19) {
      return addDisabledImg.value;
    }
    if (column.id === "quantity" && row[column.id] === 99) {
      return addDisabledImg.value;
    }
    return add.value;
  }
};

const handleAppliancesButtonStyles = (row, column, trigger) => {
  if (column.id === "quantity" && row[column.id] == 1 && trigger == "decrease") {
    return "time_disabled_button";
  }

  if (column.id === "quantity" && row[column.id] == 99 && trigger == "increase") {
    return "time_disabled_button";
  }
  if (row[column.id] <= 0 && trigger === "decrease") {
    return "time_disabled_button";
  }
  if (
    column.id === "operating_hour_morning" &&
    row[column.id] === 5 &&
    trigger === "increase"
  ) {
    return "time_disabled_button";
  }
  if (
    column.id === "operating_hour_evening" &&
    row[column.id] === 19 &&
    trigger === "increase"
  ) {
    return "time_disabled_button";
  }
  return "time_button";
};

const handleAppliancesButtonInput = (row, column) => {
  if (row.operating_hour_morning > 5) {
    row.operating_hour_morning = 5;
  }

  if (row.operating_hour_morning == null) {
    console.log("null");
  }
  if (row.operating_hour_morning < 0) {
    row.operating_hour_morning = Math.abs(row.operating_hour_morning);
  }

  if (row.operating_hour_evening > 19) {
    row.operating_hour_evening = 19;
  }

  if (row.operating_hour_evening < 0) {
    row.operating_hour_evening = 0;
  }

  if (row.operating_hour_morning < 5 && row.operating_hour_morning == 1) {
    row.operating_hour_morning = Math.round(row.operating_hour_morning);
  }

  if (row.operating_hour_evening < 19 && row.operating_hour_evening == 1) {
    row.operating_hour_evening = Math.round(row.operating_hour_evening);
  }

  if (row.quantity > 99) {
    row.quantity = 99;
  }
  if (row.quantity < 0) {
    row.quantity = 1;
  }

  if (row.quantity < 999 && row.quantity > 0) {
    row.quantity = Math.round(row.quantity);
  }

  if (row.quantity === 0) {
    row.quantity = 1;
  }

  if (row.quantity !== "" && row.is_new === false) {
    totalAppliancesConsumption();
    backupPower();
    workingHours();
  }
};

const handleAppliancesButtonBlur = (row, column) => {
  row.operating_hour_evening = Math.round(row.operating_hour_evening);
  row.operating_hour_morning = Math.round(row.operating_hour_morning);
  if (row.operating_hour_evening === "" || row.operating_hour_evening < 0) {
    row.operating_hour_evening = 0;
  }

  if (row.operating_hour_morning === "" || row.operating_hour_evening < 0) {
    row.operating_hour_morning = 0;
  }

  if (row.quantity === "") {
    row.quantity = 1;
  }

  if (row.is_new === false && shouldCallFinancialApi.value === true) {
    emits("calculateData");
    totalAppliancesConsumption();
    backupPower();
    workingHours();
    shouldCallFinancialApi.value = false;
    if(eveningOutageHours.value > 7){      
      ElMessage({
            message: 'The appliance you have added exceeds the maximum supported backup hours. Please adjust your selection to stay within the supported limits for accurate backup hour calculations.',
            type: 'info',
          })
    }
  }
};

const recalculateTableData = (row) => {
  if (row.is_new === false && shouldCallFinancialApi.value === true) {
    emits("calculateData");
    shouldCallFinancialApi.value = false;
  }
};

const handleAppliancesClicks = (row, column, trigger) => {
  shouldCallFinancialApi.value = false;
  if (trigger === "decrease") {
    if (column.id === "quantity" && row[column.id] == 1) {
      return;
    }
    if (row[column.id] == 0 && column.id !== "quantity") {
      return;
    }
    row[column.id] -= 1;
  }
  if (trigger === "increase") {
    if (column.id === "operating_hour" && row[column.id] === 24) {
      return;
    }

    if (column.id === "quantity" && row[column.id] === 99) {
      return;
    }

    if (column.id === "operating_hour_morning" && row[column.id] === 5) {
      return;
    }

    if (column.id === "operating_hour_evening" && row[column.id] === 19) {
      return;
    }
    row[column.id] += 1;
  }

  if (row.is_new === false) {
    workingHours();
    totalAppliancesConsumption();
    backupPower();
    updateCalculatorsData();
  }
};

const workingHours = () => {
  if (tableData.value.length === 0) {
    return;
  }

  const totalWattage = tableData.value.reduce((sum, appliances) => {
    return sum + appliances.quantity * appliances.default_load_kw;
  }, 0);

  const morningEnergyConsumed = tableData.value.reduce((sum, appliances) => {
    return (
      sum +
      appliances.quantity *
        appliances.default_load_kw *
        appliances.operating_hour_morning
    );
  }, 0);

  const eveningEnergyConsumed = tableData.value.reduce((sum, appliances) => {
    return (
      sum +
      appliances.quantity *
        appliances.default_load_kw *
        appliances.operating_hour_evening
    );
  }, 0);
  eveningOutageHours.value = eveningEnergyConsumed / totalWattage;
  const morningTotalEnergy = morningEnergyConsumed / 1000;
  const eveningTotalEnergy = eveningEnergyConsumed / 1000;
  store.UPDATE_CALCULATOR_DATA(morningTotalEnergy, "Morning");
  store.UPDATE_CALCULATOR_DATA(eveningTotalEnergy, "Night");
  console.log('totalBackupPower.value: ', totalBackupPower.value);
  if(eveningOutageHours.value > 7){
    store.UPDATE_CALCULATOR_DATA(7 , "backup_hours");
  }else{
    store.UPDATE_CALCULATOR_DATA(eveningOutageHours.value , "backup_hours");
  }
  backupEnergy();
};

const handleVerifyStyles = () => {
  const condition = optArray.value.some((item) => item === null);

  if (condition === false && optArray.value.length === 4) {
    return "moreDetailsButton";
  } else {
    return "button_disabled";
  }
};

const handleOtpKey = (e, i) => {
  const children = pinContainer.value.children;
  const keyPressed = e.data;

  if (keyPressed === " ") {
    optArray.value[i] = null;
  }

  if (e.inputType === "deleteContentBackward") {
    if (optArray.value[i] === null || optArray.value[i] === "") {
      optArray.value.length -= 1;
      if (i > 0) {
        children[i - 1].focus();
      }
    }
  }
  const matched = keyPressed.match(/^[0-9]$/);
  if (!matched) {
    optArray.value[i] = null;
    return;
  } else {
    optArray.value[i] = keyPressed;
    if (i < otpProps.length - 1) {
      children[i + 1].focus();
    }
  }
};

const checkOtp = () => {
  const children = pinContainer.value.children;

  for (let i = 0; i < otpProps.length - 1; i++) {
    if (optArray.value[i] === null) {
      children[i].classList.add("redBorder");
      return;
    }
  }
};

const getPlaceHolder = (label) => {
  return `Enter ${label}`;
};

const verifyOtp = async () => {
  const optEntered = optArray.value.join("");
  const requestBody = {
    phone: `91${calculatorData.mobile_no}`,
    otp: Number(optEntered),
  };

  try {
    await API.SOLARCALCULATOR.VERIFY_OTP(requestBody).then(() => {
      showContent.value = true;
      isCalculateRoi.value = false;
      verificationDialog.value = false;
      ElMessage({
        showClose: true,
        message: "OTP verified successfully",
        type: "success",
        center: true,
      });
    });
  } catch (err) {
    ElMessage({
      showClose: true,
      message: "OTP is incorrect",
      type: "error",
      center: true,
    });
  }
};

const validateTimeInput = (data, label) => {
  if (morning_outage.value !== "" && evening_outage.value !== "") {
    store.UPDATE_CALCULATOR_DATA(data, label);

    if (outageHoursApiCalling.value === true) {
      outageHoursApiCalling.value = false;
      emits("calculateData");
    }
  }
};

const handleTimeInput = (data, label) => {
  switch (label) {
    case "Morning":
      morning_outage.value = parseInt(morning_outage.value);
      if (parseInt(data) > 5) {
        morning_outage.value = 5;
      }

      if (parseInt(data) < 0) {
        morning_outage.value = 1;
      }

      break;
    case "Night":
      evening_outage.value = parseInt(evening_outage.value);
      if (data > 19) {
        evening_outage.value = 19;
      }
      if (data < 0) {
        evening_outage.value = 1;
      }
      backupEnergy();
      break;
    default:
      break;
  }
};

const updateData = () => {
  emits("calculateData");
};

const updateCalculatorsData = debounce(() => {
  emits("calculateData");
}, 300);

// const handleTime = (label, method) => {
//   switch (label) {
//     case "Morning":
//       if (method === "decrease") {
//         if (morning_outage.value > 0) {
//           morning_outage.value = parseInt(morning_outage.value) - 1;
//           updateCalculatorsData();
//           store.UPDATE_CALCULATOR_DATA(parseInt(morning_outage.value), label);
//         }
//       }

//       if (method === "increase" && morning_outage.value < 5) {
//         morning_outage.value = parseInt(morning_outage.value) + 1;
//         updateCalculatorsData();
//         store.UPDATE_CALCULATOR_DATA(parseInt(morning_outage.value), label);
//       }

//       break;
//     case "Night":
//       if (method === "decrease") {
//         if (evening_outage.value > 0) {
//           evening_outage.value = parseInt(evening_outage.value) - 1;
//           updateCalculatorsData();
//           store.UPDATE_CALCULATOR_DATA(parseInt(evening_outage.value), label);
//         }
//       }
//       if (method === "increase" && evening_outage.value < 19) {
//         evening_outage.value = parseInt(evening_outage.value) + 1;
//         updateCalculatorsData();
//         store.UPDATE_CALCULATOR_DATA(parseInt(evening_outage.value), label);
//       }
//       backupEnergy();
//       break;

//     default:
//       break;
//   }
// };

const buttonDisabled = () => {
const validation = calculatorData.account_type == "Company/Society/Institution" && calculatorData.required_customer_field == "" 
  if (
    calculatorData.name !== "" &&
    calculatorData.email !== "" &&
    calculatorData.mobile_no !== 0 &&
    readAgreement.value === true &&
    !validation&&
    mob_no_error.value !== true &&
    email_error.value !== true &&
    name_error.value !== true
  ) {
    return false;
  } else {
    return true;
  }
};

const buttonStyles = () => {
  const validation = calculatorData.account_type == "Company/Society/Institution" && calculatorData.required_customer_field == "" 
  if (
    calculatorData.name !== "" &&
    calculatorData.email !== null &&
    calculatorData.mobile_no !== 0 &&
    readAgreement.value === true &&
    !validation&&
    mob_no_error.value !== true &&
    email_error.value !== true &&
    name_error.value !== true
  ) {
    return "moreDetailsButton";
  } else {
    return "button_disabled";
  }
};

const resendOtp = async () => {
  if (timer.value > 0) {
    return;
  }

  loading.value = true;
  const send_otp_data = {
    phone: `91${calculatorData.mobile_no}`,
    org:263,
  };

  try {
    await API.SOLARCALCULATOR.SEND_OTP(send_otp_data);
    ElMessage({
      showClose: true,
      message: "OTP sent successfully",
      type: "success",
      center: true,
    });
    setTimerValue();

    loading.value = false;
  } catch (err) {
    ElMessage({
      showClose: true,
      message: "Unable to send OTP.",
      type: "error",
      center: true,
    });
    loading.value = false;
  }
};

const verifyDetails = async () => {
  loading.value = true;
  const send_otp_data = {
    phone: `91${calculatorData.mobile_no}`,
    org:263,
  };

  try {
    await API.SOLARCALCULATOR.SEND_OTP(send_otp_data);
    dialogVisible.value = !dialogVisible.value;
    verificationDialog.value = true;
    setTimerValue();
    ElMessage({
      showClose: true,
      message: "OTP sent",
      type: "success",
      center: true,
    });
    optArray.value = [];
  } catch (err) {
    ElMessage({
      showClose: true,
      message:
        err.response.data === "Invalid Number"
          ? "Input valid mobile number"
          : "Unable to send OTP",
      type: "error",
      center: true,
    });
  }

  loading.value = false;
};

const generateThumbnailUrl = async (file) => {
  return new Promise((resolve, reject) => {
    let reader = new FileReader();
    reader.onload = (e) => {
      resolve(e.target.result);
    };
    reader.onerror = (error) => {
      reject(error);
    };
    reader.readAsDataURL(file);
  });
};

const fileUpload = debounce(async (e, question_no) => {
  const uploaded_file = e.target.files;
  if (uploaded_file[0].size > 5 * 1024 * 1024) {
    ElMessage({
      showClose: true,
      message: "File size should be less than 5MB. Please try again",
      type: "error",
      center: true,
    });
    return;
  }

  const uuidFile = v4();
  let file = {
    id: question_no.id,
    file_info: uploaded_file[0].name,
    file_name: uuidFile,
    url: undefined,
    file_type: uploaded_file[0].type,
  };

  if (
    ["application/pdf", "image/jpeg", "image/png", "image/gif"].includes(
      uploaded_file[0].type
    )
  ) {
    try {
      const [_, thumbnailUrl] = await Promise.all([
        uploadFileToBlob(uploaded_file[0], uuidFile),
        generateThumbnailUrl(uploaded_file[0]),
      ]);

      const binaryData = thumbnailUrl.split(",")[1];
      const base64Data = btoa(binaryData);
      let url = "data:;base64," + base64Data;

      uploadedFile.value = file;
    } catch (error) {
      console.error("Error uploading file:", error);
    }
    const file_upload = {
      answer: {
        additional_info: {},
        corners: {
          address: "",
          center: {},
          coordinates: [],
          map_image: [],
          zoom: "",
        },
        deleted_files: [],
        files: [
          {
            file_info: e.target.files[0].name,
            file_name: uuidFile,
            file_type: e.target.files[0].type,
          },
        ],
        options: [],
        sub_options: {
          question_type: "",
          value: "",
        },
        text: "",
      },
      question: question_no.id,
      question_type: "file_upload",
      site_survey: calculatorData.site_survey_token,
    };

    const callApi = debounce(async () => {
      await API.EDITABLE_SITE_SURVEY_API.PATCH_ANSWERS(file_upload);
    });
    callApi();
  } else {
    ElMessage({
      showClose: true,
      message: "Please upload a valid file",
      type: "error",
      center: true,
    });
  }
}, 500);

const updateAnswerApi = (item) => {
  const single_choice = {
    answer: {
      additional_info: {},
      corners: {
        address: "",
        center: {},
        coordinates: [],
        map_image: [],
        zoom: "",
      },
      deleted_files: [],
      files: [],
      options: item.additional_info.default_option,
      sub_options: {
        question_type: item.options[0].sub_options[0].question_type,
        value: item.options[0].sub_options[0].additional_info.default_option,
      },
      text: "",
    },
    question: item.id,
    question_type: item.question_type,
    site_survey: calculatorData.site_survey_token,
  };

  const callChoices = async () => {
    API.EDITABLE_SITE_SURVEY_API.PATCH_ANSWERS(single_choice);
  };
  callChoices();
};
function validateMobileNumber(mobileNumber) {
  const mobileNumberPattern = /^\d{10}$/;

  return mobileNumberPattern.test(mobileNumber);
}

function isValidEmail(text) {
  const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;

  return emailRegex.test(text);
}

function validateName(input) {
  const hasAlphabetic = /[a-zA-Z]/.test(input);
  // should not contain html tags
  const hasHtmlTags = /<\/?[a-z][\s\S]*>/i.test(input);

  const isNotJustSpaces = input.trim() !== "";

  if (!hasAlphabetic || !isNotJustSpaces || hasHtmlTags) {
    return true;
  }

  return false;
}

const handleValidation = (data, label) => {
  switch (label) {
    case "Name":
      if (validateName(data)) {
        name_error.value = true;
      } else {
        name_error.value = false;
      }
      break;
    case "Mobile Number":
      const mobile_no = parseInt(data);
      if (validateMobileNumber(mobile_no)) {
        store.UPDATE_CALCULATOR_DATA(data, label);
        mob_no_error.value = false;
      } else {
        mob_no_error.value = true;
      }
      break;
    case "Email":
      if (isValidEmail(data.trim())) {
        email_error.value = false;
      } else {
        email_error.value = true;
      }
      break;
    default:
      break;
  }
};

const handleFocus = (label) => {
  switch (label) {
    case "Mobile Number":
      mob_no_error.value = false;
      break;
    case "Email":
      email_error.value = false;
      break;
    case "Name":
      name_error.value = false;
      break;
    default:
      break;
  }
};

const uploadData = debounce((data, label, question_type, item) => {
  switch (question_type) {
    case "short_answer":
      const shortAnswer = {
        answer: {
          additional_info: {},
          corners: {
            address: "",
            center: "",
            coordinates: {},
            map_image: "",
            zoom: "",
          },
          deleted_files: [],
          files: [],
          options: [],
          sub_options: {
            question_type: "",
            value: "",
          },
          text: data.trim(),
        },
        question: item.id,
        question_type: "short_answer",
        site_survey: calculatorData.site_survey_token,
      };

      const callShortAnswer = async () => {
        API.EDITABLE_SITE_SURVEY_API.PATCH_ANSWERS(shortAnswer);
      };

      if (data.trim() !== "") {
        callShortAnswer();
      }

      break;
    case "number":
      const number = {
        answer: {
          additional_info: {},
          corners: {
            address: "",
            center: {},
            coordinates: [],
            map_image: [],
            zoom: "",
          },
          deleted_files: [],
          files: [],
          options: [],
          sub_options: {
            question_type: "",
            value: "",
          },
          text: label == "Mobile Number" ? data.slice(0, 10) : data,
        },
        question: item.id,
        question_type: "number",
        site_survey: calculatorData.site_survey_token,
      };

      const callNumber = async () => {
        API.EDITABLE_SITE_SURVEY_API.PATCH_ANSWERS(number);
      };
      callNumber();
      break;

    case "dropdown":
      const dropdown = {
        answer: {
          additional_info: {},
          corners: {
            address: "",
            center: "",
            coordinates: {},
            map_image: "",
            zoom: "",
          },
          deleted_files: [],
          files: [],
          options: data,
          sub_options: {
            question_type: "",
            value: "",
          },
          text: "",
        },
        question: item.id,
        question_type: "dropdown",
        site_survey: calculatorData.site_survey_token,
      };
      const callApi = async () => {
        API.EDITABLE_SITE_SURVEY_API.PATCH_ANSWERS(dropdown);
      };
      callApi();
      break;
    case "multiple_choice":
      const single_choice = {
        answer: {
          additional_info: {},
          corners: {
            address: "",
            center: {},
            coordinates: [],
            map_image: [],
            zoom: "",
          },
          deleted_files: [],
          files: [],
          options: data,
          sub_options: {
            question_type: "",
            value: "",
          },
          text: "",
        },
        question: item.id,
        question_type: "multiple_choice",
        site_survey: calculatorData.site_survey_token,
      };

      const callChoices = async () => {
        API.EDITABLE_SITE_SURVEY_API.PATCH_ANSWERS(single_choice);
      };
      callChoices();
      break;
    default:
      return null;
      break;
  }
}, 1000);

const updateCalculatorData = (data, label, question_type, item) => {
  if (label === "Mobile Number") {
    if (item.additional_info.default_option > 9999999999) {
      item.additional_info.default_option =
        item.additional_info.default_option.slice(0, 10);
    }
    store.UPDATE_CALCULATOR_DATA(item.additional_info.default_option, label);
  }

  if (label === "Name") {
    if (validateName(item.additional_info.default_option))
      store.UPDATE_CALCULATOR_DATA(
        item.additional_info.default_option.trim(),
        label
      );
  }

if(label == "Company/Society/Institution Name"){
  store.UPDATE_CALCULATOR_DATA(
    data,
        "required_customer_field"
      );
}

  store.UPDATE_CALCULATOR_DATA(data, label);

  uploadData(data, label, question_type, item);
};
const isMobile = computed(() => screenWidth.value < 1180);
</script>

<style scoped>
.main_outage_form {
  display: flex;
  gap: 10px;
}

.wrapper_outage_form {
  margin-top: 10px;
  display: flex;
  align-items: center;
  padding: 5px;
  box-shadow: 0px 0px 6px 0px rgba(0, 0, 0, 0.15);
  border-radius: 8px;
  flex: 1;
  height: 10vh;
}

.powerCard {
  flex: 1;
  display: flex;
  height: 64px;
  padding: 10px 16px;
  align-items: center;
  justify-content: center;
  gap: 10px;
  border-radius: 8px;
  background: var(--White, #fff);
  box-shadow: 0px 0px 6px 0px rgba(0, 0, 0, 0.15);
}

.blueButton {
  padding-top: 10px;
  padding-bottom: 10px;
  background-color: #006eaf;
  border: none;
  outline: none;
  color: var(--grey-grey-100, var(--White, #fff));
  font-family: Arial;
  font-size: 16px;
  font-style: normal;
  font-weight: 700;
  cursor: pointer;
}

.right {
  display: flex;
  flex-direction: column;
  gap: 10px;
  margin-left: 10px;
}

.blueContainer {
  display: flex;
  align-items: center;
  justify-content: center;
  background-color: #006eaf;
  margin-top: 10px;
  border-radius: 8px;
}

.dialogCustom {
  position: relative;
  height: 100%;
}

.dialogVerification >>> .el-dialog__header {
  background-color: #e8edf2;
  margin-right: 0;
  border-radius: 8px 8px 0px 0px;
}

.dialogCustom >>> .el-dialog__header {
  background-color: #e8edf2;
  margin-right: 0;
  border-radius: 10px 10px 0px 0px;
  padding: 0;
  padding-left: 20px;
  padding-right: 20px;
  padding-top: 15px;
  padding-bottom: 15px;
  width: 100%;
  position: sticky;
  top: 0;
  z-index: 999;
}

.dialogVerification >>> .el-dialog__header {
  background-color: #e8edf2;
  margin-right: 0;
  border-radius: 10px 10px 0px 0px;
  padding: 0;
  padding-left: 20px;
  padding-right: 20px;
  padding-top: 15px;
  padding-bottom: 15px;

  position: sticky;
}

.slider_inner_button {
  background-color: black;
  color: white;
  border: none;
  margin-bottom: 1px;
  cursor: pointer;
}

.slider_inner_disable_button {
  background-color: #ccc;
  color: white;
  border: none;
  margin-bottom: 2px;
  cursor: not-allowed;
}

.dialogCustom >>> .el-checkbox__inner {
  z-index: 0;
}

.dialogCustom >>> .el-checkbox__inner {
  z-index: 0;
}

.dialogCustom >>> .el-checkbox__input {
  background-color: yellow;
}

.dialogVerification >>> .el-dialog__body {
  padding: 16px;
  color: black;
}

.dialogCustom >>> .el-dialog__body {
  padding: 0px;
  color: black;
}

.moreDetailsButton {
  width: 100%;
  border: none;
  outline: none;
  background-color: var(--Primary-Tata, #006eaf);
  height: 30px;
  border-radius: 8px;
  cursor: pointer;
  font-weight: 700;
  font-size: 16px;
  color: white;
  padding: 20px;
  z-index: 999;
}

.button_disabled {
  width: 100%;
  border: none;
  height: 30px;
  background-color: #e8edf2;
  outline: none;
  color: #ccc;
  padding: 20px;
  font-size: 16px;
  font-style: normal;
  font-weight: 700;
  line-height: normal;
  border-radius: 8px;
  cursor: not-allowed;
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

.productTypes {
  margin-top: 10px;
}

.cards {
  margin-top: 10px;
  height: 20vh;
  /* background-color: #006eaf; */
  display: flex;
  align-items: center;
  justify-content: center;
  border-radius: 8px;
}

.cardWrapper {
  color: black;
  display: flex;
  flex-direction: column;
  gap: 10px;
  align-items: center;
  justify-content: center;
}

.input_containers {
  margin-top: 10px;
}

.input_containers :deep() .el-input__inner {
  color: black;
  font-size: 16px;
}
.logo_card {
  margin-top: 10px;
  border-radius: 8px;
  padding: 10px;
  border: 1px solid #cccccc;
}
.input_fields {
  margin-top: 5px;
  color: black;
}

.input_error_fields {
  margin-top: 5px;
  color: black;
}

.input_fields >>> .el-input.is-disabled .el-input__inner {
  color: #2c2727; /* Change this color to your desired text color */
}

.input_error_fields >>> .el-input.is-disabled .el-input__inner {
  color: #2c2727; /* Change this color to your desired text color */
}

.input_capacity {
  display: flex;
  height: 48px;
  padding: 10px 16px;
  align-items: center;
  gap: 10px;
  align-self: stretch;
  border: none;
  background: var(--White, #fff);
  border-radius: 8px;
  border: 1px solid var(--Grey-CCC, #ccc);
  box-shadow: 0 0 0 1px var(--el-input-border-color, var(--el-border-color))
    inset;
  margin-top: 5px;
}

.input_capacity >>> .el-input-group__append {
  box-shadow: none;
  background-color: white;
}
.input_fields >>> .el-input__wrapper {
  display: flex;
  height: 48px;
  padding: 10px 16px;
  align-items: center;
  gap: 10px;
  align-self: stretch;
  border-radius: 8px;
  border: 1px solid var(--Grey-CCC, #ccc);
  background: var(--White, #fff);
}

.input_error_fields >>> .el-input__wrapper {
  display: flex;
  height: 48px;
  padding: 10px 16px;
  align-items: center;
  gap: 10px;
  align-self: stretch;
  border-radius: 8px;
  border: 1px solid var(--Grey-CCC, red);
  background: var(--White, #fff);
}

.is_focus {
  outline: none;
  border: none;
}

.mainPowerContainer {
  margin-top: 10px;
  border: 1px solid var(--CCC, #ccc);
  padding: 10px;
  border-radius: 5px;
}

.pinInputContainer {
  display: flex;
  gap: 20px;
}

.pinInput {
  width: 50px;
  text-align: center;
  border-radius: 2px;
  border: none;
  border-bottom: 1px solid grey;
  outline: none;
  font-size: 18px;
  padding: 5px;
}

.PDcard {
  padding: 16px 10px;
  border-radius: 4px;
  background-color: #e8edf2;
  text-align: center;
  height: 200px;
  display: flex;
  justify-content: center;
  align-items: center;
  flex-direction: column;
  width: 120px;
  height: 120px;
  border: 1px dashed var(--999, #999);
  gap: 8px;
  cursor: pointer;
  align-self: center;
}

.productTypes >>> .el-radio__input.is-checked + .el-radio__label {
  color: black;
}

.productTypes >>> .el-radio__input.is-checked .el-radio__inner {
  border-color: #006eaf;
  background-color: white;
  border: 2px solid #006eaf;
}

.number_input >>> .el-input-number__decrease {
  border-radius: 50%;
  background-color: #0d0d0d;
  color: white;
  font-size: 14px;
  width: 30px;
  height: 30px;
}

.Verification {
  position: sticky;
  bottom: 0;
  background: var(--White, #fff);
  box-shadow: 4px 0px 10px 0px rgba(0, 0, 0, 0.25);
  width: 100%;
  padding: 10px;
}

.fixed-header {
  position: sticky;
  top: 0;
}

.veri_button {
  background: var(--White, #fff);
  width: 100%;
  padding-top: 30px;
  padding-left: 30px;
  padding-right: 30px;
  padding-bottom: 15px;
  display: flex;
  align-items: center;
}

.number_input >>> .el-input-number__increase {
  border-radius: 50%;
  background-color: #0d0d0d;
  color: white;
  height: 30px;
  width: 30px;
  font-size: 14px;
}

.time_input {
  border-radius: 4px;
  border: 1px solid var(--999, #999);
  background: var(--White, #fff);
  width: 60px;
  padding: 5px;
  display: flex;
  align-items: center;
  cursor: not-allowed;
}

.appliances_input {
  border-radius: 8px;
  border: 1px solid var(--CCC, #ccc);
  background: var(--White, #fff);
  width: 70px;
  padding: 5px;
  display: flex;
  align-items: center;
  height: 35px;
}

.time_button {
  cursor: pointer;
}

.appliances_time_button {
  height: 22px;
  width: 22px;
  border: none;
  border-radius: 50%;
  color: white;
  background-color: #006eaf;
  display: flex;
  align-items: center;
  justify-content: center;
  cursor: pointer;
}

.time_disabled_button {
  /* height: 22px;
  width: 22px;
  border-radius: 50%;
  border: none;
  color: white;
  background-color: #ccc;
  display: flex;
  align-items: center;
  justify-content: center; */
  cursor: not-allowed;
}

.appliances_time_disabled_button {
  cursor: not-allowed;
}

.time_input >>> input[type="number"]::-webkit-inner-spin-button {
  -webkit-appearance: none;
  margin: 0;
}
.watt_appliances >>> input[type="number"]::-webkit-inner-spin-button {
  -webkit-appearance: none;
  margin: 0;
}

.input_fields >>> input[type="number"]::-webkit-inner-spin-button {
  -webkit-appearance: none;
  margin: 0;
}
.input_error_fields >>> input[type="number"]::-webkit-inner-spin-button {
  -webkit-appearance: none;
  margin: 0;
}
.input_fields >>> input[type="number"]::-webkit-inner-spin-button {
  -webkit-appearance: none;
  margin: 0;
}

.number_input >>> .el-input__inner {
  border: 1px;
  box-shadow: 0 0 0 1px var(--el-input-border-color, var(--el-border-color))
    inset;
}

.number_input >>> .el-input__wrapper {
  box-shadow: none;
}

.productTypes >>> .el-radio__inner::after {
  height: 6px;
  width: 5.5px;
  background-color: #006eaf;
  top: 50%;
  left: 50%;
}

.requiredClass {
  color: red;
}

.dropdownContainer {
  width: 100%;
}

.dropdownContainer >>> .el-select .el-input__wrapper {
  display: flex;
  height: 48px;
  width: 100%;
  padding: 10px 12px;
  justify-content: space-between;
  align-items: center;
  align-self: stretch;
  border-radius: 8px;
  border: 1px solid var(--Grey-CCC, #ccc);
  background: var(--White, #fff);
}

.appliances_number_input :deep() .el-input-number__decrease {
  border-radius: 50%;
  background-color: #006eaf;
  color: #fff;
  height: 50%;
  top: 25%;
  width: 13%;
}

.appliances_number_input :deep() .el-input-number__increase {
  border-radius: 50%;
  background-color: #006eaf;
  color: #fff;
  height: 50%;
  top: 25%;
  width: 13%;
  right: 19%;
}

.appliances_number_input :deep() .el-input__wrapper {
  box-shadow: none;
}

.appliances_number_input :deep() .el-input__inner {
  height: 35px;
  box-shadow: 0 0 0 1px var(--el-input-border-color, var(--el-border-color))
    inset;
  border-radius: 8px;
  position: relative;
  left: -22%;
}

.watt_appliances :deep() .el-input__wrapper {
  width: 90px;
  border-radius: 8px;
  border: 1px solid var(--CCC, #ccc);
  background: var(--White, #fff);
  box-shadow: none;
}

.productTypes >>> .el-select .el-input__wrapper {
  display: flex;
  height: 48px;
  padding: 10px 12px;
  justify-content: space-between;
  align-items: center;
  align-self: stretch;
  border-radius: 8px;
  border: 1px solid var(--Grey-CCC, #ccc);
  background: var(--White, #fff);
  margin-top: 10px;
}

.error_field {
  margin-top: 5px;
  color: red;
  font-size: 12px;
}

.dialogCustom >>> .el-dialog {
  height: 80vh;
  overflow: scroll;
  border-radius: 10px;
  position: relative;
}

.dialogVerification >>> .el-dialog {
  border-radius: 10px;
}

.input_time {
  outline: none;
  border: none;
  width: 20px;
  cursor: not-allowed;
}

.appliances_input_value {
  outline: none;
  border: none;
  width: 100%;
}

.appliances_watt_value {
  width: 80px;
  border-radius: 8px;
  border: 1px solid var(--Grey-CCC, #ccc);
  background: var(--White, #fff);
  height: 35px;
  padding: 5px;
  outline: none;
}
.time_container {
  margin-top: 10px;
  padding: 10px;
  border-radius: 8px;
  border: 1px solid var(--Grey-CCC, #ccc);
  background: var(--White, #fff);
}

.input_number {
  display: flex;
  align-items: center;
  gap: 10px;
}

.check_box {
  margin-top: 10px;
  padding-left: 20px;
  margin-bottom: 10px;
}

.check_box >>> .el-checkbox__input.is-checked + .el-checkbox__label {
  color: black;
}

.dialog_title {
  color: var(--222, #222);
  font-family: Arial;
  font-size: 16px;
  font-style: normal;
  font-weight: 400;
  line-height: normal;
}

.error_dialog_title {
  color: red;
  font-family: Arial;
  font-size: 16px;
  font-style: normal;
  font-weight: 400;
  line-height: normal;
}

.unit_text {
  color: var(--Grey-777, var(--777, #777));
  font-family: Poppins;
  font-size: 14px;
  font-style: normal;
  font-weight: 400;
  line-height: normal;
}

.img_container {
  position: relative;
  box-shadow: 0 0 0 1px var(--el-input-border-color, var(--el-border-color))
    inset;
  margin-top: 10px;
  border-radius: 8px;
  display: flex;
  width: 120px;
  height: 120px;
  padding: 12px;
  flex-direction: column;
  gap: 10px;
  justify-content: center;
  align-items: center;
  background: var(--Background, #e8edf2);
}

.el-message.is-closable .el-message__content {
  z-index: 9999;
}

.delete-button {
  display: none;
  position: absolute;
  top: 50%;
  left: 50%;
  transform: translate(-50%, -50%);
}

.verifyHeader {
  color: #000;
  text-align: center;
  font-family: Arial;
  font-size: 18px;
  font-style: normal;
  font-weight: 400;
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

.dialogCustom >>> .el-dialog {
  scrollbar-width: none; /* Firefox */
  -ms-overflow-style: none; /* Internet Explorer */
  border-radius: 8px;
}

.upload-demo >>> .el-upload-dragger {
  display: flex;
  width: 120px;
  height: 120px;
  padding: 12px;
  flex-direction: column;
  justify-content: center;
  align-items: center;
  gap: 10px;
  border-radius: 8px;
  border: 1px dashed var(--Grey-777, #777);
  background: var(--White, #fff);
}

.capacity_input {
  border: none;
  outline: none;
  background-color: white;
  color: black;
  font-size: 16px;
}

.capacity_input:hover {
  cursor: no-drop;
}

.input_capacity:hover {
  cursor: no-drop;
}

.otp_not_received {
  color: var(--777, #777);
  text-align: center;
  font-family: Arial;
  font-size: 20px;
  font-style: normal;
  font-weight: 400;
  line-height: normal;
}

.verify_received {
  color: var(--White, #fff);
  font-family: Arial;
  font-size: 20px;
  font-style: normal;
  font-weight: 700;
  line-height: normal;
}

.file_input {
  height: 100%;
  width: 100%;
  display: none;
}

.otp_send {
  color: #000;
  text-align: center;
  font-family: Arial;
  font-size: 20px;
  font-style: normal;
  font-weight: 400;
  line-height: normal;
  text-decoration-line: underline;
  cursor: pointer;
}

.otp_send_disabled {
  color: #ccc;
  text-align: center;
  font-family: Arial;
  font-size: 20px;
  font-style: normal;
  font-weight: 400;
  line-height: normal;
  text-decoration-line: underline;
  cursor: not-allowed;
}

.input_field_error >>> .el-input__wrapper {
  display: flex;
  height: 48px;
  padding: 10px 16px;
  align-items: center;
  gap: 10px;
  align-self: stretch;
  border-radius: 8px;
  border: 1px solid var(--Grey-CCC, #ef1212);
  background: var(--White, #fff);
}

.file_upload_card {
  display: flex;
  width: 120px;
  height: 120px;
  padding: 12px;
  flex-direction: column;
  justify-content: center;
  align-items: center;
  gap: 10px;
  border-radius: 8px;
  border: 1px dashed var(--Grey-777, #777);
  background: var(--White, #fff);
  margin-top: 10px;
  cursor: pointer;
}

.custom-checkbox >>> .el-checkbox__input.is-checked .el-checkbox__inner {
  background-color: #006eaf;
  border: #006eaf;
}

.custom-checkbox :deep() .el-checkbox__inner::after {
  left: 5px;
  top: 2px;
}

.details_card {
  padding: 10px;
  margin-top: 10px;
  background-color: var(--777, #edf1f5);
  border-radius: 8px;
  box-shadow: 0 0 0 1px var(--el-input-border-color, var(--el-border-color))
    inset;
}

.contact_details {
  font-weight: bold;
  font-size: 14px;
  line-height: 18px;
  color: #006eaf;
}

.contact_info {
  font-size: 14px;
  line-height: 18px;
  font-weight: bold;
}

.contact_wrapper {
  display: flex;
  align-items: center;
  padding: 10px;
  gap: 10px;
}

.note {
  color: var(--Grey-777, var(--777, #777));
  font-family: Arial;
  font-size: 12px;
  font-style: normal;
  font-weight: 400;
  line-height: normal;
}

.dialogCustom >>> .el-dialog__headerbtn {
  display: none;
}

.dialogVerification >>> .el-dialog__headerbtn {
  display: none;
}

.dialogCustom >>> .el-dialog::-webkit-scrollbar {
  display: none; /* Webkit (Chrome, Safari, etc.) */
}
.input_fields >>> .el-input-number__decrease {
  display: none;
}

.input_error_fields >>> .el-input-number__decrease {
  display: none;
}

.appliances_details_container {
  display: flex;
  align-items: center;
  justify-content: end;
  gap: 13px;
}

.main_appliances_container {
  border-radius: 8px;
  border: 1px solid #ccc;
  background: #fff;
  padding: 16px;
  display: flex;
  gap: 10px;
  flex-direction: column;
  margin-top: 15px;
}

.appliances_title {
  margin-top: 12px;
  margin-bottom: 12px;
  color: var(--777, #777);
  font-family: Arial;
  font-size: 24px;
  font-style: normal;
  font-weight: 700;
  line-height: normal;
}

.appliances_add_button {
  display: flex;
  align-items: center;
  justify-content: end;
}

.appliances_button {
  border: none;
  background-color: white;
  color: #184d93;
  font-family: Poppins;
  font-size: 16px;
  font-style: normal;
  font-weight: 500;
  line-height: 26px; /* 162.5% */
  cursor: pointer;
}

.appliances_details {
  color: var(--777, #777);
  font-family: Arial;
  font-size: 16px;
  font-style: normal;
  font-weight: 400;
  line-height: normal;
}
.hrClass {
  border-top: 2px solid #cccccc;
}

.appliances_values {
  color: #000;
  font-family: Poppins;
  font-size: 16px;
  font-style: normal;
  font-weight: 600;
  line-height: normal;
}

.appliances_names {
  color: var(--Black, var(--222, #222));
  font-family: Arial;
  font-size: 16px;
  font-style: normal;
  font-weight: 400;
  line-height: normal;
}
.appliances_table {
  display: flex;
  padding: 0px 16px;
  flex-direction: column;
  align-items: center;
  align-self: stretch;
  border-radius: 8px;
  border: 1px solid var(--CCC, #ccc);
}

.appliances_input >>> input[type="number"]::-webkit-inner-spin-button,
.appliances_input input[type="number"]::-webkit-outer-spin-button {
  -webkit-appearance: none;
  margin: 0;
  color: red;
}

.input_time >>> input[type="number"]::-webkit-inner-spin-button,
.input_time input[type="number"]::-webkit-outer-spin-button {
  -webkit-appearance: none;
  margin: 0;
  color: red;
}

.my-header {
  color: #000;
  font-family: Arial;
  font-size: 16px;
  font-style: normal;
  font-weight: 700;
  line-height: normal;
}

.edit_data {
  margin-left: 90%;
  display: flex;
  align-items: center;
  gap: 10px;
}

.edit_data_actions {
  margin-left: 57%;
  display: flex;
  align-items: center;
  gap: 10px;
}

@media screen and (max-width: 827px) and (min-width: 360px){
  .dialogCustom >>> .el-dialog {
    width: 90%;
    -ms-overflow-style: none;
  }
}

@media screen and (max-width: 1180px) and (min-width: 375px) {
  .dialogCustom >>> .el-dialog {
    width: 90%;
    -ms-overflow-style: none;
  }

  .loading_popup :deep() .el-dialog {
    padding: 0px;
    border-radius: 8px;
    width: 90%;
  }
  .dialogVerification >>> .el-dialog {
    width: 90%;
  }

  .main_appliances_container {
    padding: 8px;
  }

  .hours_card {
    flex-direction: column;
  }

  .time_container {
    width: 100%;
  }

  .right {
    margin-left: 20px;
  }
}

@media screen and (max-width: 740px) and (min-width: 360px) {
  .time_container {
    width: 100%;
  }
  .hours_card {
    flex-direction: column;
  }
}
.collaps-content{
  display:flex;
  flex-direction: row;
  padding-top:16px;
  width: 100%;

}

.collaps-content-label{
  flex:0.5;
}
.collaps-content-value{
  flex:0.5;
  display: flex;
  justify-content: flex-end;
}
.collaps-content-name{
  flex:0.5;
  display: flex;
}
.collapse_container>>>.el-collapse-item__content{
  padding-bottom:0px

}
.btn_container{
  display: flex;
  justify-content: flex-end;
}
</style>
