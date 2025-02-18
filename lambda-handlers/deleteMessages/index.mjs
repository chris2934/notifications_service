import AWS from 'aws-sdk';
const dynamoDbDocClient = new AWS.DynamoDB.DocumentClient({ region: 'us-east-1' });

export const handler = async (event) => {
	 // Extract message ID from path parameters
	 const id = event.pathParameters?.id || event.pathParameters?.messageId || null;
	 
	 
	 if (!id) {
		  return {
				statusCode: 400,
				headers: {
					 'Content-Type': 'application/json',
					 'Access-Control-Allow-Origin': '*' // Add CORS support
				},
				body: JSON.stringify({ message: 'ID is required' })
		  };
	 }
	 
	 const params = {
		  TableName: process.env.TABLE_NAME,
		  Key: {
				'MessageId': id
		  }
	 };
	 
	 try {
		  await dynamoDbDocClient.delete(params).promise();
		  
		  return {
				statusCode: 200,
				headers: {
					 'Content-Type': 'application/json',
					 'Access-Control-Allow-Origin': '*'
				},
				body: JSON.stringify({
					 message: `Item ${id} deleted successfully`
				})
		  };
	 } catch (error) {
		  console.error('Error:', error);
		  return {
				statusCode: 500,
				headers: {
					 'Content-Type': 'application/json',
					 'Access-Control-Allow-Origin': '*'
				},
				body: JSON.stringify({
					 message: 'Error deleting item',
					 error: error.message
				})
		  };
	 }
};
