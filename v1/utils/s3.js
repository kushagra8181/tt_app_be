const { S3Client, PutObjectCommand, GetObjectCommand } = require('@aws-sdk/client-s3');
const { getSignedUrl } = require('@aws-sdk/s3-request-presigner');
const sharp = require('sharp');

const s3 = new S3Client({
    region: process.env.AWS_REGION,
    credentials: {
        accessKeyId: process.env.AWS_ACCESS_KEY_ID,
        secretAccessKey: process.env.AWS_SECRET_ACCESS_KEY
    }
});
const resolutions = [
    { suffix: 'original', width: null, height: null },
    { suffix: 'thumbnail', width: 100, height: 100 },
    { suffix: 'medium',    width: 300, height: 300 },
    { suffix: 'full',      width: 800, height: 800 },
];
const uploadToS3 = async (base64Image, userId) => {
    const base64 = base64Image.split(',')[1];
    const buffer = Buffer.from(base64, 'base64');

    await Promise.all(resolutions.map(async ({ suffix, width, height }) => {
        const resized = width && height
            ? await sharp(buffer).resize(width, height, { fit: 'cover' }).jpeg({ quality: 80 }).toBuffer()
            : await sharp(buffer).jpeg({ quality: 100 }).toBuffer();

        await s3.send(new PutObjectCommand({
            Bucket: process.env.AWS_BUCKET_NAME,
            Key: `profile-images/${userId}/${suffix}.jpg`,
            Body: resized,
            ContentType: 'image/jpeg'
        }));
    }));

    return `profile-images/${userId}`;
};
const getPresignedUrl = async (basePath, suffix = 'medium') => {
    const command = new GetObjectCommand({
        Bucket: process.env.AWS_BUCKET_NAME,
        Key: `${basePath}/${suffix}.jpg`
    });
    return await getSignedUrl(s3, command, { expiresIn: 604800 }); // 1 hour
};
module.exports = { uploadToS3, getPresignedUrl };
