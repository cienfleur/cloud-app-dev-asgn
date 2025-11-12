#!/usr/bin/env node
import "source-map-support/register";
import * as cdk from 'aws-cdk-lib';
import { AssignmentStack } from '../lib/assignment-stack';
import { CognitoStack } from "../lib/movies-stack";
import * as apigateway from 'aws-cdk-lib/aws-apigateway';

const app = new cdk.App();
new CognitoStack(app, 'CognitoStack', {
  env: { region: 'eu-west-1' },
});