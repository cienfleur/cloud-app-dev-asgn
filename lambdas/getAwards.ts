import { APIGatewayProxyHandlerV2 } from "aws-lambda";
import { DynamoDBClient } from "@aws-sdk/client-dynamodb";
import { DynamoDBDocumentClient, ScanCommand } from "@aws-sdk/lib-dynamodb";

const ddbDocClient = createDocumentClient();

export const handler: APIGatewayProxyHandlerV2 = async (event) => {
  try {
    const queryParams = event.queryStringParameters || {};
    const movieId = queryParams.movieId;
    const actorId = queryParams.actorId;

    if (!movieId && !actorId) {
      return {
        statusCode: 400,
        body: JSON.stringify({ message: "Provide movieId or actorId" }),
      };
    }

    // Build filter expressions dynamically
    let filterExpressions: string[] = [];
    let expressionAttributeValues: Record<string, any> = {};

    if (movieId) {
      filterExpressions.push("begins_with(pk, :moviePK)");
      expressionAttributeValues[":moviePK"] = `w${movieId}`;
    }

    if (actorId) {
      filterExpressions.push("begins_with(pk, :actorPK)");
      expressionAttributeValues[":actorPK"] = `w${actorId}`;
    }

    const filterExpression = filterExpressions.join(" OR ");

    // Scan command
    const command = new ScanCommand({
      TableName: process.env.TABLE_NAME!,
      FilterExpression: filterExpression,
      ExpressionAttributeValues: expressionAttributeValues,
    });

    const result = await ddbDocClient.send(command);

    return {
      statusCode: 200,
      body: JSON.stringify(result.Items || []),
    };
  } catch (err) {
    console.error("Scan error:", err);
    return {
      statusCode: 500,
      body: JSON.stringify({ message: "Internal server error" }),
    };
  }
};

function createDocumentClient() {
    const ddbClient = new DynamoDBClient({ region: process.env.REGION });
    const marshallOptions = {
      convertEmptyValues: true,
      removeUndefinedValues: true,
      convertClassInstanceToMap: true,
 };
    const unmarshallOptions = {
    wrapNumbers: false,
 };
  const translateConfig = { marshallOptions, unmarshallOptions };
  return DynamoDBDocumentClient.from(ddbClient, translateConfig);
}
