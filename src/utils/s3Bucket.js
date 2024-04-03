const { S3Client, PutObjectCommand } = require("@aws-sdk/client-s3");
const uuid = require("uuid").v4;

//single file
exports.s3Uploadv3 = async (file, path) => {
  const s3client = new S3Client();

  const settings = {
      Bucket: process.env.AWS_BUCKET_NAME,
      Key: `images/${path}/${uuid()}-${file.originalname}`,
      Body: file.buffer,
  }

  const result = await s3client.send(new PutObjectCommand(settings));
  return { result, settings }; 
};


//multiple files
// exports.s3UploadMultiv3 = async (files) => {
//     const s3client = new S3Client();
  
//     const params = files.map((file) => {
//       return {
//         Bucket: process.env.AWS_BUCKET_NAME,
//         Key: `images/tournaments/${uuid()}-${file.originalname}`,
//         Body: file.buffer,
//       };
//     });
  
//     return await Promise.all(
//       params.map((param) => s3client.send(new PutObjectCommand(param)))
//     );
// };
