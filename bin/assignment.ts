#!/usr/bin/env node
import "source-map-support/register";
import * as cdk from 'aws-cdk-lib';
import { AssignmentStack } from '../lib/assignment-stack';
import { CognitoStack } from "../lib/cognito-stack";

const app = new cdk.App();
new AssignmentStack(app, 'AssignmentStack', {
  env: { region: 'eu-west-1' },
});
new CognitoStack(app, 'CognitoStack', {
  env: { region: 'eu-west-1' },
});