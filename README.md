# Express.js MongoDB Atlas API Backend

A production-ready Node.js backend built with Express.js and MongoDB Atlas for handling form submissions with comprehensive validation, error handling, and security features.

## Features

- **Four API Endpoints**: Contact, Order, Credit Application, and Car Form
- **MongoDB Atlas Integration**: Using Mongoose ODM with schema validation
- **ES Modules**: Modern JavaScript with `type: module`
- **Comprehensive Validation**: Server-side validation using express-validator
- **Error Handling**: Centralized error handling middleware
- **Security**: CORS, Helmet, and environment-based configuration
- **Production Ready**: Structured codebase with proper separation of concerns

## Prerequisites

- Node.js (v16 or higher)
- MongoDB Atlas account
- npm or yarn package manager

## Installation

1. **Clone the repository and install dependencies:**
   ```bash
   npm install
   ```

2. **Set up environment variables:**
   ```bash
   cp .env.example .env
   ```

3. **Configure your MongoDB Atlas connection:**
   - Create a MongoDB Atlas cluster
   - Get your connection string
   - Update the `.env` file with your actual MongoDB URI

   ```env
   MONGODB_URI=mongodb+srv://username:password@cluster.mongodb.net/your-database-name?retryWrites=true&w=majority
   PORT=3000
   NODE_ENV=development
   ```

4. **Start the server:**
   ```bash
   # Development mode with auto-restart
   npm run dev
   
   # Production mode
   npm start
   ```

## API Endpoints

### 1. Contact Form Endpoint

**POST** `/api/contact`

Submit a contact form with validation.

**Request Body:**
```json
{
  "fullName": "John Doe",
  "email": "john@example.com",
  "subject": "Inquiry about services",
  "message": "I would like to know more about your services."
}
```

**Success Response (201):**
```json
{
  "success": true,
  "message": "Contact form submitted successfully",
  "data": {
    "id": "65a1b2c3d4e5f6789012345",
    "fullName": "John Doe",
    "email": "john@example.com",
    "subject": "Inquiry about services",
    "submittedAt": "2024-01-15T10:30:00.000Z"
  }
}
```

### 2. Order Form Endpoint

**POST** `/api/order`

Submit an order with multiple products.

**Request Body:**
```json
{
  "name": "Jane Smith",
  "email": "jane@example.com",
  "products": [
    {
      "productName": "Product A",
      "quantity": 2,
      "price": 25.99
    },
    {
      "productName": "Product B",
      "quantity": 1,
      "price": 15.50
    }
  ]
}
```

**Success Response (201):**
```json
{
  "success": true,
  "message": "Order submitted successfully",
  "data": {
    "id": "65a1b2c3d4e5f6789012346",
    "name": "Jane Smith",
    "email": "jane@example.com",
    "products": [
      {
        "productName": "Product A",
        "quantity": 2,
        "price": 25.99
      },
      {
        "productName": "Product B",
        "quantity": 1,
        "price": 15.50
      }
    ],
    "totalAmount": 67.48,
    "submittedAt": "2024-01-15T10:35:00.000Z"
  }
}
```

### 3. Credit Application Endpoint

**POST** `/api/credit-application`

Submit a business credit application.

**Request Body:**
```json
{
  "businessName": "Tech Solutions Inc.",
  "yearsInBusiness": 5,
  "fullName": "Michael Johnson",
  "phoneNumber": "+1234567890",
  "emailAddress": "michael@techsolutions.com",
  "desiredCreditAmount": 50000,
  "additionalInfo": "Looking for equipment financing"
}
```

**Success Response (201):**
```json
{
  "success": true,
  "message": "Credit application submitted successfully",
  "data": {
    "id": "65a1b2c3d4e5f6789012347",
    "businessName": "Tech Solutions Inc.",
    "fullName": "Michael Johnson",
    "emailAddress": "michael@techsolutions.com",
    "desiredCreditAmount": 50000,
    "submittedAt": "2024-01-15T10:40:00.000Z"
  }
}
```

### 4. Car Form Endpoint

**POST** `/api/car-form`

Submit a car-related inquiry form.

**Request Body:**
```json
{
  "name": "Sarah Wilson",
  "phoneNumber": "+1987654321",
  "email": "sarah@example.com",
  "message": "Interested in a 2024 Honda Civic. Please contact me with availability and pricing."
}
```

**Success Response (201):**
```json
{
  "success": true,
  "message": "Car form submitted successfully",
  "data": {
    "id": "65a1b2c3d4e5f6789012348",
    "name": "Sarah Wilson",
    "phoneNumber": "+1987654321",
    "email": "sarah@example.com",
    "submittedAt": "2024-01-15T10:45:00.000Z"
  }
}
```

## Error Responses

**Validation Error (400):**
```json
{
  "success": false,
  "message": "Validation failed",
  "errors": [
    {
      "type": "field",
      "msg": "Email is required",
      "path": "email",
      "location": "body"
    }
  ]
}
```

**Server Error (500):**
```json
{
  "success": false,
  "message": "Server Error"
}
```

## Testing the API

### Using curl:

```bash
# Test contact form
curl -X POST http://localhost:3000/api/contact \
  -H "Content-Type: application/json" \
  -d '{
    "fullName": "Test User",
    "email": "test@example.com",
    "subject": "Test Subject",
    "message": "This is a test message"
  }'

# Test order form
curl -X POST http://localhost:3000/api/order \
  -H "Content-Type: application/json" \
  -d '{
    "name": "Test Customer",
    "email": "customer@example.com",
    "products": [
      {
        "productName": "Test Product",
        "quantity": 1,
        "price": 19.99
      }
    ]
  }'
```

### Using JavaScript fetch:

```javascript
// Example for contact form submission
const submitContactForm = async (formData) => {
  try {
    const response = await fetch('http://localhost:3000/api/contact', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify(formData)
    });
    
    const result = await response.json();
    console.log(result);
  } catch (error) {
    console.error('Error:', error);
  }
};
```

## Project Structure

```
├── config/
│   └── database.js          # MongoDB connection configuration
├── middleware/
│   └── errorHandler.js      # Centralized error handling
├── models/
│   ├── Contact.js           # Contact form schema
│   ├── Order.js             # Order form schema
│   ├── CreditApplication.js # Credit application schema
│   └── CarForm.js           # Car form schema
├── routes/
│   ├── contact.js           # Contact form routes
│   ├── order.js             # Order form routes
│   ├── creditApplication.js # Credit application routes
│   └── carForm.js           # Car form routes
├── .env.example             # Environment variables template
├── server.js                # Main application file
├── package.json             # Dependencies and scripts
└── README.md                # This file
```

## Security Features

- **Helmet.js**: Security headers
- **CORS**: Configurable cross-origin requests
- **Environment Variables**: Secure configuration
- **Input Validation**: Server-side validation and sanitization
- **Error Handling**: Prevents information leakage

## Production Deployment

1. **Set environment variables:**
   ```env
   NODE_ENV=production
   MONGODB_URI=your_production_mongodb_uri
   PORT=3000
   ```

2. **Update CORS origins** in `server.js` to match your frontend domain

3. **Use a process manager** like PM2:
   ```bash
   npm install -g pm2
   pm2 start server.js --name "api-server"
   ```

## Health Check

The server includes a health check endpoint:

**GET** `/health`

```json
{
  "success": true,
  "message": "Server is running",
  "timestamp": "2024-01-15T10:30:00.000Z"
}
```

## Contributing

1. Follow the existing code structure and naming conventions
2. Add validation for new fields
3. Update this README when adding new endpoints
4. Test all endpoints before submitting changes

## License

ISC License