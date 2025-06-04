<template>
  <div class="appliance-card">
    <el-form :label-position="'top'" :model="appliance">
      <el-row :gutter="20" class="header-row">
        <el-col :xs="24" :sm="12" v-show="mode === 'create'"
          ><el-form-item label="Appliance Name">
            <el-input
              placeholder="Enter an appliance name"
              v-model="appliance.name"
              @input="checkNameError"
            ></el-input>
            <p v-if="error.nameError" class="error-message">
              {{ error.nameError }}
            </p></el-form-item
          ></el-col
        >
        <el-col :xs="24" :sm="12"
          ><el-form-item label="Quantity">
            <el-input
              type="number"
              placeholder="0"
              v-model="appliance.quantity"
              @input="checkQuantityError"
            >
            </el-input>
            <p v-if="error.quantityError" class="error-message">
              {{ error.quantityError }}
            </p>
          </el-form-item></el-col
        >
        <el-col :xs="24" :sm="12"
          ><el-form-item label="Operating Power">
            <el-input
              type="number"
              placeholder="0"
              @input="checkDefaultLoadError"
              v-model="appliance.default_load_kw"
              ><template #suffix> <p class="suffix">kW</p></template></el-input
            >
            <p v-if="error.default_load_kwError" class="error-message">
              {{ error.default_load_kwError }}
            </p>
          </el-form-item></el-col
        >
        <el-col :xs="24" :sm="12"
          ><el-form-item label="Daily Usage">
            <el-input
              type="number"
              placeholder="0"
              @input="checkOperatingHourError"
              v-model="appliance.operating_hour"
              ><template #suffix>
                <p class="suffix">Hour</p></template
              ></el-input
            >
            <p v-if="error.operating_hourError" class="error-message">
              {{ error.operating_hourError }}
            </p>
          </el-form-item></el-col
        >
      </el-row>
    </el-form>
    <div class="buttons-section">
      <el-button
        type="primary"
        @click="validateApplianceForm()"
        v-show="mode === 'create'"
        >Add</el-button
      >
      <el-button
        type="primary"
        @click="validateApplianceForm()"
        v-show="mode === 'edit'"
        >Update</el-button
      >
    </div>
  </div>
</template>

<script>
export default {
  props: {
    mode: {
      required: true,
      type: String,
    },
    applianceToBeEdited: {
      required: false,
      type: Object,
    },
  },
  data() {
    return {
      appliance: {
        name: "",
        quantity: "",
        default_load_kw: "",
        operating_hour: "",
      },
      error: {
        nameError: "",
        quantityError: "",
        default_load_kwError: "",
        operating_hourError: "",
      },
    };
  },
  created() {
    console.log(this.$props.mode);
    if (this.$props.mode === "edit") {
      this.setEditItem(this.$props.applianceToBeEdited);
    }
  },

  methods: {
    defaultLoadKwError() {
      return;
    },
    operatingHourError() {
      return;
    },
    validateApplianceForm() {
      this.checkNameError();
      this.checkQuantityError();
      this.checkDefaultLoadError();
      this.checkOperatingHourError();

      if (
        this.error.nameError === "" &&
        this.error.quantityError === "" &&
        this.error.default_load_kwError === "" &&
        this.error.operating_hourError === ""
      ) {
        if (this.mode === "create") {
          console.log("adding new appliance");
          this.addApplianceDetails();
        }
        if (this.mode === "edit") {
          console.log("edit call");
          this.updateApplianceDetails();
        }
      }
    },
    checkNameError() {
      this.error.nameError =
        this.mode === "create" && !this.appliance.name
          ? "Please enter a name for the appliance"
          : "";
    },
    checkQuantityError() {
      const quantity = parseInt(this.appliance.quantity);
      this.error.quantityError =
        quantity <= 0 || !Number.isInteger(quantity)
          ? "Please enter a positive integer"
          : "";
    },
    checkDefaultLoadError() {
      this.error.default_load_kwError =
        this.appliance.default_load_kw < 0 ||
        this.appliance.default_load_kw === ""
          ? "Please enter a positive number"
          : "";
    },
    checkOperatingHourError() {
      const value = parseFloat(this.appliance.operating_hour);
      this.error.operating_hourError =
        this.appliance.operating_hour === "" || value <= 0 || value > 24
          ? "Please enter a value greater than 0 and less than or equal to 24"
          : "";
    },

    setEditItem(applianceObj) {
      this.appliance.id = applianceObj.id;
      this.appliance.type = applianceObj.type;
      this.appliance.quantity = applianceObj.quantity;
      this.appliance.default_load_kw = applianceObj.default_load_kw;
      this.appliance.operating_hour = applianceObj.operating_hour;
    },
    addApplianceDetails() {
      console.log(this.appliance);
      this.$emit("addNewAppliance", this.appliance);
      //reset the v-model values so the popup opens with empty fields
      this.appliance.name = "";
      this.appliance.quantity = "";
      this.appliance.default_load_kw = "";
      this.appliance.operating_hour = "";
    },
    updateApplianceDetails() {
      console.log(this.appliance);
      this.$emit(
        "updateAppliance",
        this.appliance,
        this.$props.applianceToBeEdited.index
      );
    },
  },
  watch: {
    applianceToBeEdited: function (newVal, oldVal) {
      this.setEditItem(newVal);
    },
    "appliance.operating_hour": "validateOperatingHour",
  },
};
</script>

<style scoped>
* {
  font-family: "Poppins";
}

.appliance-card :deep() .el-form-item__label {
  color: var(--black, #222);
  font-family: Poppins;
  font-size: 14px;
  font-style: normal;
  font-weight: 400;
  line-height: normal;
}
.appliance-card :deep() .el-button--primary {
  background-color: #f7941d;
  border-color: #f7941d;
}

.appliance-card :deep() .el-button > span {
  font-family: "Poppins";
  display: flex;
  width: 7.5rem;
  height: 2.5rem;
  padding: 0.5rem 1.625rem;
  justify-content: center;
  align-items: center;
  gap: 10px;
}

.buttons-section {
  display: flex;
  justify-content: flex-end;
}

.appliance-card :deep() .el-input__wrapper {
  border-radius: 8px;
  border: 1px solid var(--ccc, #ccc);
  background: var(--white, #fff);
  padding: 10px 1rem;
}

.appliance-card :deep() .el-input__inner::placeholder,
.suffix {
  color: var(--black, #222);
  font-family: Poppins;
  font-size: 0.875rem;
  font-style: normal;
  font-weight: 400;
  line-height: normal;
}

.error-message {
  color: red;
  font-size: 12px;
  margin-top: 4px;
  line-height: 20px;
}
</style>
