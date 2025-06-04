<template>
    <div class="specificationContainer">
        <el-dialog v-model="visiblePopup" title="Specification" :close-on-click-modal="false" @close="handleClose"
            class="dialog">
            <div class="container">
                <div class="sidebar">
                    <p :class="['sidebarBtns', this.isProductSpecificationShow ? 'slidebarActiveBtn' : '']"
                        @click="isPrdtClick()">Product Specifications</p>
                </div>
                <el-scrollbar class="childContainer">
                    <div class="prdtSpc" v-if="isProductSpecificationShow">
                        <div class="flexCont">
                            <p class="headingPrdt">Brand</p>
                            <p class="valuePrdt">{{ specsData[0].brand }}</p>
                        </div>
                        <div class="flexCont">
                            <p class="headingPrdt">Series/Model</p>
                            <p class="valuePrdt">{{ specsData[0].model }}</p>
                        </div>
                        <div class="flexCont">
                            <p class="headingPrdt">Type of Solar Panel</p>
                            <p class="valuePrdt">{{ specsData[0].type }}</p>
                        </div>
                        <div class="flexCont">
                            <p class="headingPrdt">Nominal Power (W)</p>
                            <p class="valuePrdt">{{ specsData[0].moduleProperties.nominal_power }}</p>
                        </div>
                        <div class="flexCont">
                            <p class="headingPrdt">Panel Efficiency</p>
                            <p class="valuePrdt">{{ specsData[0].moduleProperties.efficiency }}</p>
                        </div>
                        <div class="flexCont">
                            <p class="headingPrdt">Cell-type</p>
                            <p class="valuePrdt">{{ specsData[0].moduleProperties.cell_type }}</p>
                        </div>
                        <div class="flexCont">
                            <p class="headingPrdt">No of Cells</p>
                            <p class="valuePrdt">{{ specsData[0].moduleProperties.cell_number }}</p>
                        </div>
                        <div class="flexCont">
                            <p class="headingPrdt">Vmpp (Nominal Power Voltage)</p>
                            <p class="valuePrdt">{{ specsData[0].moduleProperties.vmpp }}</p>
                        </div>
                        <div class="flexCont">
                            <p class="headingPrdt">Open Circuit Voltage (Voc), V</p>
                            <p class="valuePrdt">{{ specsData[0].moduleProperties.voc }}</p>
                        </div>
                        <div class="flexCont">
                            <p class="headingPrdt">Product Warranty</p>
                            <p class="valuePrdt">{{ specsData[0].product_warranty }}</p>
                        </div>
                        <div class="flexCont">
                            <p class="headingPrdt">Power Warranty</p>
                            <p class="valuePrdt">{{ specsData[0].power_warranty }}</p>
                        </div>
                        <div class="flexCont">
                            <p class="headingPrdt">Description</p>
                            <p class="valuePrdt">{{ specsData[0].description }}</p>
                        </div>
                        <div class="flexCont">
                            <p class="headingPrdt">Dimensions (L*W*H)</p>
                            <p class="valuePrdt">
                                {{ specsData[0].moduleProperties.length }}mm x
                                {{ specsData[0].moduleProperties.width }}mm x
                                {{ specsData[0].moduleProperties.height }}mm
                            </p>
                        </div>
                    </div>
                </el-scrollbar>
            </div>
        </el-dialog>
    </div>
</template>
  
<script >
export default {

    props: {
        isSpecificationPopupVisible: {
            type: Boolean,
            default: false,
        },
        specsData: {
            type: Object
        },
    },

    data() {
        return {
            isProductSpecificationShow: true,
        };
    },

    computed: {
        visiblePopup() {
            return this.$props.isSpecificationPopupVisible;
        },
    },

    methods: {
        handleClose() {
            this.$emit("close");
        },

        isPrdtClick() {
            this.isProductSpecificationShow = true;
            this.isSolarSpecificationShow = false;
            this.isFeaturesShow = false;
        },

        isSolarClick() {
            this.isProductSpecificationShow = false;
            this.isSolarSpecificationShow = true;
            this.isFeaturesShow = false;
        },

        isFeaturesClick() {
            this.isProductSpecificationShow = false;
            this.isSolarSpecificationShow = false;
            this.isFeaturesShow = true;
        },
    },
};
</script>
  
<style scoped>
@font-face {
    font-family: "ceraPro";
    src: url(./assets/fonts/CeraProMedium.otf);
}

