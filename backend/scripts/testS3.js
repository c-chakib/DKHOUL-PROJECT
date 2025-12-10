require('dotenv').config({ path: './.env' });
const { S3Client, PutObjectCommand } = require('@aws-sdk/client-s3');

const s3 = new S3Client({
    region: process.env.AWS_REGION,
    credentials: {
        accessKeyId: process.env.AWS_ACCESS_KEY_ID,
        secretAccessKey: process.env.AWS_SECRET_ACCESS_KEY
    }
});

async function testUpload() {
    console.log('🔄 Testing S3 Connection...');
    console.log(`Bucket: ${process.env.AWS_BUCKET_NAME}`);
    console.log(`Region: ${process.env.AWS_REGION}`);

    const params = {
        Bucket: process.env.AWS_BUCKET_NAME,
        Key: 'uploads/images/test-manual.txt', // Creates folders in S3
        Body: 'Ceci est un fichier test dans le dossier uploads/images pour verification.',
        ContentType: 'text/plain'
    };

    try {
        await s3.send(new PutObjectCommand(params));
        console.log('✅ Success! File uploaded successfully.');
        console.log(`URL should be accessible at: https://${process.env.AWS_BUCKET_NAME}.s3.${process.env.AWS_REGION}.amazonaws.com/test-connection.txt`);
    } catch (error) {
        console.error('❌ Error uploading to S3:', error);
    }
}

testUpload();
