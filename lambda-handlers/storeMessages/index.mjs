import AWS from 'aws-sdk';

const sns = new AWS.SNS({region: 'us-east-1'}); // Initialize the SNS client with the region
const dynamoDbDocClient = new AWS.DynamoDB.DocumentClient({region: 'us-east-1'});

export const handler = async (event, context) => {
	 const snsTopicArn = "arn:aws:sns:us-east-1:752925592607:TestTopic";
	 
	 try {
		  // AppSync sends the arguments in event.arguments
		  const message = event.arguments.message;
		  
		  //Check if the message has already been processed (recursion flag)
		  if (event.arguments.isProcessed) {
				console.log("Message already processed. Exiting to prevent infinite loop.");
				return {
					 success: true,
					 message: 'Message already processed. Exiting to prevent infinite loop.'
				};
		  }
		  
		  // Add the recursion prevention flag
		  const flagAddedMessage = {
				message,
				isProcessed: true
		  };
		  
		  const params = {
				Message: JSON.stringify(message),// send the updated message with the flag
				TopicArn: snsTopicArn,
				Subject: 'Message from Lambda'
		  };
		  
		  const result = await sns.publish(params).promise();
		  
		  // Save to DynamoDB
		  const dynamoParams = {
				TableName: 'SNSMessages',
				Item:{
					 MessageId: result.MessageId, // Unique ID from SNS
					 MessageBody: message,
					 IsProcessed: true,
					 ReceivedAt: new Date().toISOString()
				}
		  };
		  await dynamoDbDocClient.put(dynamoParams).promise();
		  
		  // Return format for AppSync
		  return {
				success: true,
				messageId: result.MessageId,
				message: 'Message published successfully and stored in DynamoDB'
		  };
		  
	 } catch (error) {
		  console.error('Error:', error);
		  
		  // Error response format for AppSync
		  return {
				success: false,
				message: 'Error publishing message',
				error: error.message
		  };
	 }
};
