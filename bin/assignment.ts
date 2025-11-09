#!/usr/bin/env node
import "source-map-support/register";
import * as cdk from 'aws-cdk-lib';
import { AssignmentStack } from '../lib/assignment-stack';

const app = new cdk.App();
new AssignmentStack(app, 'AssignmentStack', {
  env: { region: 'eu-west-1' },
});