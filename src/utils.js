import { BlobServiceClient, ContainerClient } from "@azure/storage-blob";
import { containerName } from "./services/api/index.js";
import { sasToken } from "./services/api/index.js";
import { storageAccountName } from "./services/api/index.js";

export function saveDataInLocalStorage(LSName, fieldName, value) {
  console.log("function called", LSName, fieldName, value);
  let currentLSData = JSON.parse(localStorage.getItem(LSName)) || {};
  if (Object.keys(currentLSData).length == 0) {
    localStorage.setItem(LSName, JSOn.stringify(currentLSData));
  }
  currentLSData[fieldName] = value;
  localStorage.setItem(LSName, JSON.stringify(currentLSData));
}

export function formatNumberInternational(number) {
  //First limit digits after decimal to 2
  //If the 2 digits after the decimal are zeros, remove them, else keep
  //then convert the number to a string to handle decimals and thousands separators
  const numberString = Number(number)
    .toFixed(2)
    .replace(/\.?0+$/, "")
    .toString();

  // Split the number into integer and decimal parts
  const [integerPart, decimalPart] = numberString.split(".");

  // Format the integer part with commas for thousands separators
  const formattedIntegerPart = integerPart.replace(
    /\B(?=(\d{3})+(?!\d))/g,
    ","
  );

  // Combine the formatted integer part and decimal part (if present)
  const formattedNumber = decimalPart
    ? `${formattedIntegerPart}.${decimalPart}`
    : formattedIntegerPart;

  return formattedNumber;
}

export async function uploadFileToBlob(file, currentImageName) {
  if (!file) return [];
  // get BlobService = notice `?` is pulled out of sasToken - if created in Azure portal
  const blobService = new BlobServiceClient(
    `https://${storageAccountName}.blob.core.windows.net/?${sasToken}`
  );
  // get Container - full public read access
  const containerClient = blobService.getContainerClient(containerName);
  // upload file
  await createBlobInContainer(containerClient, file, currentImageName);
  // get list of blobs in container
}

async function createBlobInContainer(containerClient, file, currentImageName) {
  // create blobClient for container
  // generate a unique name of File for Upload
  const blobClient = containerClient.getBlockBlobClient(currentImageName);
  // set mimetype as determined from browser with file upload control
  const options = { blobHTTPHeaders: { blobContentType: file.type } };

  // upload file
  let response = await blobClient.uploadData(file, options);
  console.log('response: ', response);
}

export async function uploadFileToBlobForNested(file,refId){
  const fileName = refId + file.type.split('/')[1];
  const headers = {
      'x-ms-blob-type': 'BlockBlob',
      'Content-Type': file.file_type,
  };

  // console.log("stuff", containerName, fileName);

  const url = `https://${storageAccountName}.blob.core.windows.net/${containerName}/${fileName}?${sasToken}`;
  const response = await fetch(url,
      {
          method: 'PUT',
          headers: headers,
          body: file,
      });
  let downloadUrl = response.url.split('?');
  console.log('downloadUrl: ', downloadUrl[0]);
  return downloadUrl[0];
}

export async function waitForImagesToLoad() {
  const images = document.querySelectorAll("img");
  const promises = [];

  images.forEach((image) => {
    const promise = new Promise((resolve, reject) => {
      if (image.complete) {
        resolve();
      } else {
        image.addEventListener("load", resolve);
        image.addEventListener("error", reject);
      }
    });
    promises.push(promise);
  });

  await Promise.all(promises);
  window.allImagesLoaded = true;
  return true;
}
