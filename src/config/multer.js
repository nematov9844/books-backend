const multer = require('multer');
const path = require('path');
const { v4: uuidv4 } = require('uuid');
const AppError = require('../utils/appError');

// Fayllar uchun storage konfiguratsiyasi
const storage = multer.diskStorage({
  destination: function (req, file, cb) {
    let uploadPath = 'uploads/';
    
    // Fayl turiga qarab papka tanlash
    if (file.mimetype.startsWith('image/')) {
      uploadPath += 'images/';
    } else if (file.mimetype === 'application/pdf') {
      uploadPath += 'pdfs/';
    }
    
    cb(null, uploadPath);
  },
  filename: function (req, file, cb) {
    // Fayl nomini unique qilish
    const uniqueSuffix = uuidv4();
    cb(null, uniqueSuffix + path.extname(file.originalname));
  }
});

// Fayl filterini sozlash
const fileFilter = (req, file, cb) => {
  const allowedFileTypes = process.env.ALLOWED_FILE_TYPES.split(',');
  const fileExtension = path.extname(file.originalname).toLowerCase().substring(1);
  
  if (allowedFileTypes.includes(fileExtension)) {
    cb(null, true);
  } else {
    cb(new AppError('Invalid file type. Only PDF and image files are allowed', 400), false);
  }
};

// Multer konfiguratsiyasi
const upload = multer({
  storage: storage,
  fileFilter: fileFilter,
  limits: {
    fileSize: parseInt(process.env.MAX_FILE_SIZE) // Maksimal fayl hajmi
  }
});

// Xatoliklarni qayta ishlash
const handleMulterError = (error, req, res, next) => {
  if (error instanceof multer.MulterError) {
    if (error.code === 'LIMIT_FILE_SIZE') {
      return next(new AppError('File is too large', 400));
    }
    return next(new AppError(error.message, 400));
  }
  next(error);
};

// Middleware'larni eksport qilish
module.exports = {
  uploadSingleImage: upload.single('image'),
  uploadMultipleImages: upload.array('images', 5),
  uploadPDF: upload.single('pdf'),
  uploadBookFiles: upload.fields([
    { name: 'coverImage', maxCount: 1 },
    { name: 'pdf', maxCount: 1 },
    { name: 'additionalImages', maxCount: 4 }
  ]),
  handleMulterError
}; 