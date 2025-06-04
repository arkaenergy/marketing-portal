<template>
    <div class="waareeParentContainer" v-loading="isFetchingFinancialData">
        <div class="pinCodeContainerfullwidth">
            <div class="pinCodeContainer">
                <div class="inputCont">
                    <form>
                        <input type="text" v-model.trim="enteredPin
                            " class="firstInput" maxlength="6" :placeholder="pinCodePlaceholder" />
                        <button class="submitBtn" @click.prevent="handleLocationSubmit" type="submit">Submit</button>
                    </form>
                </div>
                <p class="currLocation" @click="getUserLocation">Use my current location</p>
            </div>
        </div>
        <div class="firSection">
            <div class="flexCont">
                <div class="inputsContainer">
                    <div v-show="isCalculatorVisible">
                        <div class="inputsGroupContainer">
                            <p class="heading">Tell me about your Energy Consumption​</p>
                            <div class="inputsBox">
                                <label for="inpLabel" class="inpLabel">Average Monthly Bill <span class="requiredField">*</span>
                                </label>
                                <div class="inpBill">
                                    <input class="inputAMEC" type="number" v-model="averageMonthlyBill" @blur="blurHandler('three')" />
                                    <p class="requiredFieldText" v-if="!isValidAvgMonthlyBill">
                                        This field is required.
                                    </p>
                                </div>
                            </div>
                            <div class="inputsBox">
                                <label for="inpLabel" class="inpLabel">Average Monthly <br />
                                    Electricity Consumption
                                    <span class="requiredField">*</span>
                                </label>
                                <div class="inpOne">
                                    <input class="inputAMEC" type="number" v-model="avgMonthlyConsumption"
                                        @blur="blurHandler('one')" />
                                    <p class="requiredFieldText" v-if="!isValidAvgMonthlyConsumption">This field is
                                        required.</p>
                                </div>
                            </div>
                        </div>
                        <div class="inputsGroupContainer">
                            <p class="heading">What appliances do you use?​</p>
                            <div class="applianceTable">
                                <div class="tableHeader">
                                    <p class="headerTitle">Appliance Name</p>
                                    <p class="headerTitle">Operating Power (in W)</p>
                                    <p class="headerTitle">Number of Appliances</p>
                                    <p class="headerTitle">Usage Hours</p>
                                    <p class="headerTitle">Essential Load</p>
                                    <p class="mdTitle">Add appliances</p>
                                </div>
                                <div class="wrapper">
                                    <el-scrollbar class="tableBody" ref="scrollbar" always>
                                        <div class="tableInputsContainer" v-for="(appliance,index) in appliancesList" :key="index">
                                            <div class="tableInputCont">
                                                <el-checkbox :label="appliance.name" v-model="appliance.isChecked" />
                                                <div class="mdDiv">
                                                    <p class="mdLabel">Operating Power (in W)</p>
                                                    <div class="inpDiv">
                                                        <p class="units">W</p>
                                                        <input type="text" v-model="appliance.size" class="inputTag kwhInp" oninput="this.value = this.value.replace(/[^0-9]/g, '');"/>
                                                    </div>
                                                </div>
                                                <div class="mdDiv">
                                                    <p class="mdLabel">Number of Appliances</p>
                                                    <input type="text" v-model="appliance.quantity" class="inputTag noOfApplInp" oninput="this.value = this.value.replace(/[^0-9]/g, '');"/>
                                                </div>
                                                <div class="mdDiv">
                                                    <p class="mdLabel">Usage Hours</p>
                                                    <input type="text" v-model="appliance.hours" class="inputTag usageHrInp" oninput="this.value = this.value.replace(/[^0-9]/g, '');"/>
                                                </div>
                                                <div class="mdDiv">
                                                    <p class="mdLabel">Essential Load</p>
                                                    <el-select v-model="appliance.isEssential" class="m-2" placeholder="value">
                                                        <el-option v-for="item in options" :key="item.value" :label="item.label" :value="item.value" />
                                                    </el-select>
                                                </div>
                                            </div>
                                        </div>
                                        <div class="tableInputsContainer">
                                            <div class="tableInputCont flexStart" v-if="addEquipment">
                                                <div>
                                                    <input type="text" v-model="newAppliance.name" class="addInputTag"  placeholder="Appliance Name"/>
                                                    <p class="errorText" v-if="errors.name">This field is required.</p>
                                                </div>
                                                <div class="mdDiv">
                                                    <p class="mdLabel">Operating Power (in W)</p>
                                                    <div class="inpDiv">
                                                        <p class="units">W</p>
                                                        <input type="text"  v-model="newAppliance.size" class="inputTag kwhInp" oninput="this.value = this.value.replace(/[^0-9]/g, '');"/>
                                                        <p class="errorText" v-if="errors.size">This field is required.</p>
                                                    </div>
                                                </div>
                                                <div class="mdDiv">
                                                    <p class="mdLabel">Number of Appliances</p>
                                                    <div>
                                                        <input type="text" v-model="newAppliance.quantity"  class="inputTag noOfApplInp" oninput="this.value = this.value.replace(/[^0-9]/g, '');"/>
                                                        <p class="errorText" v-if="errors.quantity">This field is required.</p>
                                                    </div>
                                                </div>
                                                <div class="mdDiv">
                                                    <p class="mdLabel">Usage Hours</p>
                                                    <div>
                                                        <input type="text" v-model="newAppliance.hours"  class="inputTag usageHrInp" oninput="this.value = this.value.replace(/[^0-9]/g, '');"/>
                                                        <p class="errorText" v-if="errors.hours">This field is required.</p>
                                                    </div>
                                                </div>
                                                <div class="">
                                                    <div class="mdDiv tableFlexCont">
                                                        <p class="mdLabel">Essential Load</p>
                                                        <el-select v-model="newAppliance.isEssential" class="m-2" placeholder="Value">
                                                            <el-option v-for="item in options" :key="item.value" :label="item.label" :value="item.value" />
                                                        </el-select>
                                                        <img src="./assets/img/check-lg.svg" class="tickIcon" @click="validationFunc()" />
                                                    </div>
                                                </div>
                                            </div>
                                        </div>
                                    </el-scrollbar>
                                    <div class="addMoreApplCont">
                                        <p class="addEquipment" @click="addEquipmentHandler">Add more appliances</p>
                                    </div>
                                </div>
                            </div>
                            <div class="inputsBox">
                                <label for="inpLabel" class="inpLabel">Total Available Roof <br />
                                    Area
                                    <span class="requiredField">*</span>
                                </label>
                                <div class="inpTwo">
                                    <input class="inputAMEC " type="number" v-model="totalRoofArea"
                                        @blur="blurHandler('two')" />
                                    <p class="requiredFieldText" v-if="!isValidtotalRoofArea">This field is required.</p>
                                </div>
                            </div>
                            <div class="inputsBox">
                                <label for="inpLabel" class="inpLabel">% of Shadow Free Open <br />Space Available
                                </label>
                                <div class="inpThree sliderContainer">
                                    <div class="sliderCont">
                                        <div class="slider-demo-block">
                                            <el-slider v-model="freeSpaceAvailablePer" />
                                        </div>
                                        <div class="percentContainer">
                                            <div class="zeroPercent commonPercent">0</div>
                                            <div class="twFivePercent commonPercent">25</div>
                                            <div class="fiftyPercent commonPercent">50</div>
                                            <div class="swFivePercent commonPercent">75</div>
                                            <div class="hundredPercent commonPercent">100</div>
                                        </div>
                                    </div>
                                    <div class="smallInpCont containerWithSlider">
                                        <input
                                            class="inputAMEC smallInp inputWithSlider"
                                            type="number"
                                            v-model="freeSpaceAvailablePerInput"
                                            max="100"
                                            min="0"
                                         />
                                        <span class="sliderPercentage" >%</span>
                                    </div>
                                </div>
                            </div>
                            <div class="">
                                <div class="checkboxFlex sliderContainer">
                                    <label style="display: flex; gap: 0.5em; align-items: center;">
                                        <input type="checkbox" class="checkbox" v-model="eligibleForSubsidy" />
                                        <p class="checkboxCont">
                                            Are you eligible for subsidy?
                                        </p>
                                    </label>
                                    <a href="https://mnre.gov.in/solar/schemes" target="_blank" class="knowMore">
                                        Know More
                                    </a>
                                </div>
                                <div class="smallInpCont additionalInpCont" v-if="eligibleForSubsidy">
                                    <input type="number" class="subsidyInput" v-model="subsidyPercentage" />
                                    <p class="smallInpUnitTwo">%</p>
                                </div>
                            </div>
                            <div class="inputsBox">
                                <button class="calBtn" id="calBtn" @click="handleCalculateClick">Calculate</button>
                            </div>
                        </div>
                    </div>
                </div>
            </div>
            <!-- <div class="firstImg">
                    <img src="./assets/img/Group2701.png" class="firImg" />
                </div> -->
        </div>
    </div>

    <!-- -------------------------------our recommendation----------------------- -->

    <div v-if="isEverythingVisible" v-loading="isUpdatingInformation" id="recommendation">
        <div class="secSection">
            <div class="radioBtnPVS boxed">
                <input
                    type="radio"
                    id="gridtied"
                    name="firstRadioButton"
                    v-model="activeGridSection"
                    value="gridtied"
                />
                <label for="gridtied" class="gridTiedLabel">Grid Tied</label>
                <input
                    type="radio"
                    id="offgrid"
                    name="firstRadioButton"
                    v-model="activeGridSection"
                    value="offgrid"
                    :disabled="isOffGridDisabled"
                />
                <el-tooltip
                    :disabled="!isOffGridDisabled"
                    effect="dark"
                    placement="top"
                    content="Please enter essential load."
                >
                    <label
                        for="offgrid"
                        class="offGridLabel" 
                        :class="{ 'disabled': isOffGridDisabled }"
                    >
                        Off-Grid
                    </label>
                </el-tooltip>
            </div>
            <div class="secSectionChild">
                <h3 class="commonHeading">
                    Our Recommendation
                </h3>
                <div class="commonGridContainer marginBottom">
                    <div class="gridBox">
                        <img class="commonIcons" src="./assets/img/Group2665.svg" />
                        <p class="gridBoxP">Estimated System Size (kW)</p>
                        <div class="counterBox">
                            <p class="minusBox" @click="decreaseSystemSize">-</p>
                            <input type="number" class="counterInput" v-model="sysSizeValue" min="1"/>
                            <p class="addBox" @click="increaseSystemSize">+</p>
                        </div>
                    </div>
                    <div class="gridBox">
                        <img class="commonIcons" src="./assets/img/Group2758.svg" />
                        <p class="gridBoxP">Estimated Annual Generation</p>
                        <p class="valueP">{{ this.formatNumberWithCommas(financialData.annual_generation) }} kWh</p>
                    </div>
                    <div class="gridBox">
                        <img class="commonIcons" src="./assets/img/Group2719.svg" />
                        <p class="gridBoxP">Estimated Monthly Bill Savings</p>
                        <p class="valueP">{{ this.formatNumberWithCommas(this.financialData.monthly_bill_saving)  }}%</p>
                    </div>
                    <div class="gridBox">
                        <img class="commonIcons" src="./assets/img/Group2719.svg" />
                        <p class="gridBoxP">Estimated Shadow Free Area Required</p>
                        <p class="valueP">{{ this.formatNumberWithCommas(financialData.shadow_free_roof_area) }} Sq. Ft.</p>
                    </div>
                </div>
            </div>

            <div class="secSectionChild" v-if="activeGridSection === 'offgrid'" >
                <h3 class="commonHeading">
                    Recommended Battery Storage
                </h3>
                <div class="commonGridContainer marginBottom">
                    <div class="gridBox">
                        <img class="commonIcons" src="./assets/img/Group2857.svg" />
                        <p class="gridBoxP">Estimated Battery Capacity</p>
                        <p class="valueP">{{ this.formatNumberWithCommas(financialData.estimated_battery_capacity) }} kWh</p>
                    </div>
                    <div class="gridBox">
                        <img class="commonIcons" src="./assets/img/Group2855.svg" />
                        <p class="gridBoxP">On Storage with Essential Load</p>
                        <p class="valueP">{{ onStorageWithEssentialLoad }}</p>
                    </div>
                    <div class="gridBox">
                        <img class="commonIcons" src="./assets/img/Group2853.svg" />
                        <p class="gridBoxP">On Storage Only</p>
                        <p class="valueP">{{ onStorageOnly }}</p>
                    </div>
                    <div class="gridBox">
                        <img class="commonIcons" src="./assets/img/Group2854.svg" />
                        <p class="gridBoxP">On Solar & Storage</p>
                        <p class="valueP">{{ onSolarAndStorage  }}</p>
                    </div>
                </div>
            </div>


            <h3 class="commonHeading">
                Savings and Payback
            </h3>
            <div class="commonGridContainer">
                <div class="gridBox">
                    <img class="commonIcons" src="./assets/img/Group2719.svg" />
                    <p class="gridBoxP">Estimated System Cost</p>
                    <p class="valueP">₹{{ this.formatNumberWithCommas(financialData.system_cost) }}</p>
                </div>
                <div class="gridBox">
                    <img class="commonIcons" src="./assets/img/Group2719.svg" />
                    <p class="gridBoxP">Estimated Lifetime Savings</p>
                    <p class="valueP">₹{{ this.formatNumberWithCommas(financialData.lifetime_savings) }}</p>
                </div>
                <div class="gridBox">
                    <img class="commonIcons" src="./assets/img/Group2718.svg" />
                    <p class="gridBoxP">Return on Investment</p>
                    <p class="valueP">{{ this.formatNumberWithCommas(financialData.roi) }}%</p>
                </div>
            </div>

            <div class="estimated-bill-chart-dims">
                <EstimatedUtilityBill :estimatedUtilityBillWithSolarData="financialData.bill_with_solar"
                    :estimatedUtilityBillWithoutSolarData="financialData.bill_without_solar" />
            </div>

            <div class="commonGridContainer">
                <div class="gridBox">
                    <img class="commonIcons" src="./assets/img/Group2718.svg" />
                    <p class="gridBoxP">Payback Period</p>
                    <p class="valueP">{{ this.financialData.payback }} Years</p>
                </div>
                <div class="gridBox">
                    <img class="commonIcons" src="./assets/img/Group2719.svg" />
                    <p class="gridBoxP">Estimated Annual Savings</p>
                    <p class="valueP">₹{{ this.formatNumberWithCommas(financialData.annual_saving) }}</p>
                </div>
                <div class="gridBox">
                    <img class="commonIcons" src="./assets/img/Group2762.svg" />
                    <p class="gridBoxP">Your Spend on Electricity</p>
                    <p class="valueP">₹{{ this.formatNumberWithCommas(financialData.bill_with_solar[0]) }}</p>
                </div>
            </div>

            <div class="break-even-chart-dims">
                <BreakEvenAnalysis :breakEvenAnalysisData="financialData.cumulative_savings" />
            </div>

        </div>
        <div class="thrSection">
            <img src="./assets/img/waareeBack.svg" class="backLeftDark" />
            <img src="./assets/img/waareeRight.svg" class="backRightDark" />
            <!-- <div class="thrSectionChild">
                <h3 class="whiteHeading">Configuration/Item Description</h3>
                <div class="gridContainer">
                    <div class="gridBoxTwo">
                        <img class="commonIcons" src="./assets/img/Group2786.svg" />
                        <p class="gridBoxPTwo">Solar Panel Capacity</p>
                        <div class="flexContTooltipCont">
                            <p class="valuePTwo">{{ financialData.panel[0].moduleProperties.capacity }} kW</p>
                            <div class="hover_information">
                                <img src="./assets/img/tooltipIcon.svg" class="tooltipIcon" @click="showTooltipOne()" />
                                <div class="tooltip" v-if="tooltipObj.isTooltipOneVisible">
                                    <p class="tooltipHeading">
                                        Brand: {{ financialData.panel[0].brand }}
                                    </p>
                                    <p class="tooltipLink" @click="isPanelSpecificationPopupVisible = true">
                                        View Detailed Specifications
                                    </p>
                                </div>
                            </div>
                        </div>
                        <div class="flexContTwo">
                            <div class="warrantyCont">
                                <p class="warranty">
                                    Product Warranty <br />
                                    {{ financialData.panel[0].product_warranty }}
                                </p>
                            </div>
                            <hr class="hrLine" />
                            <div class="warrantyCont">
                                <p class="warranty">
                                    Power Warranty <br />
                                    {{ financialData.panel[0].power_warranty }}
                                </p>
                            </div>
                        </div>
                    </div>
                    <div class="gridBoxTwo">
                        <img class="commonIcons" src="./assets/img/Group2787.svg" />
                        <p class="gridBoxPTwo">Solar Inverter Capacity</p>
                        <div class="flexContTooltipCont">
                            <p class="valuePTwo">{{ financialData.inverter.string[0].electricalProperties.rated_output }} kW
                            </p>
                            <div class="hover_information">
                                <img src="./assets/img/tooltipIcon.svg" class="tooltipIcon" @click="showTooltipTwo()" />
                                <div class="tooltip" v-if="tooltipObj.isTooltipTwoVisible">
                                    <p class="tooltipHeading">
                                        {{ financialData.inverter.string[0].make }}<br />
                                        Brand: {{ financialData.inverter.string[0].manufactuerer }}
                                    </p>
                                    <p class="tooltipLink" @click="isInverterSpecificationPopupVisible = true">View Detailed
                                        Specifications</p>
                                </div>
                            </div>
                        </div>
                        <div class="flexContTwo">
                            <div class="warrantyCont">
                                <p class="warranty">
                                    Warranty <br />
                                    {{ financialData.inverter.string[0].product_warranty }}
                                </p>
                            </div>
                        </div>
                    </div>
                </div>
            </div> -->

            <!-- -------------------------------contribution----------------------- -->

            <div class="frSection">
                <img src="./assets/img/wareeBackground.svg" class="backLeftDark" />
                <img src="./assets/img/MaskGroup84.svg" class="backRightLight" />
                <div class="frSectionChild">
                    <h3 class="commonHeading">Your Contribution to the Environment</h3>
                    <div class="gridContainerFr">
                        <div class="gridBoxFr">
                            <img src="./assets/img/Group2791.svg" class="commonIcon" />
                            <div class="boxFr">
                                <p class="gridBoxPTwo">Estimated CO<sub>2</sub> Reduced</p>
                                <p class="valuePTwo">{{ financialData.co2_offset }} Tons</p>
                            </div>
                        </div>
                        <div class="gridBoxFr">
                            <img src="./assets/img/Group2775.svg" class="commonIcon" />
                            <div class="boxFr">
                                <p class="gridBoxPTwo">Trees Planted</p>
                                <p class="valuePTwo">{{ parseInt(financialData.trees) }}</p>
                            </div>
                        </div>
                    </div>
                </div>
            </div>

            <!-- -------------------------------s0lar today----------------------- -->

            <div class="thrSection">
                <img src="./assets/img/waareeBack.svg" class="backLeftDark" />
                <img src="./assets/img/waareeRight.svg" class="backRightDark" />
                <div class="thrSectionChild">
                    <h3 class="whiteHeading">Get Your Solar Today</h3>
                    <div class="gridContST">
                        <div class="gridBoxST">
                            <img src="./assets/img/Group2777.svg" class="commonIconST" />
                            <div class="flexContTooltipCont">
                                <p class="gridBoxPTwo">Best Price</p>
                                <div class="hover_information">
                                    <img src="./assets/img/tooltipIcon.svg" class="tooltipIcon"
                                        @click="showTooltipThree()" />
                                    <div class="tooltip tooltipBP" v-if="tooltipObj.isTooltipThreeVisible">
                                        <p class="tooltipContent">
                                            Additional charges applicable towards bi-directional meter, CEIG approval,
                                            liaisoning etc. varies based on state, system size and connection type.
                                        </p>
                                    </div>
                                </div>
                            </div>
                            <p class="valuePTwo">₹{{ this.formatNumberWithCommas(financialData.system_cost) }}</p>
                        </div>
                        <div class="gridBoxST">
                            <img src="./assets/img/Group27.svg" class="commonIconST" />
                            <div class="flexContTooltipCont">
                                <p class="gridBoxPTwo">EMI Starts from</p>
                                <div class="hover_information">
                                    <img src="./assets/img/tooltipIcon.svg" class="tooltipIcon"
                                        @click="showTooltipFour()" />
                                    <div class="tooltip tooltipEMI" v-if="tooltipObj.isTooltipFourVisible">
                                        <div class="tooltipBoxOne">
                                            <p class="tooltipGreenHeading">Loan Terms*</p>
                                            <div class="tooltipFlex">
                                                <p class="">Down payment (Upto 30%*)</p>
                                                <p class="">₹{{ emiDownPayment }}</p>
                                            </div>
                                            <div class="tooltipFlex">
                                                <p class="">Loan Amount (Upto 70%*)</p>
                                                <p class="">₹{{ emiLoanAmount }}</p>
                                            </div>
                                            <div class="tooltipFlex">
                                                <p class="">Term</p>
                                                <p class="">10 years</p>
                                            </div>
                                            <div class="tooltipFlex">
                                                <p class="">Interest rate<br />(11.25% - 16.60%)</p>
                                                <p class="">12%</p>
                                            </div>
                                            <div class="tooltipFlex">
                                                <p class="">Collateral/Security</p>
                                                <p class="">Nil</p>
                                            </div>
                                            <div class="tooltipFlex">
                                                <p class="">Processing Time</p>
                                                <p class="">1 Week</p>
                                            </div>
                                            <p class="calculations">*Calculations based on these values</p>
                                        </div>
                                        <div class="tooltipBoxTwo">
                                            <p class="tooltipGreenHeading">Requirements</p>
                                            <p class="tooltipULList">Legal ID</p>
                                            <p class="tooltipULList">Salary/Income Slips</p>
                                            <p class="tooltipULList">IT Returns</p>
                                        </div>
                                    </div>
                                </div>
                            </div>
                            <p class="valuePTwo">₹{{ this.formatNumberWithCommas(financialData.emi) }}/month</p>
                        </div>
                        <div class="gridBoxST">
                            <img src="./assets/img/Group2777.svg" class="commonIconST" />
                            <div class="flexContTooltipCont">
                                <p class="gridBoxPTwo">Remote Monitoring System</p>
                            </div>
                            <p class="valuePTwo">Included</p>
                        </div>
                    </div>
                </div>

                <!-- -------------------------------radiobtns----------------------- -->

                <div class="frSection">
                    <img src="./assets/img/wareeBackground.svg" class="backLeftDark" />
                    <div class="frSectionChild">
                        <div class="radioBtnPVS boxed">
                            <input type="radio" id="option1" name="skills" v-model="activeEstimatedSection" value="savings"
                                class="inputOnePVS" />
                            <label for="option1" class="labelOnePVS">Estimated Monthly Savings</label>
                            <input type="radio" id="option2" name="skills" v-model="activeEstimatedSection"
                                value="production" class="inputTwoPVS" />
                            <label for="option2" class="labelTwoPVS">Estimated Annual Production</label>
                        </div>
                        <div class="flexContSavings">
                            <div class="graphCont">
                                <p class="graphContent">Although solar will reduce your utility bill throughout the year,
                                    the
                                    greatest
                                    savings will come in
                                    months with higher solar generation.
                                </p>

                                <div class="estimated-chart-dims">
                                    <EstimatedMonthlySavings v-if="activeEstimatedSection === 'savings'"
                                        :savingsData="financialData.monthly_savings" />
                                    <EstimatedAnnualProduction v-if="activeEstimatedSection === 'production'"
                                        :productionData="productionData" />
                                </div>
                                <!-- <img src="./assets/img/Group2814.svg" class="graphImg" /> -->
                            </div>
                            <div v-if="activeEstimatedSection === 'savings'" class="graphSideContPVS">
                                <p class="estAvgPVS">Estimated Average Monthly Savings</p>
                                <p class="estRateValPVS">₹{{ this.formatNumberWithCommas(financialData.average_monthly_saving) }}/month</p>
                            </div>
                            <div v-else class="graphSideContPVS">
                                <p class="estAvgPVS">Estimated Average Generation of the System</p>
                                <p class="estRateValPVS">{{ averageMonthlyGeneration }} kWh/month</p>
                                <p class="estAvgPVS">Estimated Annual Degradation Rate </p>
                                <p class="estRateValPVS">₹1.5/month</p>
                            </div>
                        </div>
                    </div>
                    <div class="disclaimer-container">
                        <p class="descHeading">Disclaimer</p>
                        <p class="descValue">
                            This calculator is provided for general information purpose and the results displayed are
                            indicative
                            only. Treat this as a general guide to understand savings and other benefits of installing a
                            solar
                            rooftop system. While every care has been taken to make the calculator accurate, accuracy of the
                            calculations depends on several variables which may affect the final result. These calculations
                            do
                            not
                            constitute a recommendation or advice to take up a photovoltaic system.</p>
                    </div>
                </div>
            </div>
        </div>
    </div>
    <!-- -------------------------------configuration----------------------- -->

    <InformationPopup v-if="isInformationPopupVisible"
        :isInformationPopupVisible="isInformationPopupVisible"
        :monthlyBill = "averageMonthlyBill"
        @user-verified= "isVarifiedUser = true"
        @close="isInformationPopupVisible = false"
        @fetch-finance-loader="isFetchingFinancialData = !isFetchingFinancialData"
        @everything-visible="isEverythingVisible = true" @financial-api-call="getFinancialData" />
    <InverterSpecificationPopup v-if="isInverterSpecificationPopupVisible"
        :specsData="financialData.inverter"
        :isSpecificationPopupVisible="isInverterSpecificationPopupVisible"
        @close="isInverterSpecificationPopupVisible = false" />
    <PanelSpecificationPopup v-if="isPanelSpecificationPopupVisible"
        :specsData="financialData.panel"
        :isSpecificationPopupVisible="isPanelSpecificationPopupVisible" @close="isPanelSpecificationPopupVisible = false" />
