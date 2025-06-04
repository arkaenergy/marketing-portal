import { defineStore } from "pinia";

export const solarCalculatorStore = defineStore("solarCalculatorStore", {
  state: () => ({
    calculatorData: {
      loan_tenure: "",
      interest_rate: "",
      pin_code: 0,
      latitude: 0,
      price_with_battery: 0,
      price_without_battery: 0,
      longitude: 0,
      monthly_bill: 0,
      bill_with_solar: [],
      bill_without_solar: [],
      required_customer_field: "",
      is_ac_added: false,
      tariff_rate: 7,
      backup_hours: 1,
      dc_size: 0,
      sanction_load: 5,
      supply_phase: "Single Phase",
      rooftop_area: 0,
      category: "Residential",
      morning_outage_hours: 5,
      night_outage_hours: 13,
      account_type: "Individual",
      product_type: "On-grid",
      under_construction: "Yes",
      solar_capacity: 0,
      upload_files: {},
      active_tab: 0,
      name: "",
      email: "",
      mobile_no: 0,
      system_size: 1,
      area_required: 234,
      site_survey_token: "",
      loan_amount: 0,
      emi_amount: 0,
      selected_grid: "On-Grid",
      error: false,
      calculated_data: {},
      pin_code_error: false,
      total_consumption: 0,
      backup_power: 0,
      backup_energy: 0,
    },
  }),
  getters: {
    CALCULATOR_DATA_STATE: (state) => state.calculatorData,
  },
  actions: {
    UPDATE_POWER_OUTAGE(data) {
      this.powerOutage = data;
    },
    UPDATE_CALCULATOR_DATA(data, label) {
      let number = parseInt(data);
      switch (label) {
        case "Pincode":
          this.calculatorData.pin_code = number;
          break;
        case "Electricity Bill":
          this.calculatorData.monthly_bill = number;
          break;
        case "Morning":
          this.calculatorData.morning_outage_hours = data;
          break;
        case "Night":
          this.calculatorData.night_outage_hours = data;
          break;
        case "Tariff Rates":
          this.calculatorData.tariff_rate = number;
          break;
        case "Sanction Load":
          this.calculatorData.sanction_load = number;
          break;
        case "Power Supply Phase":
          this.calculatorData.supply_phase = data;
          break;
        case "Category":
          if (data === "Commercial") {
            this.calculatorData.supply_phase = "Three Phase";
          }
          this.calculatorData.category = data;
          break;
        case "Rooftop Area":
          this.calculatorData.rooftop_area = number;
          break;
        case "Latitude":
          this.calculatorData.latitude = data;
          break;
        case "Longitude":
          this.calculatorData.longitude = data;
          break;
        case "Account Type":
          this.calculatorData.account_type = data;
          break;
        case "Type of Product":
          this.calculatorData.product_type = data;
          break;
        case "Is your building under construction?":
          this.calculatorData.under_construction = data;
          break;
        case "Recommended Solar Capacity":
          this.calculatorData.solar_capacity = number;
          break;
        case "Name":
          this.calculatorData.name = data;
          break;
        case "Email":
          this.calculatorData.email = data;
          break;
        case "Mobile Number":
          this.calculatorData.mobile_no = number;
          break;
        case "System Size":
          this.calculatorData.system_size = number;
          this.calculatorData.area_required = number * 120;
          break;
        case "File_Upload":
          this.calculatorData.upload_files = data;
          break;
        case "Site Survey":
          this.calculatorData.site_survey_token = data;
          break;
        case "Loan Term":
          this.calculatorData.loan_tenure = number;
          break;
        case "Loan Rate":
          this.calculatorData.interest_rate = number;
          break;
        case "System Cost":
          this.calculatorData.loan_amount = number;
          break;
        case "emi_update":
          this.calculatorData.emi_amount = number;
          break;
        case "SelectedGrid":
          this.calculatorData.selected_grid = data;
          break;
        case "Error":
          this.calculatorData.error = data;
          break;
        case "ac":
          this.calculatorData.is_ac_added = data;
          break;
        case "backup_hours":
          this.calculatorData.backup_hours = data;
          break;
        case "with_solar":
          this.calculatorData.bill_with_solar = data;
          break;
        case "without_solar":
          this.calculatorData.bill_without_solar = data;
          break;
        case "required_customer_field":
          this.calculatorData.required_customer_field = data;
          break;
        case "dc_size":
          this.calculatorData.dc_size = data;
          break;
        case "calculate_data":
          this.calculatorData.calculated_data = data;
          break;
        case "pin_code_error":
          this.calculatorData.pin_code_error = data;
          break;
        case "total_consumption":
          this.calculatorData.total_consumption = data;
          break;
        case "backup_power":
          this.calculatorData.backup_power = data;
          break;
        case "backup_energy":
          this.calculatorData.backup_energy = data;
          break;
        case "active_tab":
          this.calculatorData.active_tab = data;
          break;
        case "price_with_battery":
          this.calculatorData.price_with_battery = data;
          break;
        case "price_without_battery":
          this.calculatorData.price_without_battery = data;
          break;
        default:
          return null;
          break;
      }
    },
  },
});