p,
h1,
h2,
h3,
h4,
h5,
h6,
input {
    font-family: "ceraPro";
}

.specificationContainer :deep() .dialog {
    width: 80vw !important;
    border-radius: 8px !important;
    margin-top: 10vh !important;
}

.specificationContainer :deep() .el-dialog__header {
    display: flex !important;
    align-items: center;
    height: 40px;
    width: 100%;
    border-top-left-radius: 8px;
    border-top-right-radius: 8px;
    padding: 0px 24px;
    background-image: linear-gradient(to bottom, #f5f7fa, #e8edf2);
}

.specificationContainer :deep() .el-dialog__title {
    font-size: 16px;
    font-weight: 600;
    font-family: "ceraPro";
}

.specificationContainer :deep() .el-dialog__headerbtn {
    top: -4px;
}

.specificationContainer :deep() .el-dialog__headerbtn .el-dialog__close {
    color: #222;
    font-size: 24px;
    font-weight: 600;
}

.specificationContainer :deep() .el-dialog__body {
    padding: 0px !important;
}


.specificationContainer :deep() .el-scrollbar__wrap {
    overflow: auto;
    height: 100%;
    padding: 24px 24px 32px 24px;
    word-break: break-word;
    overflow: hidden;
    max-height: 670px;
    overflow-y: scroll;
    text-align: center;
}

.container {
    display: grid;
    grid-template-columns: 241px auto;
}

.sidebar {
    border-right: 1px solid #ccc;
}

.sidebarBtns {
    display: flex;
    align-items: center;
    padding-left: 24px;
    width: 100%;
    height: 56px;
    font-size: 18px;
    font-weight: 500;
    color: #777;
    border-bottom: 1px solid #ccc;
    cursor: pointer;
}

.slidebarActiveBtn {
    background-color: #0db02b;
    color: #fff;
}

.childContainer {
    height: 75vh;
    padding: 8px 24px 24px 32px;
    overflow: hidden;
    overflow-y: scroll;
}

.specificationContainer>>>.el-scrollbar__wrap {
    padding: 0px;
}

.childContainer::-webkit-scrollbar {
    width: 8px;
}

.flexCont {
    display: grid;
    grid-template-columns: 300px auto;
    gap: 24px;
    align-items: flex-start;
    text-align: left;
    padding: 15px 0px;
    min-height: 55px;
    border-bottom: 1px solid #ccc;
}

.headingPrdt {
    font-size: 20px;
    color: #777;
}

.valuePrdt {
    font-size: 20px;
    color: #000;
}

.featuresHeading {
    font-size: 20px;
    font-weight: 500;
    color: #777;
    text-align: left;
    margin-bottom: 16px;
    margin-top: 16px;
}

.featuresList {
    text-align: left;
}

.lists {
    font-size: 20px;
    color: #000;
    margin-bottom: 24px;
    display: grid;
    grid-template-columns: 10px auto;
    align-items: flex-start;
    gap: 16px;
}

.lists::before {
    content: '';
    height: 8px;
    width: 8px;
    background-color: #000;
    border-radius: 50%;
    display: inline-block;
    margin-top: 9px;

}

@media (max-width: 1150px) {
    .specificationContainer :deep() .el-dialog {
        width: 90vw !important;
        margin-top: 8vh !important;
    }
    .container {
        grid-template-columns: 200px auto;
    }

    .sidebarBtns {
        padding-left: 12px;
    }

    .childContainer {
        padding: 8px 16px 24px 16px;
    }

    .headingPrdt,
    .valuePrdt,
    .sidebarBtns {
        font-size: 16px;
    }

    .flexCont {
        grid-template-columns: 220px auto;
        padding: 12px 0px;
        min-height: 48px;
    }

    .lists {
        font-size: 16px;
        margin-bottom: 16px;
        line-height: 1.5;
    }

    .lists::before {
        width: 6px;
        height: 6px;
    }

}




@media (max-width: 650px) {
    .sidebar {
        display: flex;
        align-items: flex-start;
    }

    .sidebarBtns {
        font-size: 14px;
    }

    .sidebarBtns:nth-child(2) {
        border: 1px solid #ccc;
        border-top: none;
    }
    

    .container {
        grid-template-columns: 1fr;
    }

    .flexCont {
        grid-template-columns: 1fr 1fr;
        gap: 12px;
    }

    .childContainer {
        padding: 8px 0px 24px 16px;
    }

}
</style>