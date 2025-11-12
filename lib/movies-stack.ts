import * as cdk from "aws-cdk-lib";
import { Aws } from "aws-cdk-lib";
import { Construct } from "constructs";
import { UserPool } from "aws-cdk-lib/aws-cognito";
import * as apig from "aws-cdk-lib/aws-apigateway";
import * as iam from "aws-cdk-lib/aws-iam";
import * as lambda from "aws-cdk-lib/aws-lambda";
import * as node from "aws-cdk-lib/aws-lambda-nodejs";
import { handler } from "../lambdas/getAllMovies";
import * as lambdanode from "aws-cdk-lib/aws-lambda-nodejs";
import * as dynamodb from "aws-cdk-lib/aws-dynamodb";
import * as custom from "aws-cdk-lib/custom-resources";
import { generateBatch } from "../shared/util";
import { movies, actors, movieCasts, awards } from "../seed/movies";

export class CognitoStack extends cdk.Stack {
  private auth: apig.IResource;
  private userPoolId: string;
  private userPoolClientId: string;

  constructor(scope: Construct, id: string, props?: cdk.StackProps) {
    super(scope, id, props);

    const userPool = new UserPool(this, "UserPool", {
      signInAliases: { username: true, email: true },
      selfSignUpEnabled: true,
      removalPolicy: cdk.RemovalPolicy.DESTROY,
    });

    this.userPoolId = userPool.userPoolId;

    const appClient = userPool.addClient("AppClient", {
      authFlows: { userPassword: true },
    });

    this.userPoolClientId = appClient.userPoolClientId;

    const authApi = new apig.RestApi(this, "AuthServiceApi", {
      description: "Authentication Service RestApi",
      endpointTypes: [apig.EndpointType.REGIONAL],
      defaultCorsPreflightOptions: {
        allowOrigins: apig.Cors.ALL_ORIGINS,
      },
    });

    const appApi = new apig.RestApi(this, "AppApi", {
      description: "App RestApi",
      endpointTypes: [apig.EndpointType.REGIONAL],
      defaultCorsPreflightOptions: {
        allowHeaders: ["Content-Type", "X-Amz-Date"],
        allowMethods: ["OPTIONS", "GET", "POST", "PUT", "PATCH", "DELETE"],
        allowCredentials: true,
        allowOrigins: ["*"],
      },
    });

    const apiKey = appApi.addApiKey("AppApiKey", {
  apiKeyName: "AppApiKey",
  description: "admin api key",
});

const usagePlan = appApi.addUsagePlan("AppApiUsagePlan", {
  name: "AppApiUsagePlan",
  throttle: {
    rateLimit: 10,
    burstLimit: 2,
  },
  quota: {
    limit: 10000,
    period: apig.Period.MONTH,
  },
});

usagePlan.addApiKey(apiKey);
usagePlan.addApiStage({
  stage: appApi.deploymentStage,
});

new cdk.CfnOutput(this, "AppApiKeyId", {
  value: apiKey.keyId,
  description: "Admin API Key id",
});

    const appCommonFnProps = {
      architecture: lambda.Architecture.ARM_64,
      timeout: cdk.Duration.seconds(10),
      memorySize: 128,
      runtime: lambda.Runtime.NODEJS_18_X,
      handler: "handler",
      environment: {
        USER_POOL_ID: this.userPoolId,
        CLIENT_ID: this.userPoolClientId,
        REGION: cdk.Aws.REGION,
      },
    };

    

    const authorizerFn = new node.NodejsFunction(this, "AuthorizerFn", {
      ...appCommonFnProps,
      entry: `${__dirname}/../lambdas/auth/authorizer.ts`,
    });

    const moviesTable = new dynamodb.Table(this, "MoviesTable", {
          billingMode: dynamodb.BillingMode.PAY_PER_REQUEST,
          partitionKey: { name: "pk", type: dynamodb.AttributeType.STRING },
          sortKey: { name: "sk", type: dynamodb.AttributeType.STRING },
          tableName: "MoviesTable",
          removalPolicy: cdk.RemovalPolicy.DESTROY, // NOT recommended for production code
        });

        new custom.AwsCustomResource(this, "moviesddbInitData", {
                  onCreate: {
                    service: "DynamoDB",
                    action: "batchWriteItem",
            parameters: {
              RequestItems: {
                [moviesTable.tableName]: [
                  ...generateBatch(movies),
                  ...generateBatch(actors),
                  ...generateBatch(movieCasts),
                  ...generateBatch(awards),
                ],
              },
            },
            physicalResourceId: custom.PhysicalResourceId.of("moviesddbInitData"),
          },
          policy: custom.AwsCustomResourcePolicy.fromSdkCalls({
            resources: [moviesTable.tableArn],
          }),
        });

    this.auth = authApi.root.addResource("auth");

        const requestAuthorizer = new apig.RequestAuthorizer(
      this,
      "RequestAuthorizer",
      {
        identitySources: [apig.IdentitySource.header("cookie")],
        handler: authorizerFn,
        resultsCacheTtl: cdk.Duration.minutes(0),
      }
    );

    const getMovieByIdFn = new lambdanode.NodejsFunction(
          this,
          "GetMovieByIdFn",
          {
            architecture: lambda.Architecture.ARM_64,
            runtime: lambda.Runtime.NODEJS_18_X,
            entry: `${__dirname}/../lambdas/getMovieById.ts`,
            timeout: cdk.Duration.seconds(10),
            memorySize: 128,
            environment: {
              TABLE_NAME: moviesTable.tableName,
              REGION: cdk.Aws.REGION,
            },
          }
          );
          
          const getAllMoviesFn = new lambdanode.NodejsFunction(
            this,
            "GetAllMoviesFn",
            {
              architecture: lambda.Architecture.ARM_64,
              runtime: lambda.Runtime.NODEJS_18_X,
              entry: `${__dirname}/../lambdas/getAllMovies.ts`,
              timeout: cdk.Duration.seconds(10),
              memorySize: 128,
              environment: {
                TABLE_NAME: moviesTable.tableName,
                REGION: cdk.Aws.REGION,
              },
            }
            );
    
            const getMovieCastMemberFn = new lambdanode.NodejsFunction(this, "GetMovieCastMemberFn", {
              architecture: lambda.Architecture.ARM_64,
              runtime: lambda.Runtime.NODEJS_18_X,
              entry: `${__dirname}/../lambdas/getMovieCastMember.ts`,
              timeout: cdk.Duration.seconds(10),
              memorySize: 128,
              environment: {
                TABLE_NAME: moviesTable.tableName,
                REGION: cdk.Aws.REGION,
              },
            });

    const newMovieFn = new lambdanode.NodejsFunction(this, "AddMovieFn", {
              architecture: lambda.Architecture.ARM_64,
              runtime: lambda.Runtime.NODEJS_18_X,
              entry: `${__dirname}/../lambdas/addMovie.ts`,
              timeout: cdk.Duration.seconds(10),
              memorySize: 128,
              environment: {
                TABLE_NAME: moviesTable.tableName,
                REGION: cdk.Aws.REGION,
              },
            });
    
            const deleteMovieFn = new lambdanode.NodejsFunction(this, "DeleteMovieFn", {
              architecture: lambda.Architecture.ARM_64,
              runtime: lambda.Runtime.NODEJS_18_X,
              entry: `${__dirname}/../lambdas/deleteMovie.ts`,
              timeout: cdk.Duration.seconds(10),
              memorySize: 128,
              environment: {
                TABLE_NAME: moviesTable.tableName,
                REGION: cdk.Aws.REGION,
              },
            });
    
            const getActorsFn = new lambdanode.NodejsFunction(this, "GetActorsFn",{
                architecture: lambda.Architecture.ARM_64,
                runtime: lambda.Runtime.NODEJS_18_X,
                entry: `${__dirname}/../lambdas/getMovieActors.ts`,
                timeout: cdk.Duration.seconds(10),
                memorySize: 128,
                environment: {
                  TABLE_NAME: moviesTable.tableName,
                  REGION: cdk.Aws.REGION,
                },
              }
            );
    
            const getAwardsFn = new lambdanode.NodejsFunction(this, "GetAwardsFn",{
                architecture: lambda.Architecture.ARM_64,
                runtime: lambda.Runtime.NODEJS_18_X,
                entry: `${__dirname}/../lambdas/getAwards.ts`,
                timeout: cdk.Duration.seconds(10),
                memorySize: 128,
                environment: {
                  TABLE_NAME: moviesTable.tableName,
                  REGION: cdk.Aws.REGION,
                },
              }
            );


    moviesTable.grantReadData(getAllMoviesFn);
    moviesTable.grantReadData(getMovieByIdFn);
    moviesTable.grantWriteData(newMovieFn);
    moviesTable.grantWriteData(deleteMovieFn);  
    moviesTable.grantReadData(getActorsFn);
    moviesTable.grantReadData(getMovieCastMemberFn);
    moviesTable.grantReadData(getAwardsFn);

    const moviesEndpoint = appApi.root.addResource("movies");
        moviesEndpoint.addMethod(
          "GET",
          new apig.LambdaIntegration(getAllMoviesFn, {
            proxy: true,
          }),
          {
            authorizer: requestAuthorizer,
            authorizationType: apig.AuthorizationType.CUSTOM,
          }
        );
        moviesEndpoint.addMethod(
              "POST",
              new apig.LambdaIntegration(newMovieFn, { proxy: true }),
              {
                apiKeyRequired: true,
              }
            );
        
            const movieEndpoint = moviesEndpoint.addResource("{movieId}");
            movieEndpoint.addMethod(
              "GET",
              new apig.LambdaIntegration(getMovieByIdFn, { proxy: true }),
              {
                authorizer: requestAuthorizer,
                authorizationType: apig.AuthorizationType.CUSTOM,
              }
            );
        
            movieEndpoint.addMethod(
              "DELETE",
              new apig.LambdaIntegration(deleteMovieFn, { proxy: true }),
              {
                apiKeyRequired: true,
              }
            );
        
            const movieCastEndpoint = movieEndpoint.addResource("actors");
            movieCastEndpoint.addMethod(
              "GET",
              new apig.LambdaIntegration(getActorsFn, { proxy: true }),
              {
                authorizer: requestAuthorizer,
                authorizationType: apig.AuthorizationType.CUSTOM,
              }
            );
        
            const actorEndpoint = movieCastEndpoint.addResource("{actorId}");
            actorEndpoint.addMethod(
              "GET",
              new apig.LambdaIntegration(getMovieCastMemberFn, { proxy: true }),
              {
                authorizer: requestAuthorizer,
                authorizationType: apig.AuthorizationType.CUSTOM,
              }
            );
        
            const awardsEndpoint = appApi.root.addResource("awards");
            awardsEndpoint.addMethod(
              "GET",
              new apig.LambdaIntegration(getAwardsFn, { proxy: true }),
              {
                authorizer: requestAuthorizer,
                authorizationType: apig.AuthorizationType.CUSTOM,
              }
            );
    this.addAuthRoute(
    "signup",
    "POST",
    "SignupFn",
    'signup.ts'
    );

    this.addAuthRoute(
      "confirm_signup",
      "POST",
      "ConfirmFn",
      'confirm-signup.ts'
    );

    this.addAuthRoute('signout', 'GET', 'SignoutFn', 'signout.ts');
    this.addAuthRoute('signin', 'POST', 'SigninFn', 'signin.ts');
  }

  private addAuthRoute(
    resourceName: string,
    method: string,
    fnName: string,
    fnEntry: string,
    allowCognitoAccess?: boolean
  ): void {
    const commonFnProps = {
      architecture: lambda.Architecture.ARM_64,
      timeout: cdk.Duration.seconds(10),
      memorySize: 128,
      runtime: lambda.Runtime.NODEJS_18_X,
      handler: "handler",
      environment: {
        USER_POOL_ID: this.userPoolId,
        CLIENT_ID: this.userPoolClientId,
        REGION: cdk.Aws.REGION
      },
    };
    
    const resource = this.auth.addResource(resourceName);
    
    const fn = new node.NodejsFunction(this, fnName, {
      ...commonFnProps,
      entry: `${__dirname}/../lambdas/auth/${fnEntry}`,
    });

    resource.addMethod(method, new apig.LambdaIntegration(fn));
  }
}