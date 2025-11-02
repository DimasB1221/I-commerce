import swaggerJsdoc from "swagger-jsdoc";
import swaggerUi from "swagger-ui-express";

const options = {
  definition: {
    openapi: "3.0.0",
    info: {
      title: "E-commerce API",
      version: "1.0.0",
      description: "Dokumentasi API untuk E-commerce backend",
    },
    servers: [
      {
        url: "http://localhost:3000/api", // ganti sesuai URL / port aplikasi kamu
      },
    ],
    components: {
      securitySchemes: {
        bearerAuth: {
          type: "http",
          scheme: "bearer",
          bearerFormat: "JWT",
        },
      },
    },
    security: [
      {
        bearerAuth: [],
      },
    ],
  },
  apis: ["./src/routes/*.js"], // swagger akan scan file route untuk JSDoc
};

const swaggerSpec = swaggerJsdoc(options);

export { swaggerUi, swaggerSpec };
