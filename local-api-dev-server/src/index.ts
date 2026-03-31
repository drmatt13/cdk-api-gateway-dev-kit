import express from "express";
import dotenv from "dotenv";
import invokeLambdaFunction from "../lib/invokeLambdaFunction";
import proxyToContainer from "../lib/proxyToContainer";

// Import Lambda function handlers
import { lambdaHandler as testFunction1 } from "../../cdk-app/lambda_functions/test-function-1/index";
import { lambdaHandler as testFunction2 } from "../../cdk-app/lambda_functions/test-function-2/index";

dotenv.config({
  path: `.env.${process.env.NODE_ENV || "development"}`,
});

const PORT = process.env.PORT || 8080;

// Container URLs (can be set via environment variables or default to localhost)
const CONTAINER_1_URL =
  process.env.TEST_CONTAINER_1_URL || "http://localhost:5000";
const CONTAINER_2_URL =
  process.env.TEST_CONTAINER_2_URL || "http://localhost:5001";

const app = express();

app.use(express.json());

// ************************************************************
//                    LOCAL API DEV SERVER
//          Emulates API Gateway for local development
// ************************************************************

// Root endpoint
app.get("/", (req, res) => {
  return res.send(
    "Welcome to the Local API Dev Server! Use this server to test your Lambda functions and ECS containers locally.",
  );
});

// Lambda function routes
app.all("/test-function-1", (req, res) => {
  return invokeLambdaFunction(req, res, testFunction1);
});
app.all("/test-function-2", (req, res) => {
  return invokeLambdaFunction(req, res, testFunction2);
});

// ECS container routes
app.all("/test-container-1{/*path}", (req, res) => {
  return proxyToContainer(req, res, CONTAINER_1_URL, "/test-container-1");
});
app.all("/test-container-2{/*path}", (req, res) => {
  return proxyToContainer(req, res, CONTAINER_2_URL, "/test-container-2");
});

// Start server
app.listen(PORT, () => {
  console.log(`Local API Dev Server is running on port ${PORT}`);
});
