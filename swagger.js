import { setup, serve } from "swagger-ui-express";
import swaggerJSDoc from "swagger-jsdoc";

export const initSwagger = (app) => {
    const options = {
        definition: {
            openapi: "3.0.0",
            info: {
                title: "Sample-Todo-App REST API Docs",
                version: "0.0.0",
                description: "Sample Todo CRUD API document.",
                license: {
                    name: "MIT",
                    url: "http://spdx.org/licenses/MIT.html"
                }
            },
            components: {
                securitySchemas: {
                    bearerAuth: {
                        type: "http",
                        schema: "bearer",
                        bearerFormat: "JWT"
                    }
                }
            },
            security: [
                {
                    bearerAuth: []
                }
            ],
            servers: [
                {
                    url: "http://localhost:3000"
                }
            ]
        },
        apis: ["./routers/**/*.js", "./controllers/**/*.js"]  
    };

    const specs = swaggerJSDoc(options);

    app.use("/docs", 
        serve, 
        setup(specs, {
            explorer: true,
        })
    );
};