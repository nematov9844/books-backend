const swaggerJsdoc = require('swagger-jsdoc');
const swaggerUi = require('swagger-ui-express');

const options = {
  definition: {
    openapi: '3.0.0',
    info: {
      title: 'Books API',
      version: '1.0.0',
      description: 'API documentation for the Books application',
    },
    servers: [
      {
        url: process.env.API_URL || 'http://localhost:5000/api/v1',
        description: 'Development server',
      },
    ],
    components: {
      securitySchemes: {
        bearerAuth: {
          type: 'http',
          scheme: 'bearer',
          bearerFormat: 'JWT',
        },
      },
      schemas: {
        Book: {
          type: 'object',
          required: [
            'title',
            'description',
            'price',
            'author',
            'categories',
            'format',
            'isbn',
            'language',
            'pages',
            'publisher',
            'publicationDate',
            'stock',
          ],
          properties: {
            title: {
              type: 'string',
              maxLength: 100,
            },
            description: {
              type: 'string',
              minLength: 10,
            },
            price: {
              type: 'number',
              minimum: 0,
            },
            discountPrice: {
              type: 'number',
            },
            author: {
              type: 'string',
              format: 'objectId',
            },
            categories: {
              type: 'array',
              items: {
                type: 'string',
                format: 'objectId',
              },
            },
            format: {
              type: 'string',
              enum: ['hardcover', 'paperback', 'ebook', 'audiobook'],
            },
            isbn: {
              type: 'string',
              pattern: '^[\\d-]{10,17}$',
            },
            language: {
              type: 'string',
            },
            pages: {
              type: 'integer',
              minimum: 1,
            },
            publisher: {
              type: 'string',
            },
            publicationDate: {
              type: 'string',
              format: 'date',
            },
            stock: {
              type: 'integer',
              minimum: 0,
            },
          },
        },
        Category: {
          type: 'object',
          required: ['name'],
          properties: {
            name: {
              type: 'string',
              maxLength: 50,
            },
            description: {
              type: 'string',
              maxLength: 500,
            },
            parent: {
              type: 'string',
              format: 'objectId',
            },
            order: {
              type: 'integer',
              minimum: 0,
            },
          },
        },
        Review: {
          type: 'object',
          required: ['rating', 'comment'],
          properties: {
            rating: {
              type: 'integer',
              minimum: 1,
              maximum: 5,
            },
            title: {
              type: 'string',
              maxLength: 100,
            },
            comment: {
              type: 'string',
              minLength: 10,
              maxLength: 500,
            },
            images: {
              type: 'array',
              items: {
                type: 'string',
                format: 'uri',
              },
            },
          },
        },
        Order: {
          type: 'object',
          required: ['items', 'shippingAddress', 'paymentMethod'],
          properties: {
            items: {
              type: 'array',
              items: {
                type: 'object',
                required: ['book', 'quantity'],
                properties: {
                  book: {
                    type: 'string',
                    format: 'objectId',
                  },
                  quantity: {
                    type: 'integer',
                    minimum: 1,
                  },
                },
              },
            },
            shippingAddress: {
              type: 'object',
              required: ['street', 'city', 'state', 'country', 'zipCode'],
              properties: {
                street: { type: 'string' },
                city: { type: 'string' },
                state: { type: 'string' },
                country: { type: 'string' },
                zipCode: { type: 'string' },
              },
            },
            paymentMethod: {
              type: 'string',
              enum: ['credit_card', 'debit_card', 'paypal'],
            },
          },
        },
      },
    },
  },
  apis: ['./src/routes/*.js'],
};

const specs = swaggerJsdoc(options);

module.exports = {
  swaggerUi,
  specs,
};