</template>


<script>

import InformationPopup from './informationPopup.vue';
import InverterSpecificationPopup from './inverterSpecificationPopup.vue';
import PanelSpecificationPopup from './panelSpecificationPopup.vue';
import { GOOGLE_API_KEY } from '../../services/api';
import axios from 'axios';
import EstimatedUtilityBill from '../../components/ui/charts/estimatedUtilityBill.vue';
import EstimatedMonthlySavings from '../../components/ui/charts/estimatedMonthlySavings.vue';
import BreakEvenAnalysis from '../../components/ui/charts/breakEvenAnalysis.vue';
import API from '../../services/api/waareeAPI'
import { appliancesList } from './assets/waareeData';
import {modifyBackupTime} from './utils/modifyBackupTime'
import EstimatedAnnualProduction from '../../components/ui/charts/estimatedAnnualProduction.vue';

function formatNumberWithCommas(val) {
    return val.toLocaleString(undefined, {minimumFractionDigits: 2, maximumFractionDigits: 2});
}

export default {
    components: {
        InformationPopup,
        InverterSpecificationPopup,
        PanelSpecificationPopup,
        EstimatedMonthlySavings,
        EstimatedUtilityBill,
        BreakEvenAnalysis,
        EstimatedAnnualProduction
    },

    data() {
        return {
            newAppliance:{
                name: "",
                size: 0,
                quantity: 1,
                hours: 0,
                isChecked: true,
                selected: false,
                isEssential: false,
            },
            errors: {
                name: '',
                size: false,
                quantity: false,
                hours: false,
                isChecked: true,
                selected: false,
                isEssential: false
            },
            addEquipment: false,
            enteredPin: null,
            isValidPin: false,
            isCalculatorVisible: false,
            isFetchingFinancialData: false,
            isEverythingVisible: false,
            activeGridSection: 'gridtied',
            isOffGridDisabled: true,
            isUpdatingInformation: false,
            isFetchingUserLocation: false,
            latitude: null,
            longitude: null,
            subsidyPercentage: 0,
            tooltipObj: {
                isTooltipOneVisible: false,
                isTooltipTwoVisible: false,
                isTooltipThreeVisible: false,
                isTooltipFourVisible: false,
            },
            sysSizeValue: null,
            sendingSystemSizeValue: false,
            freeSpaceAvailablePer: 75,
            freeSpaceAvailablePerInput: 75,
            isInformationPopupVisible: false,
            isInverterSpecificationPopupVisible: false,
            isPanelSpecificationPopupVisible: false,
            options: [
                {
                    value: true,
                    label: 'Yes',
                },
                {
                    value: false,
                    label: 'No',
                }
            ],
            appliancesList,
            value: '',
            averageMonthlyBill: null,
            avgMonthlyConsumption: null,
            totalRoofArea: null,
            isValidAvgMonthlyBill: true,
            isValidAvgMonthlyConsumption: true,
            isValidtotalRoofArea: true,
            appliances_consumption: 0,
            essential_load_consumption: 0,
            showInputs: false,
            iKnowMyElConsump: true,
            iDontKnowMyElConsump: false,
            eligibleForSubsidy: false,
            isCalculateEnable: false,
            isAddNewApplianceShow: false,
            activeEstimatedSection: "savings",
            financialData: {},
            leadId: null,
            isVarifiedUser: false,
            scrollOnce: true 
        }
    },

    updated() {
        if(this.isEverythingVisible && this.scrollOnce){
            this.scrollOnce = false
            const element = document.getElementById('recommendation');
            const position = element.getBoundingClientRect();
            window.scrollTo({
                left: position.left,
                top: position.top,
                behavior: "smooth",
            });
        }
    },

    methods: {
        validationFunc() {
            if(this.newAppliance.name.length == 0) {
                this.errors.name = true;
            } else {
                this.errors.name = false;
            }
            if(this.newAppliance.size.length == 0) {
                this.errors.size = true;
            } else {
                this.errors.size = false;
            }
            if(this.newAppliance.hours.length == 0) {
                this.errors.hours = true;
            } else {
                this.errors.hours = false;
            }
            if(this.newAppliance.quantity.length == 0) {
                this.errors.quantity = true;
            } else {
                this.errors.quantity = false;
            }
            if(this.errors.quantity == false && this.errors.hours == false &&  this.errors.size == false && this.errors.name == false) {
                this.addMoreAppliance();
            }
        },

        addEquipmentHandler() {
            this.addEquipment = true;
            const scrollbar = this.$refs.scrollbar;
            scrollbar.scrollTo(0, scrollbar.$el.scrollHeight);
        },

        addMoreAppliance() {
            this.appliancesList.push(this.newAppliance);
            this.newAppliance = {
                name: "",
                size: 0,
                quantity: 1,
                hours: 0,
                isChecked: true,
                selected: false,
                isEssential: false,
            }
            this.addEquipment = false;
        },

        displayCalculateButtonError(err) {
            this.$message({
                showClose: true,
                message: err,
                type: "error",
                center: true
            })
        },

        handleCalculateClick() {
            // this.getFinancialData({ leadId: 343 })
            // return
            let errorMessage;
            if (!this.avgMonthlyConsumption && !this.totalRoofArea && !this.averageMonthlyBill) {
                this.isValidAvgMonthlyBill = false;
                this.isValidAvgMonthlyConsumption = false;
                this.isValidtotalRoofArea = false;
                errorMessage = "Please fill required values."
                this.displayCalculateButtonError(errorMessage);
                return;
            }
            
            if(!this.averageMonthlyBill){
                this.isValidAvgMonthlyBill = false;
                errorMessage = "Average Monthly Eill Value is Required";
                this.displayCalculateButtonError(errorMessage);
                return;
            }

            if(!this.avgMonthlyConsumption){
                this.isValidAvgMonthlyConsumption = false;
                errorMessage = "Average Monthly Electricity Consumption Value is Required";
                this.displayCalculateButtonError(errorMessage);
                return;
            }

            if(!this.totalRoofArea){
                this.isValidtotalRoofArea = false;
                errorMessage = "Total Available Roof Area Value is Required";
                this.displayCalculateButtonError(errorMessage);
                return;
            }

            if(!this.hasValidRequiredArea()){
                errorMessage = 'Enter valid values for required area.' ;
                this.displayCalculateButtonError(errorMessage);
                return;
            }

            if(this.isVarifiedUser){
                this.getFinancialData({ leadId: this.leadId })
                return 
            }

            this.isInformationPopupVisible = true;
        },
        blurHandler(field) {
            if (field === 'one') {
                this.avgMonthlyConsumption ?
                    this.isValidAvgMonthlyConsumption = true :
                    this.isValidAvgMonthlyConsumption = false;
            } else if (field === 'two') {
                this.totalRoofArea ?
                    this.isValidtotalRoofArea = true :
                    this.isValidtotalRoofArea = false;
            } else if (field === 'three') {
                this.averageMonthlyBill ?
                    this.isValidAvgMonthlyBill = true :
                    this.isValidAvgMonthlyBill = false;
            }
        },
        showTooltipOne() {
            this.tooltipObj.isTooltipOneVisible = !this.tooltipObj.isTooltipOneVisible;
            this.tooltipObj.isTooltipTwoVisible = false;
            this.tooltipObj.isTooltipThreeVisible = false;
            this.tooltipObj.isTooltipFourVisible = false;
        },

        showTooltipTwo() {
            this.tooltipObj.isTooltipOneVisible = false;
            this.tooltipObj.isTooltipTwoVisible = !this.tooltipObj.isTooltipTwoVisible;
            this.tooltipObj.isTooltipThreeVisible = false;
            this.tooltipObj.isTooltipFourVisible = false;
        },
        showTooltipThree() {
            this.tooltipObj.isTooltipOneVisible = false;
            this.tooltipObj.isTooltipTwoVisible = false;
            this.tooltipObj.isTooltipThreeVisible = !this.tooltipObj.isTooltipThreeVisible;
            this.tooltipObj.isTooltipFourVisible = false;
        },

        showTooltipFour() {
            this.tooltipObj.isTooltipOneVisible = false;
            this.tooltipObj.isTooltipTwoVisible = false;
            this.tooltipObj.isTooltipThreeVisible = false;
            this.tooltipObj.isTooltipFourVisible = !this.tooltipObj.isTooltipFourVisible;
        },
        iKnowBtn() {
            this.iKnowMyElConsump = true;
            this.iDontKnowMyElConsump = false;
        },

        iDontKnowBtn() {
            this.iKnowMyElConsump = false;
            this.iDontKnowMyElConsump = true;
        },
        accordianForMobileOne() {
            let element = document.getElementsByClassName("bodyContainerAppl")[0];
            element.classList.toggle("openBodyForMobile");
        },
        accordianForMobileTwo() {
            let element = document.getElementsByClassName("bodyContainerApplForMobile")[0];
            element.classList.toggle("openBodyForMobile");
            let ele = document.getElementsByClassName('headerApplForMobile')[0];
            ele.classList.toggle('borderRadius');
        },
        async getCoordinates(address) {
            const qParams={
                            pincode:pincode,
                        }
            const response = await API.STUDIO_API.GET_GMAPS_JSON(qParams);
            const location = response.data.results[0]?.geometry?.location
            this.latitude = location.lat;
            this.longitude = location.lng;
        },
        handleLocationSubmit() {
            if (this.isValidPin) {
                this.isCalculatorVisible = true;
                this.getCoordinates(this.enteredPin)
            } else {
                alert('enter 6 digit pincode')
            }
        },
        getUserLocation() {
            this.isFetchingUserLocation = true;
            const successCallback = async (position) => {
                const long = position.coords.longitude;
                const lat = position.coords.latitude;

                const response = await axios.get(`https://maps.googleapis.com/maps/api/geocode/json?latlng=${lat},${long}&key=${GOOGLE_API_KEY}`);

                const results = response.data.results[0];
                let addressComponent = results?.address_components?.filter((el) => {
                    return el.types[0] === "postal_code";
                })
                this.isFetchingUserLocation = false;
                this.enteredPin = addressComponent[0].long_name;
            }

            const errorCallback = () => {
                alert('Something went wrong try again')
                this.isFetchingUserLocation = false;
            }
            navigator.geolocation.getCurrentPosition(successCallback, errorCallback);
        },
        async getFinancialData(value) {

            this.leadId = value.leadId;
            this.isEverythingVisible = false;
            this.isFetchingFinancialData = true;
            this.isInformationPopupVisible = false;
            this.calculateApplianceConsumption();
            this.calculationEssentialLoadConsumption();
            const body = this.createPayloadForFinancialDataRequest();
            try {
                const response = await API.GET_FINANCIAL_DATA(value.leadId, body);
                this.isFetchingFinancialData = false;
                if (response.status === 200) {
                    this.isEverythingVisible = true;
                    this.financialData = response.data
                    this.sysSizeValue = this.financialData.project_size
                }
            } catch (error) {
                this.isFetchingFinancialData = false;
                this.$message({
                    showClose: true,
                    message: "There was an error while fetching the financial data information.",
                    type: "error",
                    center: true
                })
            }

        },
        increaseSystemSize() {
            let val = Math.floor(this.sysSizeValue)
            val++
            this.sysSizeValue = val
            this.getUpdatedFinancialData()
        },
        decreaseSystemSize() {
            let val = Math.floor(this.sysSizeValue)
            val--
            val = Math.max(val, 1)
            this.sysSizeValue = val
            this.getUpdatedFinancialData()
        },
        async getUpdatedFinancialData() {
            this.isUpdatingInformation = true
            let extraPayload = {
                dc_size: this.sysSizeValue
            }
            const body = this.createPayloadForFinancialDataRequest(extraPayload);
            const response = await API.GET_FINANCIAL_DATA(this.leadId, body);
            if (response.status === 200) {
                this.financialData = response.data
            }
            this.isUpdatingInformation = false
        },
        handleSysSizeValueChange(event) {
            if (event.target.id === "increaseSysSizeValue") {
                this.sysSizeValue += 1;
            } else if (event.target.id === "decreaseSysSizeValue" && this.sysSizeValue > 1) {
                this.sysSizeValue -= 1;
            } else {
                this.$message({
                    showClose: true,
                    message: "Estimated system size can't be less than 1.",
                    type: "error",
                    center: true
                })
            }
        },
        calculateApplianceConsumption() {
            let total = 0
            this.appliancesList.forEach(appliance => {
                if (!appliance.isChecked) { return }
                total += ((Number(appliance.size) / 1000) * Number(appliance.quantity) * Number(appliance.hours))
            });
            this.appliances_consumption = total;
        },
        calculationEssentialLoadConsumption() {
            let total = 0
            this.appliancesList.forEach(appliance => {
                if (!appliance.isChecked) { return }
                if(appliance.isEssential){
                    total += ((Number(appliance.size) / 1000) * Number(appliance.quantity) * Number(appliance.hours))
                }
            });
            this.essential_load_consumption = total;
        },
        createPayloadForFinancialDataRequest(extras) {
            extras ||= {}
            const body = {
                latitude: this.latitude,
                longitude: this.longitude,
                monthly_bill: this.averageMonthlyBill  ,
                electricity_consumption: this.avgMonthlyConsumption,
                available_roof_area: this.totalRoofArea,
                percentage_free_space_available: this.freeSpaceAvailablePer,
                appliances_consumption: this.appliances_consumption,
                essential_load_consumption: this.essential_load_consumption,
                ...extras
            }

            if(this.eligibleForSubsidy){
                body.subsidy_percentage = this.subsidyPercentage !== ""
                                            ? this.subsidyPercentage
                                            : 0
            }

            return body
        },
        hasValidRequiredArea() {

            const required_area = 
                Math.round(((this.totalRoofArea * this.freeSpaceAvailablePer) / 100), 2)
            console.log('required_area',required_area);
            if( required_area < 200 ) return false;
            else return true;
        },
        formatNumberWithCommas
    },
    watch: {
        enteredPin(value) {
            if (value.length === 6) {
                this.isValidPin = true;
            } else {
                this.isValidPin = false;
            }
        },

        freeSpaceAvailablePerInput(value) {
            if(value === ""){
                this.freeSpaceAvailablePer = 0;
            }else{
                this.freeSpaceAvailablePer = value;
            }
        },
        freeSpaceAvailablePer(value) {
            this.freeSpaceAvailablePerInput = this.freeSpaceAvailablePer;
        },
        averageMonthlyBill(value) {
            value ? this.isValidAvgMonthlyBill = true :
                this.isValidAvgMonthlyBill = false;
        },

        avgMonthlyConsumption(value) {
            value ? this.isValidAvgMonthlyConsumption = true :
                this.isValidAvgMonthlyConsumption = false;
        },
        totalRoofArea(value) {
            value ? this.isValidtotalRoofArea = true :
                this.isValidtotalRoofArea = false;
        },
        essential_load_consumption(value) {
            if(value === 0){
                this.isOffGridDisabled = true;
                this.activeGridSection = 'gridtied'
            }else{
                this.isOffGridDisabled = false;
            }
        }
    },
    computed: {
        pinCodePlaceholder() {
            return this.isFetchingUserLocation ? "Fetching your location...." : "Enter your area pin code"
        },

        productionData() {
            let mainArray = this.financialData.monthly_table.values;
            mainArray.pop();
            let finalArray = [];
            for (let item in mainArray) {
                finalArray.push(mainArray[item][5]);
            }

            let lastArray = finalArray.map(str => {
                return parseFloat(str.replace(',', ''));
            })
            return lastArray;
        },

        averageMonthlyGeneration() {
            let avg = this.financialData.annual_generation / 12
            avg = avg.toFixed(2)
            return avg
        },

        onStorageOnly() {
            return modifyBackupTime(this.financialData.backup_on_storage)
        },

        onStorageWithEssentialLoad() {
            return modifyBackupTime(this.financialData.backup_on_load)
        },

        onSolarAndStorage() {
            return modifyBackupTime(this.financialData.backup_on_storage_and_solar)
        },

        emiDownPayment() {
            let systemCost = this.financialData.system_cost
            let val = 0.3 * systemCost
            return formatNumberWithCommas(val)
        },

        emiLoanAmount() {
            let systemCost = this.financialData.system_cost
            let val = 0.7 * systemCost
            return formatNumberWithCommas(val)
        }
    }
}
</script>

