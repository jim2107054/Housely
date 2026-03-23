import { v2 as cloudinary } from 'cloudinary';
import multer from 'multer';

cloudinary.config({
  cloud_name: process.env.CLOUDINARY_CLOUD_NAME,
  api_key: process.env.CLOUDINARY_API_KEY,
  api_secret: process.env.CLOUDINARY_API_SECRET,
});

const storage = multer.memoryStorage();

const fileFilter = (req, file, cb) => {
  const allowedMimes = [
    'video/mp4',
    'video/quicktime',
    'video/webm',
    'video/x-msvideo',
  ];
  if (allowedMimes.includes(file.mimetype)) {
    cb(null, true);
  } else {
    cb(new Error('Only video files are allowed'), false);
  }
};

export const videoUpload = multer({
  storage,
  fileFilter,
  limits: {
    fileSize: 500 * 1024 * 1024, // 500 MB
  },
});

export const uploadVideoToCloudinary = (fileBuffer, options = {}) => {
  return new Promise((resolve, reject) => {
    const uploadOptions = {
      resource_type: 'video',
      folder: 'housely/videos',
      eager: [{ format: 'mp4', quality: 'auto' }],
      eager_async: true,
      ...options,
    };

    const stream = cloudinary.uploader.upload_stream(uploadOptions, (err, result) => {
      if (err) return reject(err);

      // Generate thumbnail by transforming the video URL
      const thumbnailUrl = result.secure_url.replace(
        '/upload/',
        '/upload/so_0,f_jpg,w_400/',
      );

      resolve({ ...result, thumbnailUrl });
    });

    stream.end(fileBuffer);
  });
};

export const deleteCloudinaryVideo = (cloudinaryId) => {
  return cloudinary.uploader.destroy(cloudinaryId, { resource_type: 'video' });
};
