import swaggerJsdoc from "swagger-jsdoc";

const options: swaggerJsdoc.Options = {
  definition: {
    openapi: "3.0.0",
    info: {
      title: "Web App Builder Backend API",
      version: "1.0.0",
      description: "API documentation for the App Builder backend",
    },
    servers: [
      {
        url: "http://localhost:4000",
        description: "Local server",
      },
    ],
  },
  apis: ["src/routes/*.ts"], // where swagger comments live
};

export const swaggerSpec = swaggerJsdoc(options);
