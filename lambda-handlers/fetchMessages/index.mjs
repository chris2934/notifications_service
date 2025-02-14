import AWS from 'aws-sdk';

// Initialize DynamoDB DocumentClient (ensure region matches where your table resides)
const dynamoDbDocClient = new AWS.DynamoDB.DocumentClient({ region: 'us-east-1' });

export const handler = async (event) => {
	 
	 if (event.source && event.source === "aws.dynamodb") {
		  console.log("Detected recursive call, aborting execution.");
		  return { statusCode: 200, body: "Recursive invocation detected." };
	 }
	 
	 console.log("Fetching messages from DynamoDB table...");
	 
	 try {
		  // Set up the Scan operation parameters
		  const scanParams = {
				TableName: 'SNSMessages', // DynamoDB table
		  };
		  
		  // Retrieve all items from the DynamoDB table
		  const result = await dynamoDbDocClient.scan(scanParams).promise();
		  
		  // Return the fetched data with proper CORS headers
		  return {
				statusCode: 200,
				headers: {
					 'Access-Control-Allow-Origin': '*', // CORS header to allow any origin
					 'Access-Control-Allow-Headers': 'Content-Type', // Allow specific headers if needed
				},
				body: JSON.stringify({
					 message: 'Messages fetched successfully',
					 data: result.Items,
				}),
		  };
	 } catch (error) {
		  console.error('Error retrieving messages:', error);
		  
		  return {
				statusCode: 500,
				headers: {
					 'Access-Control-Allow-Origin': '*',
					 'Access-Control-Allow-Headers': 'Content-Type',
				},
				body: JSON.stringify({
					 message: 'Error retrieving messages',
					 error: error.message,
				}),
		  };
	 }
};
