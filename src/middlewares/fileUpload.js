const multer = require("multer");
const { s3Uploadv3 } = require("../utils/s3Bucket");

const storage = multer.memoryStorage();

const fileFilter = (req, file, cb) => {
  if (file.mimetype.split("/")[0] === "image") {
    cb(null, true);
  } else {
    const error = new multer.MulterError("LIMIT_UNEXPECTED_FILE");
    error.code = "LIMIT_UNEXPECTED_FILE";
    cb(error, false);
  }
};

const upload = multer({
  storage,
  fileFilter,
  limits: {
    fileSize: 2000000, // Limit the file size to 2MB
    files: 1, // Limit the number of files to 1
  },
});

const fileUpload = async (req, res, next) => {
  const { path } = req.query; 
  
  try {
    upload.single("file")(req, res, async function (err) {
      if (err instanceof multer.MulterError) {
        if (err.code === "LIMIT_FILE_SIZE") {
          req.err = "File size exceeds the limit";
        } else if (err.code === "LIMIT_FILE_COUNT") {
          req.err = "Too many files uploaded";
        } else if (err.code === "LIMIT_UNEXPECTED_FILE") {
          req.err = "Unexpected file type";
        } else {
          req.err = err.message;
        }
      } else if (err) {
        req.err = err.message;
      } else {
        try {
          const { result, settings } = await s3Uploadv3(req.file, path);
          // console.log(result);
          if (result.$metadata.httpStatusCode === 200) {
            req.settings = settings;
            req.status = result.$metadata.httpStatusCode;
          } else {
            req.err = "Failed to upload file to S3";
          }
        } catch (err) {
          console.log(err);
          req.err = "Failed to upload file to S3";
        }
      }
      
      next();
    });
  } catch (err) {
    console.log(err);
    return res.status(500).json({ error: "Failed to process file upload" });
  }
};

module.exports = fileUpload;

//upload inside disk
// const multer = require("multer");

// const upload = multer({
//   dest: 'src/uploads/',
// });

// const fileUpload = (req, res, next) => {
//   upload.single("file")(req, res, function (err) {
//     if (err instanceof multer.MulterError) {
//         // A Multer error occurred while uploading
//         console.log("Multer Error:", err);
//         return res.status(500).json({ error: "Multer Error: " + err.message });
//     } else if (err) {
//         // An unknown error occurred while uploading
//         console.log("Unknown Error:", err);
//         return res.status(500).json({ error: "Unknown Error: " + err.message });
//     }else{
//         // File upload successful
//         // console.log(req.file);
//         // res.json({ status: "uploaded" });

//         next();
//     }
//   });
// };

// module.exports = fileUpload;