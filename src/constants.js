let environment = import.meta.env.VITE_APP_ENVIRONMENT || "";
let subEnvironment = environment?.split('.')[1];

let navbarLogo =
  "https://spotlightdocuments.blob.core.windows.net/documents/Arka%20Logo%20-%20Black.png?sp=r&st=2023-03-09T12:04:08Z&se=2025-10-02T20:04:08Z&spr=https&sv=2021-12-02&sr=b&sig=C9LvLVy9FldaWSwBpmKgNPd4meUyZznNjY864gLgFzk%3D";
let favIconLink =
  "https://spotlightdocuments.blob.core.windows.net/documents/Arka%20Logomark%20-%20Black.png?sp=r&st=2023-03-09T12:04:36Z&se=2025-10-02T20:04:36Z&spr=https&sv=2021-12-02&sr=b&sig=aobZNPIAgkoLhpsEfebc%2BYHjtJ7ZbbU5HK8XGd4bt2Q%3D";
let addThirdPartyRoutes = true;
let PRODUCTION_ENV = false;
let DATABASE_URL = "https://devapi.arka360.com/";
let isRil = false;
let SOLAR_CALCULATOR_ID = 155;
let CONTAINER_NAME = "marketingportal"
if (!environment) {
  if (
    location.hostname.includes("rnel") ||
    location.hostname.includes("calm")
  ) {
    environment = "ril";
  } else if (location.hostname.includes("devgosolar")) {
    environment = "dev";
  }
  else if (location.hostname.includes("betagosolar")) {
    environment = "beta";
  } else if (location.hostname.includes("gosolar")) {
    environment = "prod";
  }
}
// This regex will match "dev.8015" but not "dev"
const featureEnvPattern = /^dev\.(?!dev)\d+$/gm
let isFeatureEnvironment = featureEnvPattern.test(environment)

if (environment == "dev") {
  DATABASE_URL = "https://devapi.arka360.com/";
  PRODUCTION_ENV = false;
  CONTAINER_NAME = "marketingportal";
  SOLAR_CALCULATOR_ID = 155
} else if (environment == "beta") {
  DATABASE_URL = "https://betaapi.arka360.com/";
  PRODUCTION_ENV = false;
  CONTAINER_NAME = "prod-marketingportal"
} else if (environment == "prod") {
  DATABASE_URL = "https://prodapi.arka360.com/";
  PRODUCTION_ENV = true;
  CONTAINER_NAME = "prod-marketingportal"
  SOLAR_CALCULATOR_ID = 6
} else if (environment == "ril") {
  DATABASE_URL = "https://prodapi.arka360.com/";
  PRODUCTION_ENV = false;
  navbarLogo =
    "https://downloadtsl.blob.core.windows.net/logos/sensehawk_favicon.webp";
  favIconLink = navbarLogo;
  addThirdPartyRoutes = false;
  isRil = true;
  CONTAINER_NAME = "prod-marketingportal"
  SOLAR_CALCULATOR_ID = 6
} else if (isFeatureEnvironment) {
  DATABASE_URL = `https://devfeaturesapi.arka360.com:${subEnvironment}/`;
}

const favicon = document.getElementById("favicon");
favicon.setAttribute("href", favIconLink);

const SAVE_REPORT_LAMBDA_ENDPOINT =
  "https://udlt2cbkgpskt7blcrjw2uky3q0rbmhz.lambda-url.ap-south-1.on.aws/";

export {
  navbarLogo,
  addThirdPartyRoutes,
  DATABASE_URL,
  isRil,
  SAVE_REPORT_LAMBDA_ENDPOINT,
  CONTAINER_NAME,
  SOLAR_CALCULATOR_ID
};