<style scoped>
.slider-demo-block {
    display: flex;
    align-items: center;
}

.slider-demo-block .el-slider {
    margin-top: 0;
    margin-left: 12px;
}

.slider-demo-block .demonstration {
    font-size: 14px;
    color: var(--el-text-color-secondary);
    line-height: 44px;
    flex: 1;
    overflow: hidden;
    text-overflow: ellipsis;
    white-space: nowrap;
    margin-bottom: 0;
}

.slider-demo-block .demonstration+.el-slider {
    flex: 0 0 70%;
}

.sliderCont>>>.el-slider__bar {
    height: 8px;
    background-color: #0db02b;
    border-top-left-radius: var(--el-slider-border-radius);
    border-bottom-left-radius: var(--el-slider-border-radius);
    position: absolute;
}

.sliderCont>>>.el-slider__button {
    width: 24px;
    height: 24px;
    border: 4px solid #0db02b;
}

.sliderCont>>>.slider-demo-block {
    display: flex;
    align-items: center;
    margin-left: -11px;
}
</style>

<style lang="scss" scoped>
@font-face {
    font-family: "ceraPro";
    src: url(./assets/fonts/CeraProMedium.otf);
}

// ---------------------------------------mixins------------------------------------------

@mixin bold-font-20 {
    color: #000;
    font-size: 20px;
    font-weight: bold;
}

