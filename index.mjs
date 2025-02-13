import AWS from 'aws-sdk';
const sns = new AWS.SNS();

export const handler = async (event, context) => {
    const snsTopicArn = "arn:aws:sns:us-east-1:752925592607:TestTopic";
    
    const requestBody = JSON.parse(event.body);
    const message = requestBody.message;
    
    const params = {
        Message: JSON.stringify(message),
        TopicArn: snsTopicArn,
        Subject: 'Message from Lambda'
    };
    try {
        const result = await sns.publish(params).promise();
        return {
            statusCode: 200,
            body: JSON.stringify({
                message: 'Message published successfully',
                messageId: result.MessageId
            })
        };
    } catch (error) {
        console.error(error);
        return {
            statusCode: 500,
            body: JSON.stringify({
                message: 'Error publishing message',
                error: error.message
            })
        };
    }
};
