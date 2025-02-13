import AWS from 'aws-sdk';
import {request} from "express";

const sns = new AWS.SNS({region: 'us-east-1'}); // Initialize the SNS client with the region
const dynamoDbDocClient = new AWS.DynamoDB.DocumentClient({region: 'us-east-1'});

export const handler = async (event, context) => {
	 const snsTopicArn = "arn:aws:sns:us-east-1:752925592607:TestTopic";
	 
	 try {
		  const requestBody = JSON.parse(event.body);
		  const message = requestBody.message;
		  
		  //Check if the message has already been processed (recursion flag)
		  if (requestBody.isProcessed) {
				console.log("Message already processed. Exiting to prevent infinite loop.");
				return {
					 statusCode: 200,
					 body: JSON.stringify({
						  message: 'Message already processed. Exiting to prevent infinite loop.'
					 })
				};
		  }
		  
		  //Add a flag to the message to indicate it has been processed
		  const flagAddedRequestBody = {
				...requestBody,
				isProcessed: true // Add the recursion prevention flag
		  }
		  
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
		  
		  return {
				statusCode: 200,
				headers: {
					 "Access-Control-Allow-Origin": "*", // CORS header to allow any origin
					 "Access-Control-Allow-Headers": "Content-Type", // Allow specific headers
				},
				body: JSON.stringify({
					 message: 'Message published successfully and stored in DynamoDB',
					 messageId: result.MessageId
				})
		  };
	 } catch (error) {
		  console.error(error);
		  return {
				statusCode: 500,
				headers: {
					 "Access-Control-Allow-Origin": "*", // CORS header to allow any origin
					 "Access-Control-Allow-Headers": "Content-Type", // Allow specific headers
				},
				body: JSON.stringify({
					 message: 'Error publishing message',
					 error: error.message
				})
		  };
	 }
};
