import multer from 'multer';

const ALLOWED_MIMETYPES = [
  'application/pdf',
  'application/vnd.openxmlformats-officedocument.wordprocessingml.document',
  'application/msword',
];

const storage = multer.memoryStorage();

const fileFilter = (_req, file, cb) => {
  if (ALLOWED_MIMETYPES.includes(file.mimetype)) {
    cb(null, true);
  } else {
    cb(new Error(`Unsupported file type: ${file.mimetype}. Only PDF and DOCX are allowed.`), false);
  }
};

// Single file upload (for JD)
export const uploadSingle = multer({
  storage,
  fileFilter,
  limits: { fileSize: 5 * 1024 * 1024 }, // 5MB
}).single('jdFile');

// Batch CV upload — up to 50 files
export const uploadBatch = multer({
  storage,
  fileFilter,
  limits: {
    fileSize: 5 * 1024 * 1024, // 5MB per file
    files: 50,
  },
}).array('cvFiles', 50);

// Wrap multer in promise for async/await usage
export const handleUploadSingle = (req, res) =>
  new Promise((resolve, reject) => {
    uploadSingle(req, res, (err) => {
      if (err) reject(err);
      else resolve();
    });
  });

export const handleUploadBatch = (req, res) =>
  new Promise((resolve, reject) => {
    uploadBatch(req, res, (err) => {
      if (err) reject(err);
      else resolve();
    });
  });
