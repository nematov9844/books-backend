const swaggerJsdoc = require('swagger-jsdoc');
const swaggerUi = require('swagger-ui-express');

const options = {
  swaggerDefinition: {
    openapi: '3.0.0',
    info: {
      title: 'Men Books API',
      version: '1.0.0',
      description: 'Men Books backend API hujjatlari',
    },
    servers: [
      { url: 'http://localhost:5000' }
    ],
  },
  apis: ['./src/routes/*.js','./src/controllers/*.js', './src/models/*.js','./src/services/*.js','./src/routes/verifyEmail.js'], // Bu yerda annotatsiyalar bo'lgan fayllarni ko'rsatamiz
};

const specs = swaggerJsdoc(options);

module.exports = { swaggerUi, specs };
