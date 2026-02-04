import swaggerJsdoc from "swagger-jsdoc";

const baseUrl =
  process.env.BASE_URL || `http://localhost:${process.env.PORT || 4000}`;

const options: swaggerJsdoc.Options = {
  definition: {
    openapi: "3.0.0",
    info: {
      title: "Web App Builder API",
      version: "1.0.0",
      description: "Production API documentation",
    },

    servers: [
      {
        url: baseUrl,
        description:
          process.env.NODE_ENV === "production"
            ? "Production Server"
            : "Local Server",
      },
    ],
  },

  apis: ["src/routes/*.ts"],
};

export const swaggerSpec = swaggerJsdoc(options);
