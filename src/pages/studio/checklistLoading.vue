<template>
    <div class="loading-component">
        <el-card class="checklist-card" >
            <!-- <div class="loading-card" v-if="loading">
                <h1>Loading...</h1>
            </div>
            <div v-else>
                <h1>Complete!</h1>
            </div> -->
            <div style="width:100%;height:calc(100vh - 40px);display: flex;flex-direction: column; justify-content: space-evenly;">

                <div v-for="(item, index) in checklist" :key="index">
                    <div style="width:100%;display: flex; align-items: center;">
                        <el-checkbox v-model="item.complete" :disabled="false" class="custom-checkbox" style="font-size: 20px;"
                            :indeterminate="loading && !item.complete"></el-checkbox>
                        <p class="label-text">{{ item.label }}</p>
                    </div>
                </div>
                </div>
        </el-card>
    </div>
</template>
  
<script>
export default {
    data() {
        return {
            loading: false,
            progress: 0,
            checklist: [
                { label: 'Finalizing your solar modules and inverters', complete: false },
                { label: 'Computing generation losses for your location', complete: false },
                { label: 'Conducting shading analysis for the system', complete: false },
                { label: 'Calculating your estimated annual generation', complete: false },
                { label: 'Estimating your lifetime savings from solar', complete: false },
                { label: 'Preparing your solar estimate report', complete: false },
            ],
        };
    },
    mounted() {
        this.loadProgress();
    },
    methods: {
        loadProgress() {
            let currentIndex = 0;
            const tickInterval = setInterval(() => {
                if (currentIndex < this.checklist.length) {
                    this.checklist[currentIndex].complete = true;
                    currentIndex++;
                } else {
                    clearInterval(tickInterval);
                }
            }, 1000);
        }

    },
};
</script>
  
<style scoped>
.loading-component {
    text-align: left;
    /* margin-top: 20px; */
}
.label-text {
  font-size: 16px; /* Adjust the font size to your preference */
  font-weight: 600;
}
.loading-card {
    display: block;

    /* width: 80%; */
    /* margin: 0 auto; */
    /* padding: 20px; */
    h1 {
        font-size: 24px;
    }
}

.checklist-card {
    display: block;

    /* width: 80%; */
    /* margin: 0 auto; */
    /* padding: 20px; */
    h1 {
        font-size: 24px;
    }
}
.custom-checkbox >>>.el-checkbox__inner {
    transform:scale(2);
    margin-right: 15px;
    margin-right: 15px;
}
.custom-checkbox {
  opacity: 1; /* Make it fully visible */
  cursor: not-allowed; /* Change cursor to indicate not interactable */
  pointer-events: none; /* Disable pointer events, preventing interaction */
  color: inherit; /* Keep text color the same as surrounding text */
  background-color: inherit; /* Keep background color the same as surrounding background */
  border: none; /* Remove any border */
  font-size: 24px;
  padding:20px  
}
</style>
  