@mixin regular-font-20 {
    color: #000;
    font-size: 20px;
    font-weight: normal;
}

@mixin bold-font-16 {
    color: #000;
    font-size: 16px;
    font-weight: bold;
}

@mixin regular-font-16 {
    color: #000;
    font-size: 16px;
    font-weight: normal;
}

p,
h3,
input,
button,
label {
    font-family: "ceraPro";
    word-break: break-word;
}

.errorText {
    font-size: 14px;
    color: red;
    margin-top: 4px;
}

.waareeParentContainer {
    position: relative;
    width: 100%;
}

.pinCodeContainerfullwidth {
    background-image: linear-gradient(to bottom, #e8edf2, #e8edf2);
    padding-bottom: 40px;
    padding-top: 50px;
}

.pinCodeContainer {
    margin: auto;
    width: 80%;
}

.firSection {
    width: 80%;
    margin: auto;
    padding-bottom: 72px;
    padding-top: 40px;
}

.flexCont {
    display: grid;
    grid-template-columns: 100%;
    grid-gap: 56px;
    align-items: flex-start;
}

.inputsContainer {
    width: 100%;
}

.inputCont {
    width: 100%;
    margin-bottom: 16px;
    display: flex;
}

.inputCont form {
    width: 100%;
}

.firstInput {
    height: 48px;
    border: 1px solid #999;
    background-color: #fff;
    width: calc(100% - 108px);
    padding-left: 16px;
    padding-right: 16px;
    @include regular-font-16;

}

.submitBtn {
    @include bold-font-16;
    border: solid 1px #999;
    background-color: #ffdb27;
    height: 48px;
    width: 108px;
    border-left: none;
    cursor: pointer;
}

.currLocation {
    @include bold-font-16;
    text-decoration: underline;
    cursor: pointer;


}

.currLocation::before {
    content: "";
    display: block;
    background: url("./assets/img/location.svg") no-repeat;
    width: 14px;
    height: 18px;
    float: left;
    margin: 0 6px 0 0;
}

.iKnowContainer {
    position: relative;
    display: grid;
    grid-template-columns: 1fr auto 1fr;
    grid-gap: 16px;
    align-items: center;
    margin-bottom: 36px;
}

.iKnowBtn {
    @include bold-font-20;
    height: 60px;
    box-shadow: inset 0 -3px 6px 0 rgba(0, 0, 0, 0.16);
    background-color: #0db02b;
    color: #fff;
    border: none;
    border-radius: 8px;
    position: relative;
    cursor: pointer;
}


.iKnowBtn::after {
    content: "";
    position: absolute;
    bottom: -20px;
    left: 50%;
    transform: translate(-50%, 0%);
    border-width: 10px;
    border-style: solid;
    border-color: #0db02b transparent transparent transparent;
}

.orCont {
    width: 36px;
    height: 36px;
    display: grid;
    place-items: center;
    background-color: #ffdb27;
    font-size: 14px;
    font-weight: bold;
    color: #000;
    border-radius: 50%;


}

.iDontKnowBtn {
    @include bold-font-20;
    height: 60px;
    color: #777;
    border: none;
    border-radius: 8px;
    box-shadow: inset 0 -3px 6px 0 rgba(0, 0, 0, 0.16);
    background-image: linear-gradient(to bottom, #f5f7fa, #e8edf2);
    position: relative;
    cursor: pointer;


}

.heading {
    font-size: 24px;
    font-weight: bold;
    color: #0db02b;
    margin-bottom: 24px;
}

.tableHeader {
    display: grid;
    grid-template-columns: 1.5fr 1.4fr 1.4fr 1.2fr 136px;
    gap: 24px;
    min-height: 56px;
    background-color: #e8edf2;
    padding: 16px 24px;
    border-top-left-radius: 8px;
    border-top-right-radius: 8px;
    border: solid 1px #ccc;
    border-bottom: 0px;
}

.headerTitle {
    color: #000;
    font-size: 16px;
    font-weight: 600;
}

.mdTitle {
    display: none;
}

.wrapper {
    border-radius: 12px;
    box-shadow: 0 2px 4px 0 rgba(0, 0, 0, 0.16);
    border: solid 1px #ccc;
    border-top-right-radius: 0px;
    border-top-left-radius: 0px;
    background-color: #fff;
    border-top: 0px;
    margin-bottom: 32px;
}

.waareeParentContainer :deep() .el-scrollbar__wrap {
    position: relative;
    padding: 24px 24px 8px 24px;
    word-break: break-word;
    height: 450px;
    overflow: hidden;
    overflow-y: scroll;
    // border-radius: 12px;
    // box-shadow: 0 2px 4px 0 rgba(0, 0, 0, 0.16);
    // border: solid 1px #ccc;
    // border-top-right-radius: 0px;
    // border-top-left-radius: 0px;
    // background-color: #fff;
    // border-top: 0px;
    // margin-bottom: 32px;
}

.tableInputsContainer {
    display: flex;
    flex-direction: column;
    gap: 16px;
    margin-bottom: 24px;
}

.tableInputCont {
    display: grid;
    grid-template-columns: 1.5fr 1.4fr 1.4fr 1.2fr 136px;
    gap: 24px;
    align-items: center;
}

.flexStart {
    align-items: flex-start;
}

.inpDiv {
    position: relative;
}

.inputTag,
.addInputTag {
    position: relative;
    height: 48px;
    width: 100%;
    font-size: 16px;
    color: #222;
    padding: 16px 12px;
    box-sizing: border-box;
    outline: none;
    border: 1px solid #999;
    border-radius: 8px;
    background-color: #fff;
}

.kwhInp,
.inpDiv {
    max-width: 125px;
}

.kwhInp {
    padding-right: 48px;
}

.usageHrInp,
.noOfApplInp {
    max-width: 136px;
}

.units {
    position: absolute;
    top: 14px;
    right: 12px;
    font-size: 16px;
    color: #000;
    z-index: 1;
}

.inputsBox {
    display: flex;
    align-items: center;
    gap: 40px;
    margin-bottom: 24px;
}

.tableFlexCont {
    display: flex;
    align-items: center;
    gap: 8px;
}

.inpLabel {
    @include regular-font-16;
    width: 200px;
}

.inputAMEC {
    height: 48px;
    border: 1px solid #999;
    position: relative;
    width: 100%;
    padding-left: 16px;
    padding-right: 16px;
    @include regular-font-16;
}

.inpOne,
.inpTwo,
.inpBill {
    width: 80%;
    position: relative;
    max-width: 600px;
}

.inpOne::after,
.inpTwo::after,
.inpBill::after {
    @include regular-font-16;
    content: 'Units (kWh)';
    position: absolute;
    top: 14px;
    right: 16px;
}

.inpTwo::after {
    content: 'Sq. Ft.';
}

.inpBill::after {
    content: '₹';
}

.requiredField {
    color: #e32;
    font-size: 18px;
    font-weight: 600;
}

.requiredFieldText {
    color: #e32;
    font-size: 12px;
    font-weight: 300;
    word-spacing: 1px;
    letter-spacing: 0.2px;
}

.smallInpCont {
    position: relative;
}


.containerWithSlider{
    display: flex;
    justify-content: start;
    align-items: center;
}

.inputWithSlider{
    text-align: end;
}

.sliderPercentage{
    height: 100%;
    margin-left: -1.5rem;
    z-index: 10;
}
.additionalInpCont {
    margin-top: 16px;
    width: 344px;
}

.subsidyInput {
    height: 48px;
    width: 100%;
    border: 1px solid #999;
    position: relative;
    width: 100%;
    padding-left: 40px;
    padding-right: 16px;
}

.smallInpUnit {
    position: absolute;
    top: 14px;
    right: 16px;
}

.smallInpUnitTwo {
    position: absolute;
    top: 14px;
    left: 16px;
}

.sliderContainer {
    display: flex;
    align-items: center;
    justify-content: space-between;
    position: relative;
    width: 80%;
    gap: 16px;
    max-width: 600px;
}

.sliderCont {
    width: 80%;
    position: relative;
}

.percentContainer {
    display: grid;
    grid-template-columns: 23% 25% 25% 20% auto;
}

.commonPercent {
    @include regular-font-16;
    font-family: 'ceraPro';
    white-space: nowrap;
}

.commonPercent:before {
    content: '|' '';
    display: block;
    margin-left: 7px;
    margin-top: -10px;
    font-size: 12px;
}

.zeroPercent::before {
    margin-left: 3px;
}

.hundredPercent {
    text-align: right;
}

.smallInp {
    width: 96px;
    padding-right: 36px;
}

.checkboxFlex {
    justify-content: flex-start;
    align-items: center;
    gap: 0.5em;
}

input[type=checkbox] {
    position: relative;
    cursor: pointer;
    width: 26px;
    height: 26px;
    accent-color: #ffdb27;
}

input[type=checkbox]:before {
    content: "";
    display: block;
    width: 24px;
    height: 24px;
    color: #fff;
}

.knowMore {
    font-family: "ceraPro";
    font-weight: bold;
    text-decoration: underline;
    cursor: pointer;
    text-decoration-color: none;
}

.calBtn {
    @include bold-font-20;
    width: 168px;
    height: 56px;
    border-radius: 4px;
    background-color: #ffdb27;
    border: none;
    cursor: pointer;
    position: relative;
    display: flex;
    justify-content: center;
    align-items: center;
    gap: 12px;
    margin-top: 40px;
}

.calBtn::after {
    content: "";
    display: block;
    background: url("./assets/img/Exclusion.svg") no-repeat;
    width: 24px;
    height: 24px;
    float: left;
}


.appliancesContainer {
    position: absolute;
    width: 100%;
    border-radius: 12px;
    box-shadow: 0 2px 4px 0 rgba(0, 0, 0, 0.16);
    border: 1px solid #ccc;
    background-color: #fff;
    top: 80px;
    z-index: 10;
}

.headerAppl {
    height: 48px;
    display: grid;
    grid-template-columns: 1fr 1fr;
    align-items: center;
    padding: 0px 24px;
    gap: 24px;
    border-bottom: 2px solid #ccc;
}

.headerApplForMobile,
.bodyContainerApplForMobile {
    display: none
}

.headerHeading {
    @include bold-font-16;
    color: #777;
}

.bodyContainerAppl {
    height: 315px;
    overflow: hidden;
    overflow-y: scroll;
    padding: 8px 24px 24px 24px;
}

.bodyContainerAppl::-webkit-scrollbar {
    width: 4px;
}

.optionsContAppl {
    display: grid;
    grid-template-columns: 1fr 1fr;
    gap: 24px;
}

.optionBoxAppl,
.addOptBox {
    display: flex;
    justify-content: space-between;
    gap: 16px;
    align-items: center;
}

.boxAppl {
    padding: 13px 0px 12px 0px;
    min-height: 48px;
    border-bottom: 1px solid #ccc;
}

.addOptBox {
    margin-top: 14px;
}

.inpContAppl,
.inpContAddAppl {
    display: grid;
    grid-template-columns: auto 60px 60px 25px;
    gap: 16px;
    align-items: center;
}

.inpContAddAppl {
    grid-template-columns: 180px auto 60px 90px;
}

.TableLabels {
    font-size: 16px;
    color: #777;
    margin-bottom: 4px;
}

.waareeParentContainer :deep() .el-input__inner {
    @include regular-font-16;
    height: 40px;
}

.waareeParentContainer :deep() .el-input {
    border-radius: 4px;
    height: 48px;
    outline: none;
    max-width: 136px;
}

.waareeParentContainer :deep() .el-select .el-input .el-select__caret {
    @include bold-font-20;
}

.crossIconAppl {
    margin-left: -8px;
    cursor: pointer;
    margin-top: 24px;
}

.plusIconAppl,
.greenCircle {
    cursor: pointer;
}

.greenCircleCont,
.flexContTable {
    display: flex;
    align-items: center;
    gap: 8px;
    padding-top: 12px
}

.flexContTable {
    padding-top: 0px
}

.greenTxt {
    @include regular-font-16;
    color: #0db02b;
    text-decoration: underline;
    cursor: pointer;
}

.plusIconApplChild {
    cursor: pointer;
    margin-top: 24px;
}

.applInp {
    width: 100%;
    height: 40px;
    border-radius: 4px;
    border: 1px solid #999;
    padding: 8px;
}

.firImg {
    width: 100%;
}

/* ---------------------------------our recommendation----------------------- */

.secSection {
    width: 100%;
    background-color: #effff3;
    padding: 50px 10vw;
}

.secSectionChild {
    margin: auto;
}

.commonHeading {
    margin-bottom: 45px;
    color: #000;
    text-align: center;
    font-size: 60px;
    font-weight: bold;


}

.commonGridContainer {
    display: grid;
    grid-template-columns: 1fr 1fr 1fr;
    grid-gap: 52px;
}

.marginBottom {
    margin-bottom: 120px;
    grid-template-columns: 1fr 1fr 1fr 1fr;
    gap: 24px;
}

.gridBox {
    min-height: 208px;
    padding: 24px;
    border-radius: 24px;
    box-shadow: inset -8px -8px 10px 0 rgba(0, 0, 0, 0.2);
    border: 1px solid #d6d6d6;
    background-color: #0db02b;
    display: grid;
    place-items: center;
    gap: 14px;
    text-align: center;


}

.gridBoxP,
.valueP {
    @include regular-font-20;
    color: #fff;


}

.valueP {
    font-size: 30px;
    font-weight: 600;
}

.counterBox {
    display: flex;
    align-items: center;
    gap: 16px;
}

.minusBox,
.addBox {
    width: 32px;
    height: 32px;
    cursor: pointer;
    display: grid;
    place-items: center;
    user-select: none;
    color: #777;
    font-size: 24px;
    font-weight: 600;
    border-radius: 4px;
    box-shadow: inset -2px -2px 6px 0 #b2b2b2;
    border: 1px solid#e6e6e6;
    background-color: #fff;


}

.counterInput {
    width: 124px;
    height: 54px;
    text-align: center;
    border-radius: 8px;
    border: 2px solid #3ec457;
    background-color: #0a9724;
    font-size: 30px;
    color: #fff;
    font-weight: bold;

}

.graphSAndP {
    width: 100%;
    margin: 40px auto 65px auto;

}

.graphSAndPTwo {
    width: 100%;
    margin: 63px auto auto auto;
}

/* <!-- -------------------------------our recommendation----------------------- --> */

.thrSection {
    position: relative;
    width: 100%;
    background-color: #1c6730;
    /* padding: 72px 0px 0px 0px */
}

.backLeftDark {
    position: absolute;
    top: 0;
    left: 0;
    width: 12%;
    max-width: 190px;
}

.backRightDark {
    position: absolute;
    bottom: 0;
    right: 0;
    width: 12%;
}

.backRightLight {
    position: absolute;
    bottom: 0;
    right: 0;
    width: 6%;
    max-width: 120px;
}

.thrSectionChild {
    width: 80%;
    margin: auto;
    padding-bottom: 5em;
    padding-top: 72px;
}

.secSectionChild {
    margin: auto;
}

.whiteHeading {
    font-size: 60px;
    font-weight: bold;
    color: #fff;
    text-align: center;
    margin-bottom: 60px;


}

.gridContainer {
    display: flex;
    justify-content: center;
    gap: 48px;
}

.gridBoxTwo {
    width: 440px;
    border-radius: 24px;
    box-shadow: inset -8px -8px 10px 0 rgba(0, 0, 0, 0.2);
    border: solid 1px #d6d6d6;
    background-color: #fff;
    display: grid;
    place-items: center;
    gap: 14px;
    padding: 24px;
    text-align: center;
}

.gridBoxPTwo,
.valuePTwo {
    @include regular-font-20;
    line-height: 1.5;
}

.valuePTwo {
    font-size: 30px;
    font-weight: 600;
}

.tooltipIcon {
    width: 17px;
    cursor: pointer;
}

.flexContTwo {
    display: flex;
    gap: 24px;
    justify-content: center;
    align-items: flex-start;
    text-align: center;
}

.hrLine {
    width: 1px;
    color: #222;
    height: 48px;
    border: 1px solid #222;
}

.warranty {
    @include regular-font-20;
}


/* ----------------------------------------contribution----------------------- */


.frSection {
    position: relative;
    padding: 80px 0 100px 0;
    background-color: white;
}

.frSectionChild {
    width: 80%;
    margin: auto;
}

.gridContainerFr {
    display: grid;
    grid-template-columns: 1fr 1fr;
    gap: 40px;
}

.gridBoxFr {
    display: flex;
    gap: 24px;
    align-items: center;
    padding: 24px;
    border-radius: 12px;
    background-color: #f5f5f5;
}


/* <!-- -------------------------------s0lar today----------------------- --> */


.gridContST {
    display: flex;
    justify-content: space-around;
    gap: 30px;
    align-items: center;
    border-radius: 24px;
    box-shadow: inset -8px -8px 10px 0 rgba(0, 0, 0, 0.2);
    border: 1px solid #d6d6d6;
    background-color: #fff;
    padding: 24px;
    z-index: 1;
    position: relative;
}

.gridBoxST {
    display: flex;
    flex-direction: column;
    text-align: center;
    justify-content: center;
}

.flexContTooltipCont {
    display: flex;
    gap: 6px;
    align-items: center;
    justify-content: center;
}

.commonIconST {
    width: 64px;
    height: 64px;
    margin: auto;
    margin-bottom: 16px;
}



.radioBtnPVS {
    position: relative;
    margin-bottom: 120px;
    padding-bottom: 1px;
    margin-top: 40px;
}

.labelOnePVS,
.labelTwoPVS {
    display: inline-block;
    width: 55%;
    height: 80px;
    padding: 10px;
    transition: all 0.3s;
    border-radius: 40px;
    position: absolute;
    cursor: pointer;
    background-color: #ebf9ee;
    font-weight: bold;
}

.gridTiedLabel,
.offGridLabel{
    display: inline-block;
    width: 55%;
    height: 80px;
    padding: 10px;
    transition: all 0.3s;
    border-radius: 40px;
    position: absolute;
    cursor: pointer;
    background-color: #ebf9ee;
    font-weight: bold; 
}

.gridTiedLabel {
    margin-left: auto;
    margin-right: auto;
    left: 0;
    right: 45%;
    text-align: center;
    align-items: center;
    display: flex;
    justify-content: center;
    font-size: 24px;
    color: #777;
}

.offGridLabel{
    margin-left: auto;
    margin-right: auto;
    left: 45%;
    right: 0;
    text-align: center;
    align-items: center;
    display: flex;
    justify-content: center;
    font-size: 24px;
    color: #777;
}

.labelOnePVS {
    margin-left: auto;
    margin-right: auto;
    left: 0;
    right: 45%;
    text-align: center;
    align-items: center;
    display: flex;
    justify-content: center;
    font-size: 24px;
    color: #777;
}

.labelTwoPVS {
    margin-left: auto;
    margin-right: auto;
    left: 45%;
    right: 0;
    text-align: center;
    align-items: center;
    display: flex;
    justify-content: center;
    font-size: 24px;
    color: #777;
}


.boxed input[type="radio"] {
    display: none;
}

.boxed input[type="radio"]:checked+.gridTiedLabel {
    background-color: #ffdb27;
    color: #000;
    z-index: 1;
    box-shadow: inset 0 -3px 6px 0 rgba(0, 0, 0, 0.16);
}

.boxed input[type="radio"]:checked+.offGridLabel {
    background-color: #ffdb27;
    color: #000;
    z-index: 1;
    box-shadow: inset 0 -3px 6px 0 rgba(0, 0, 0, 0.16);
}

.boxed input[type="radio"]:checked+.labelOnePVS {
    background-color: #ffdb27;
    color: #000;
    z-index: 0;
    box-shadow: inset 0 -3px 6px 0 rgba(0, 0, 0, 0.16);
}

.boxed input[type="radio"]:checked+.labelTwoPVS {
    background-color: #ffdb27;
    color: #000;
    z-index: 0;
    box-shadow: inset 0 -3px 6px 0 rgba(0, 0, 0, 0.16);
}

.containerUtlityRateToggle {
    width: 90%;
    margin: 20px auto;
}

.flexContSavings {
    display: flex;
    gap: 56px;
}

.graphCont {
    width: 60%;
}

.graphContent {
    @include regular-font-20;
    color: #263342;
    line-height: normal;
    margin-bottom: 16px;


}

.graphImg {
    width: 100%;
}

.graphSideContPVS {
    border-radius: 24px;
    box-shadow: inset -6px -6px 10px 0 rgba(0, 0, 0, 0.12);
    border: 1px solid #d6d6d6;
    background-color: #fff;
    padding: 24px;
    height: max-content;
}

.estAvgPVS,
.estRateValPVS {
    @include regular-font-20;
    margin-bottom: 8px;


}

.estRateValPVS {
    color: #0db02b;
}

.disclaimer-container {
    width: 90%;
    margin: auto;
}

.descHeading {
    @include regular-font-16;
    color: #777;
    margin-bottom: 24px;
    margin-top: 40px
}

.descValue {
    @include regular-font-16;
    color: #777;
}


.hover_information {
    display: inline-block;
    position: relative;
}

.hover_information .tooltip {
    position: absolute;
    width: 312px;
    left: 50%;
    top: 32px;
    transform: translate(-50%, 0%);
    border-radius: 4px;
    padding: 16px;
    // visibility: hidden;
    // opacity: 0;
    box-shadow: 0 3px 6px 0 rgba(0, 0, 0, 0.16);
    border: solid 1px #d6d6d6;
    background-color: #fff;
    transition: all ease-in-out 0.35s;
    z-index: 100;
    display: grid;
    place-items: center;
    gap: 12px;
}

.hover_information .tooltipBP {
    width: 350px;
}

.hover_information .tooltipEMI {
    width: 600px;
    display: grid;
    grid-template-columns: 60% 40%;
    align-items: flex-start;
    text-align: left;
    z-index: 100000000;
}

.hover_information .tooltip .tooltipHeading {
    margin: 0;
    line-height: 1.4;
    @include regular-font-20;
    word-break: break-word;
}

.tooltipLink {
    @include regular-font-20;
    color: #00a8ff;
    text-decoration: underline;
    cursor: pointer;
}

.tooltipContent {
    @include regular-font-16;
    line-height: 1.75;
}

.tooltipBoxOne {
    padding-right: 24px;
    border-right: 1px solid #ccc;
    width: 100%;
}

.tooltipBoxTwo {
    padding-left: 10px;
    width: 100%;
}

.tooltipGreenHeading {
    @include bold-font-20;
    color: #0db02b;
    margin-bottom: 10px;
}

.calculations {
    font-size: 14px;
    color: #777;
    padding-top: 4px;
}

.tooltipFlex {
    display: flex;
    justify-content: space-between;
    align-items: flex-start;
    gap: 10px;
    margin-bottom: 10px;
}

.tooltipULList {
    margin-bottom: 10px;
}

.tooltipULList::before {
    content: '';
    height: 8px;
    width: 8px;
    background-color: #000;
    border-radius: 50%;
    display: inline-block;
    margin-right: 10px;

}

.hover_information .tooltipIcon:hover~.tooltip {
    opacity: 1;
    visibility: visible;
}

/* Chrome, Safari, Edge, Opera */
input::-webkit-outer-spin-button,
input::-webkit-inner-spin-button {
    -webkit-appearance: none;
    margin: 0;
}

/* Firefox */
input[type=number] {
    appearance: none;
    -moz-appearance: textfield;
}

.inputsGroupContainer :deep() .el-checkbox {
    margin-top: 0px;
}

.inputsGroupContainer :deep() .el-checkbox__inner {
    width: 24px;
    height: 24px;
    background-color: #fff;
    border: 1px solid #999;
    border-radius: 4px;
}

.inputsGroupContainer :deep() .el-checkbox__input.is-checked .el-checkbox__inner {
    background-color: #0db02b;
}

.inputsGroupContainer :deep() .el-checkbox-group {
    display: flex;
    gap: 70px;
}

.inputsGroupContainer :deep() .el-checkbox-group {
    gap: 24px;
}

.inputsGroupContainer :deep() .el-checkbox__inner::after {
    border: 3px solid var(--el-checkbox-checked-icon-color);
    border-left: 0;
    border-top: 0;
    height: 12px;
    left: 7px;
    top: 2px;
    width: 4px;
}

.inputsGroupContainer :deep() .el-checkbox__label {
    font-size: 16px;
    color: #000;
    padding-left: 16px;
    white-space: break-spaces;
}

.inputsGroupContainer :deep() .el-select .el-input__wrapper {
    outline: none;
    border: 1px solid #999;
    border-radius: 8px;
    box-shadow: none;
}

.inputsGroupContainer :deep() .el-input__inner {
    height: 48px;
    font-size: 16px;
    color: #222;
}

.inputsGroupContainer :deep() .el-select .el-input .el-select__caret {
    color: #222;
    font-size: 18px;
}

.addMoreApplCont {
    height: 55px;
    width: 100%;
    border-top: 1px solid #ccc;
    display: grid;
    align-items: center;
}

.addEquipment {
    font-size: 16px;
    font-weight: bold;
    color: #0db02b;
    cursor: pointer;
    padding-left: 24px;
}

.addEquipment::before {
    content: '';
    background-image: url('./assets/img/plus-circle-fill.svg');
    background-repeat: no-repeat;
    width: 20px;
    height: 20px;
    display: block;
    float: left;
    margin: 0 6px 0 0;
    cursor: pointer;
}

.tickIcon {
    cursor: pointer;
}

.mdLabel {
    display: none;
}


@media (max-width: 1300px) {

    .firSection,
    .thrSectionChild,
    .frSectionChild,
    .pinCodeContainer {
        width: 90%;
    }
}

@media (max-width: 1100px) {

    .commonHeading,
    .whiteHeading {
        font-size: 40px;
    }

    .commonGridContainer {
        gap: 24px;
    }

    .gridContST {
        gap: 16px;
        align-items: flex-start;
    }

    .gridBox,
    .gridBoxTwo {
        padding: 24px 16px;
    }

    .valueP {
        font-size: 26px;
    }

    .hrLine {
        height: 80px;
    }

    .gridBoxST {
        width: 32%;
    }

    .labelOnePVS,
    .labelTwoPVS {
        font-size: 20px;
    }

    .gridTiedLabel,
    .offGridLabel{
        font-size: 20px;
    }

    .gridTiedLabel{
        padding-right: 50px;  
    }
    .labelOnePVS {
        padding-right: 50px;
    }

    .offGridLabel{
        padding-left: 50px;
    }
    .labelTwoPVS {
        padding-left: 50px;
    }

    .flexContSavings {
        flex-direction: column;
        gap: 24px;
    }

    .graphCont {
        width: 100%;
    }

    .marginBottom {
        margin-bottom: 80px;
        grid-template-columns: 1fr 1fr;
    }

    .hover_information .tooltip .tooltipHeading,
    .tooltipLink {
        font-size: 16px;
    }

    .hover_information .tooltip {
        width: 250px;
    }

    .hover_information .tooltipBP {
        width: 350px;
    }

    .hover_information .tooltipEMI {
        width: 550px;
    }

    .inpContAppl,
    .inpContAddAppl {
        grid-template-columns: auto auto;
    }

    .tableInputCont,
    .tableHeader {
        gap: 16px;
    }

    .waareeParentContainer :deep() .el-scrollbar__wrap {
        padding: 16px 16px 8px 16px;
    }
}


@media (max-width: 700px) {

.tableInputCont {
    grid-template-columns: 1fr;
}

.kwhInp, 
.inpDiv,
.usageHrInp, 
.noOfApplInp,
.waareeParentContainer :deep() .el-input{
    max-width: inherit;
    width: 100%;
}

.mdDiv {
    display: grid;
    grid-template-columns: 1fr 1fr;
    gap: 16px;
    align-items: center;
}

.mdLabel,
.mdTitle {
    display: inherit;
}

.mdTitle {
    font-weight: bold;
}

.tableInputsContainer {
    padding-bottom: 24px;
    border-bottom: 1px solid #ccc;
}

.tableInputsContainer:last-child {
    padding-bottom: 0px;
    border-bottom: none;
}

.tableHeader {
    grid-template-columns: 1fr;
    padding: 16px;
}

.headerTitle {
    display: none;
}

}


@media (max-width: 650px) {
    .waareeParentContainer {
        width: 100%;
        overflow: hidden;
        overflow-y: scroll;
    }

    .appliancesContainer {
        top: 200px;
    }

    .checkboxFlex {
        margin-top: 40px;
    }

    // .calBtn {
    //     margin-top: 16px;
    // }

    .iKnowBtn::after,
    .iDontKnowBtn::after {
        display: none;
    }

    .iKnowBtn,
    .iDontKnowBtn {
        font-size: 18px;
    }

    .commonHeading,
    .whiteHeading {
        font-size: 35px;
        margin-bottom: 30px;
    }

    .marginBottom {
        margin-bottom: 40px;
    }

    .secSection,
    .thrSection,
    .frSection,
    .firSection {
        padding-top: 30px;
        padding-bottom: 60px;
    }

    .commonGridContainer,
    .gridContainerFr,
    .iKnowContainer,
    .headerAppl,
    .optionsContAppl {
        grid-template-columns: 1fr;
    }

    .orCont {
        margin: auto;
    }

    .gridContainer,
    .gridContST,
    .inputsBox {
        flex-direction: column;
    }

    .inputsBox {
        gap: 4px;
        margin-bottom: 16px;
    }


    .smallInp {
        width: 75px;
        padding-right: 24px;
    }

    .smallInpUnit {
        right: 10px;
    }

    .percentContainer {
        grid-template-columns: 22% 25% 24% 16% auto;
    }

    .gridBoxTwo,
    .gridBoxST,
    .inpLabel,
    .inpOne,
    .inpTwo,
    .inpBill,
    .sliderContainer,
    .additionalInpCont {
        width: 100%;
    }

    .commonIconST {
        margin-bottom: 8px;
    }

    .gridContST {
        gap: 24px;
    }

    .graphContent,
    .estAvgPVS {
        font-size: 16px;
    }

    .labelOnePVS,
    .labelTwoPVS {
        height: 58px;
        font-size: 14px;
    }

    .labelOnePVS {
        padding-right: 30px;
    }

    .labelTwoPVS {
        padding-left: 30px;
    }

    .radioBtnPVS {
        margin-bottom: 80px;
    }

    .addOptBox {
        gap: 8px;
        align-items: flex-end;
    }

    .plusIconApplChild {
        margin-bottom: 8px;
    }

    .counterInput {
        width: 150px;
    }

    .hideForMobile {
        display: none;
    }

    .headerAppl {
        padding: 0px 16px;
        border-top-right-radius: 12px;
        border-top-left-radius: 12px;
        background: linear-gradient(to bottom, #f5f7fa, #e8edf2);
    }

    .headerApplForMobile {
        height: 48px;
        display: grid;
        grid-template-columns: 1fr;
        align-items: center;
        padding: 0px 16px;
        gap: 24px;
        border-bottom: 2px solid #ccc;
        border-top: 1px solid #ccc;
        border-bottom-right-radius: 12px;
        border-bottom-left-radius: 12px;
        background: linear-gradient(to bottom, #f5f7fa, #e8edf2);
    }

    .bodyContainerApplForMobile {
        display: inherit;
        height: 0px;
        overflow: hidden;
        overflow-y: scroll;
        padding: 8px 24px 24px 24px;
    }

    .bodyContainerAppl,
    .bodyContainerApplForMobile {
        height: 0px;
        padding: 0px;
    }

    .openBodyForMobile {
        height: 275px;
        padding: 8px 16px 24px 16px;
    }

    .borderRadius {
        border-bottom-left-radius: 0px;
        border-bottom-right-radius: 0px;
    }

    .hover_information .tooltip {
        left: 0;
    }

    .hover_information .tooltipBP {
        left: -100%;
        width: 300px;
    }

    .hover_information .tooltipEMI {
        left: -385%;
        width: 90vw;
        grid-template-columns: 1fr;
    }

    .tooltipBoxOne {
        padding: 0;
        border: none;
    }


    .tooltipGreenHeading {
        font-size: 16px;
    }

    .tooltipFlex,
    .tooltipULList {
        margin-bottom: 4px;
        font-size: 14px;
    }
}

.estimated-bill-chart-dims {
    height: 70vh;
    margin: 50px 0;
}

.break-even-chart-dims {
    height: 60vh;
    margin: 50px 0;
}

.estimated-chart-dims {
    height: 50vh;
    background-color: #F0F0F1;
}

.disabled {
  cursor: not-allowed;
}
</style>