import router from '@/router'
const images = new Map([
    ["google-maps", "https://marketing-portal-assets.s3.ap-south-1.amazonaws.com/generic/google-maps.png"],
    ["Group2549", "https://marketing-portal-assets.s3.ap-south-1.amazonaws.com/generic/Group2549.svg"],
    ["Back-btn", "https://marketing-portal-assets.s3.ap-south-1.amazonaws.com/generic/Group1704.svg"],
    ["Group2133", "https://marketing-portal-assets.s3.ap-south-1.amazonaws.com/generic/Group2133.svg"],
    ["Group2170", "https://marketing-portal-assets.s3.ap-south-1.amazonaws.com/generic/Group2170.svg"],
    ["Group2172", "https://marketing-portal-assets.s3.ap-south-1.amazonaws.com/generic/Group2172.svg"],
    ["Group2188", "https://marketing-portal-assets.s3.ap-south-1.amazonaws.com/generic/Group2188.svg"],
    ["Group2210", "https://marketing-portal-assets.s3.ap-south-1.amazonaws.com/generic/Group2210.png"],
    ["Group2215", "https://marketing-portal-assets.s3.ap-south-1.amazonaws.com/generic/Group2215.png"],
    ["Group2240", "https://marketing-portal-assets.s3.ap-south-1.amazonaws.com/generic/Group2240.svg"],
    ["Group2241", "https://marketing-portal-assets.s3.ap-south-1.amazonaws.com/generic/Group2241.svg"],
    ["Group2548", "https://marketing-portal-assets.s3.ap-south-1.amazonaws.com/generic/Group2548.svg"],
    ["delete", "https://marketing-portal-assets.s3.ap-south-1.amazonaws.com/generic/delete.png"],
    ["plusCircleFill", "https://marketing-portal-assets.s3.ap-south-1.amazonaws.com/generic/plus-circle-fill.svg"],
    ["checkCircleFill", "https://marketing-portal-assets.s3.ap-south-1.amazonaws.com/generic/check-circle-fill(3).svg"],
    ["cloudArrowUp", "https://marketing-portal-assets.s3.ap-south-1.amazonaws.com/generic/cloud-arrow-up(1).svg"],
    ["locationPin", "https://marketing-portal-assets.s3.ap-south-1.amazonaws.com/generic/location-pin.png"],
    ["MaskGroup14", "https://marketing-portal-assets.s3.ap-south-1.amazonaws.com/generic/MaskGroup14.png"],
    ["MaskGroup79", "https://marketing-portal-assets.s3.ap-south-1.amazonaws.com/generic/MaskGroup79.png"],
    ["roadMap", "https://marketing-portal-assets.s3.ap-south-1.amazonaws.com/generic/roadmap.png"],
    ["vue", "https://marketing-portal-assets.s3.ap-south-1.amazonaws.com/generic/vue.svg"],
    ["photo", "https://marketing-portal-assets.s3.ap-south-1.amazonaws.com/generic/photo.png"],
    ["HelveticaNeue", "https://marketing-portal-assets.s3.ap-south-1.amazonaws.com/generic/HelveticaNeue.otf"],
    ["electricity-bill","https://marketing-portal-assets.s3.ap-south-1.amazonaws.com/generic/electricity-bill%402x.png"],
    ["cuboid","https://marketing-portal-assets.s3.ap-south-1.amazonaws.com/generic/cuboid%402x.png"],
    ["subtraction","https://marketing-portal-assets.s3.ap-south-1.amazonaws.com/generic/Subtraction+1%402x.png"],
    ["Draw-roof","https://marketing-portal-assets.s3.ap-south-1.amazonaws.com/generic/Draw-Roof.gif"],
    ["bulb","https://marketing-portal-assets.s3.ap-south-1.amazonaws.com/generic/bulb.svg"],
    ["cross","https://marketing-portal-assets.s3.ap-south-1.amazonaws.com/generic/cross.svg"],
    ["reset","https://marketing-portal-assets.s3.ap-south-1.amazonaws.com/generic/reset.svg"],
    ["Ellipse251","https://marketing-portal-assets.s3.ap-south-1.amazonaws.com/generic/Ellipse251.svg"],
    ["Group2280","https://marketing-portal-assets.s3.ap-south-1.amazonaws.com/generic/Group2280.svg"],
    ["Rectangle3708","https://marketing-portal-assets.s3.ap-south-1.amazonaws.com/generic/Rectangle3708.svg"],
    ["Union25","https://marketing-portal-assets.s3.ap-south-1.amazonaws.com/generic/Union25.svg"],
    ["Union31","https://marketing-portal-assets.s3.ap-south-1.amazonaws.com/generic/Union31.svg"],
    ["arrow-left-short","https://marketing-portal-assets.s3.ap-south-1.amazonaws.com/generic/arrow-left-short.svg"],
    ["calendar3","https://marketing-portal-assets.s3.ap-south-1.amazonaws.com/generic/calendar3.svg"],
    ["co2gas","https://marketing-portal-assets.s3.ap-south-1.amazonaws.com/generic/co2gas.svg"],
    ["Group2693","https://marketing-portal-assets.s3.ap-south-1.amazonaws.com/generic/Group2693.png"],
    ["noun-roi-2514388","https://marketing-portal-assets.s3.ap-south-1.amazonaws.com/generic/noun-roi-2514388.svg"],
    ["noun-solar-4792183","https://marketing-portal-assets.s3.ap-south-1.amazonaws.com/generic/noun-solar-4792183.svg"],
    ["tree","https://marketing-portal-assets.s3.ap-south-1.amazonaws.com/generic/tree.svg"],
    ["ArkaLogo","https://spotlightdocuments.blob.core.windows.net/documents/Arka%20Logo%20-%20Black.png?sp=r&st=2023-03-09T12:04:08Z&se=2025-10-02T20:04:08Z&spr=https&sv=2021-12-02&sr=b&sig=C9LvLVy9FldaWSwBpmKgNPd4meUyZznNjY864gLgFzk%3D"],
    // ["senseHawkLogo","https://downloadstsl.blob.core.windows.net/logos/4VokEt2Cb0lHfJsfwEPUGsbjtI.svg"],
    ["senseHawkLogo","https://downloadtsl.blob.core.windows.net/logos/sensehawk_favicon.webp"]
  ]);
export default { images,
    isCompletedTrue(response) {        
        if (!response.data.is_editable) {
            if(response.data.is_completed){
                router.push({ name: 'formSubmission', params: { referenceID: response.data.token } });
                return 1;   
            }
            else{
                router.push({ name: 'editNotAllowed',params: { referenceID: response.data.token } });
                return 1;   
            }
        }
        else return 0;
    }
}

export function assignOrgInfoToLocalStorage(data){
    let logo = data?.logo;
    let isTataUser = data?.is_tata_user;
    let dataObj = {
        'logo':logo,
        'isTataUser': isTataUser
    }
    localStorage.setItem('org-info-marketing-portal',JSON.stringify(dataObj));
}