const AWS = require("aws-sdk");
const fs = require("fs");
AWS.config.logger = console;

//s3 bucket crediantls
const s3 = new AWS.S3({
  accessKeyId: process.env.AWS_S3_ACCESS_KEY_ID,
  secretAccessKey: process.env.AWS_S3_SECRET_ACCESS_KEY,
});

function getRandomNumber(min, max) {
  return Math.floor(Math.random() * (max - min + 1)) + min;
}

async function uploadAndPushImage(folder,image, imageName, unique_parameter) {
  if (image) {
    try {
      // Generate a random number using Math.random()
      const randomNumber = getRandomNumber(100000, 999999);
      // Construct the imageName using the profilepic-email-randomnumber format
      const key = `${imageName}-${unique_parameter}-${randomNumber}`;
      const imageData = fs.readFileSync(image.tempFilePath);
      const uploadParams = {
        Bucket: `indyte-static-images/${folder}`,
        Key: key,
        Body: imageData,
        ACL: "public-read",
        ContentType: "image/jpeg",
      };

      // Wrap the s3.upload function in a Promise
      const uploadPromise = new Promise((resolve, reject) => {
        s3.upload(uploadParams, function (err, data) {
          if (err) {
            reject(err);
          } else {
            resolve(data);
          }
        });
      });

      // Wait for the upload to complete and get the data from the Promise
      const uploadedData = await uploadPromise;
      const data = {
        key: key,
        location: uploadedData.Location,
      };
      return data;
    } catch (error) {
      return `Failed to upload image ${imageName}: ${error.message}`;
    }
  }
  return;
}

async function deleteS3Object(key) {
  console.log(key);
  return new Promise((resolve, reject) => {
    const params = {
      Bucket: "indyte-static-images",
      Key: key,
    };
    s3.deleteObject(params, (err, data) => {
      if (err) {
        reject(err);
      } else {
        resolve(data);
      }
    });
  });
}

module.exports = {
  uploadAndPushImage,
  deleteS3Object,
};