import express from 'express';
import AWS from 'aws-sdk';
import bodyParser from 'body-parser';
import cors from 'cors';
import dotenv from 'dotenv';

dotenv.config();

const app = express();
const port = process.env.PORT || 3000;

//Middleware
app.use(cors());
app.use(bodyParser.json());

//Configure AWS SDK
AWS.config.update({
  region: 'us-east-1',
  accessKeyId: process.env.AWS_ACCESS_KEY_ID,
  secretAccessKey: process.env.AWS_SECRET_ACCESS_KEY
});

const sns = new AWS.SNS();

//Route to send notifications
app.post('/api/notifications', async(req, res) => {
  const { message, topicArn } = req.body; //Expecting the SNS Topic ARN and message from the front end
    if(!message || !topicArn) {
        return res.status(400).json({error: 'Message and topicARN are required' });
    }

    try{
        const params = {
            TopicArn: process.env.TOPIC_ARN,
            Message: message
        };

        const result = await sns.publish(params).promise();
        return res.status(200).json({messageID: result.MessageId, status: 'Message sent successfully'});
    } catch(err) {
        console.error('Error sending notification:', err);
        return res.status(500).json({error: err.message});
    }
});

//Sample route to verify server
app.get('/', (req, res) => {
    res.send('Server is running');
});

app.listen(port, () => {
    console.log(`Server is running on port ${port}`);
});
