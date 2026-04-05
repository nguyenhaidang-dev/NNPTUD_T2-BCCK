# Drugstore Management System - API Endpoints

**Base URL:** `http://localhost:5000/api`

**Authentication:** Most endpoints require JWT token in `Authorization: Bearer <token>` header

---

## 1. AUTH ENDPOINTS

### Register User
```
POST /auth/register
```
**Access:** Public

**Body:**
```json
{
  "firstName": "John",
  "lastName": "Doe",
  "email": "john@example.com",
  "phone": "9876543210",
  "password": "password123",
  "passwordConfirm": "password123"
}
```

**Response:**
```json
{
  "success": true,
  "message": "User registered successfully",
  "token": "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9...",
  "user": {
    "_id": "...",
    "firstName": "John",
    "lastName": "Doe",
    "email": "john@example.com",
    "role": "..."
  }
}
```

---

### Login User
```
POST /auth/login
```
**Access:** Public

**Body:**
```json
{
  "email": "john@example.com",
  "password": "password123"
}
```

**Response:**
```json
{
  "success": true,
  "message": "Logged in successfully",
  "token": "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9...",
  "user": {
    "_id": "...",
    "firstName": "John",
    "email": "john@example.com"
  }
}
```

---

### Get Current User
```
GET /auth/me
```
**Access:** Private (Requires Token)

**Headers:**
```
Authorization: Bearer <token>
```

**Response:**
```json
{
  "success": true,
  "data": {
    "_id": "...",
    "firstName": "John",
    "lastName": "Doe",
    "email": "john@example.com",
    "role": {...}
  }
}
```

---

### Change Password
```
PUT /auth/change-password
```
**Access:** Private (Requires Token)

**Headers:**
```
Authorization: Bearer <token>
```

**Body:**
```json
{
  "currentPassword": "password123",
  "newPassword": "newpassword123",
  "newPasswordConfirm": "newpassword123"
}
```

**Response:**
```json
{
  "success": true,
  "message": "Password changed successfully"
}
```

---

### Logout
```
POST /auth/logout
```
**Access:** Private (Requires Token)

**Headers:**
```
Authorization: Bearer <token>
```

**Response:**
```json
{
  "success": true,
  "message": "Logged out successfully"
}
```

---

## 2. PRODUCT ENDPOINTS

### Create Product (with Image)
```
POST /products
```
**Access:** Private/Admin

**Headers:**
```
Authorization: Bearer <admin-token>
Content-Type: multipart/form-data
```

**Form Data:**
```
image: <file>
name: "Aspirin"
sku: "ASP001"
description: "Pain reliever"
category: "507f1f77bcf86cd799439011"
manufacturer: "507f1f77bcf86cd799439012"
price: 5.99
dosage: "500mg"
form: "Tablet"
requiresPrescription: false
sideEffects: ["Stomach upset", "Nausea"]
warnings: ["Do not use if allergic to aspirin"]
```

**Response:**
```json
{
  "success": true,
  "message": "Product created successfully",
  "data": {
    "_id": "...",
    "name": "Aspirin",
    "sku": "ASP001",
    "price": 5.99,
    "image": "/uploads/Aspirin-1712200000000-123456789.png",
    "category": {...},
    "manufacturer": {...}
  }
}
```

---

### Get All Products (with Filters)
```
GET /products
GET /products?page=1&limit=10
GET /products?category=categoryId
GET /products?manufacturer=manufacturerId
GET /products?minPrice=100&maxPrice=500
GET /products?search=aspirin
```
**Access:** Public

**Query Parameters:**
- `page` (default: 1)
- `limit` (default: 10)
- `category` - Filter by category ID
- `manufacturer` - Filter by manufacturer ID
- `minPrice` - Minimum price
- `maxPrice` - Maximum price
- `search` - Search by name, description, or SKU

**Response:**
```json
{
  "success": true,
  "count": 5,
  "total": 45,
  "pages": 9,
  "currentPage": 1,
  "data": [
    {
      "_id": "...",
      "name": "Aspirin",
      "sku": "ASP001",
      "price": 5.99,
      "image": "/uploads/...",
      "category": {...},
      "manufacturer": {...}
    }
  ]
}
```

---

### Get Single Product
```
GET /products/:id
```
**Access:** Public

**Example:**
```
GET /products/507f1f77bcf86cd799439011
```

**Response:**
```json
{
  "success": true,
  "data": {
    "_id": "507f1f77bcf86cd799439011",
    "name": "Aspirin",
    "sku": "ASP001",
    "price": 5.99,
    "description": "Pain reliever",
    "category": {...},
    "manufacturer": {...}
  }
}
```

---

### Search Products
```
GET /products/search/:query
```
**Access:** Public

**Example:**
```
GET /products/search/aspirin
```

**Response:**
```json
{
  "success": true,
  "count": 5,
  "data": [...]
}
```

---

### Get Products by Category
```
GET /products/category/:categoryId
```
**Access:** Public

**Response:**
```json
{
  "success": true,
  "count": 10,
  "data": [...]
}
```

---

### Get Prescription Required Products
```
GET /products/prescription/required
```
**Access:** Public

**Response:**
```json
{
  "success": true,
  "count": 8,
  "data": [...]
}
```

---

### Update Product (with Image)
```
PUT /products/:id
```
**Access:** Private/Admin

**Headers:**
```
Authorization: Bearer <admin-token>
Content-Type: multipart/form-data
```

**Form Data:** (All fields optional)
```
image: <file> (optional - replaces old image)
name: "Aspirin Plus"
price: 6.99
dosage: "500mg"
isActive: true
```

**Response:**
```json
{
  "success": true,
  "message": "Product updated successfully",
  "data": {...}
}
```

---

### Delete Product
```
DELETE /products/:id
```
**Access:** Private/Admin

**Headers:**
```
Authorization: Bearer <admin-token>
```

**Response:**
```json
{
  "success": true,
  "message": "Product deleted successfully",
  "data": {...}
}
```

---

## 3. ORDER ENDPOINTS

### Create Order
```
POST /orders
```
**Access:** Private

**Headers:**
```
Authorization: Bearer <customer-token>
Content-Type: application/json
```

**Body:**
```json
{
  "items": [
    {
      "productId": "507f1f77bcf86cd799439011",
      "quantity": 2
    },
    {
      "productId": "507f1f77bcf86cd799439012",
      "quantity": 1
    }
  ],
  "shippingAddress": {
    "street": "123 Main St",
    "city": "New York",
    "state": "NY",
    "zipCode": "10001",
    "country": "USA"
  },
  "paymentMethod": "Credit Card"
}
```

**Response:**
```json
{
  "success": true,
  "message": "Order created successfully",
  "data": {
    "order": {
      "orderNumber": "ORD-202404-000001",
      "subtotal": 100,
      "taxAmount": 10,
      "shippingCost": 50,
      "totalAmount": 160,
      "status": "Pending",
      "paymentStatus": "Pending"
    },
    "items": [...]
  }
}
```

---

### Get User's Orders
```
GET /orders/my-orders
GET /orders/my-orders?page=1&limit=10
GET /orders/my-orders?status=Delivered
```
**Access:** Private

**Headers:**
```
Authorization: Bearer <customer-token>
```

**Query Parameters:**
- `page` (default: 1)
- `limit` (default: 10)
- `status` - Pending, Processing, Shipped, Delivered, Cancelled

**Response:**
```json
{
  "success": true,
  "count": 5,
  "total": 15,
  "pages": 3,
  "currentPage": 1,
  "data": [...]
}
```

---

### Get Single Order
```
GET /orders/:id
```
**Access:** Private (User owns order or Admin)

**Headers:**
```
Authorization: Bearer <token>
```

**Response:**
```json
{
  "success": true,
  "data": {
    "order": {
      "_id": "...",
      "orderNumber": "ORD-202404-000001",
      "customer": {...},
      "status": "Pending",
      "totalAmount": 160
    },
    "items": [
      {
        "_id": "...",
        "product": {...},
        "quantity": 2,
        "unitPrice": 50,
        "lineTotal": 100
      }
    ]
  }
}
```

---

### Cancel Order
```
PUT /orders/:id/cancel
```
**Access:** Private (User owns order or Admin)

**Headers:**
```
Authorization: Bearer <token>
```

**Response:**
```json
{
  "success": true,
  "message": "Order cancelled successfully",
  "data": {
    "status": "Cancelled"
  }
}
```

---

### Get All Orders (Admin)
```
GET /orders/admin/all
GET /orders/admin/all?page=1&limit=10
GET /orders/admin/all?status=Processing
```
**Access:** Private/Admin

**Headers:**
```
Authorization: Bearer <admin-token>
```

**Response:**
```json
{
  "success": true,
  "count": 10,
  "total": 150,
  "pages": 15,
  "currentPage": 1,
  "data": [...]
}
```

---

### Update Order Status (Admin)
```
PUT /orders/:id/status
```
**Access:** Private/Admin

**Headers:**
```
Authorization: Bearer <admin-token>
Content-Type: application/json
```

**Body:**
```json
{
  "status": "Shipped"
}
```

**Valid Statuses:** Pending, Processing, Shipped, Delivered, Cancelled

**Response:**
```json
{
  "success": true,
  "message": "Order status updated successfully",
  "data": {
    "status": "Shipped",
    "shippedDate": "2026-04-04T10:30:00Z"
  }
}
```

---

### Update Payment Status (Admin)
```
PUT /orders/:id/payment
```
**Access:** Private/Admin

**Headers:**
```
Authorization: Bearer <admin-token>
Content-Type: application/json
```

**Body:**
```json
{
  "paymentStatus": "Completed"
}
```

**Valid Statuses:** Pending, Completed, Failed

**Response:**
```json
{
  "success": true,
  "message": "Payment status updated successfully",
  "data": {
    "paymentStatus": "Completed"
  }
}
```

---

### Get Order Statistics (Admin)
```
GET /orders/stats/summary
```
**Access:** Private/Admin

**Headers:**
```
Authorization: Bearer <admin-token>
```

**Response:**
```json
{
  "success": true,
  "data": {
    "totalOrders": 250,
    "completedOrders": 200,
    "cancelledOrders": 10,
    "pendingOrders": 40,
    "totalRevenue": 50000
  }
}
```

---

## 4. PRESCRIPTION ENDPOINTS

### Create Prescription (with Image)
```
POST /prescriptions
```
**Access:** Private/Pharmacist

**Headers:**
```
Authorization: Bearer <pharmacist-token>
Content-Type: multipart/form-data
```

**Form Data:**
```
prescriptionImage: <file>
customerId: "507f1f77bcf86cd799439011"
doctorName: "Dr. Smith"
licenseNumber: "LIC123456"
specialization: "Cardiologist"
prescriptionDate: "2026-04-04"
expiryDate: "2026-05-04"
notes: "Take with food"
items: [
  {
    "productId": "507f1f77bcf86cd799439013",
    "quantity": 30,
    "frequency": "Twice Daily",
    "duration": "30 days",
    "instructions": "After meals"
  }
]
```

**Response:**
```json
{
  "success": true,
  "message": "Prescription created successfully",
  "data": {
    "prescription": {
      "prescriptionNumber": "RX-202404-00001",
      "status": "Pending",
      "prescriptionImage": "/uploads/prescription-123456789.jpg",
      "doctor": {
        "name": "Dr. Smith",
        "licenseNumber": "LIC123456"
      }
    },
    "items": [...]
  }
}
```

---

### Get User's Prescriptions
```
GET /prescriptions/my-prescriptions
GET /prescriptions/my-prescriptions?page=1&limit=10
GET /prescriptions/my-prescriptions?status=Approved
```
**Access:** Private

**Headers:**
```
Authorization: Bearer <user-token>
```

**Query Parameters:**
- `page` (default: 1)
- `limit` (default: 10)
- `status` - Pending, Approved, Rejected, Filled, Expired

**Response:**
```json
{
  "success": true,
  "count": 3,
  "total": 5,
  "pages": 2,
  "currentPage": 1,
  "data": [...]
}
```

---

### Get Single Prescription
```
GET /prescriptions/:id
```
**Access:** Private (User owns or Pharmacist)

**Headers:**
```
Authorization: Bearer <token>
```

**Response:**
```json
{
  "success": true,
  "data": {
    "prescription": {
      "_id": "...",
      "prescriptionNumber": "RX-202404-00001",
      "status": "Approved",
      "customer": {...},
      "doctor": {...}
    },
    "items": [
      {
        "_id": "...",
        "product": {...},
        "quantity": 30,
        "frequency": "Twice Daily",
        "quantityDispensed": 0
      }
    ]
  }
}
```

---

### Check Prescription Validity
```
GET /prescriptions/:id/validity
```
**Access:** Private

**Headers:**
```
Authorization: Bearer <token>
```

**Response:**
```json
{
  "success": true,
  "data": {
    "prescriptionNumber": "RX-202404-00001",
    "status": "Approved",
    "isValid": true,
    "isExpired": false,
    "expiryDate": "2026-05-04T00:00:00Z",
    "daysRemaining": 25
  }
}
```

---

### Add Items to Prescription
```
POST /prescriptions/:id/items
```
**Access:** Private/Pharmacist

**Headers:**
```
Authorization: Bearer <pharmacist-token>
Content-Type: application/json
```

**Body:**
```json
{
  "items": [
    {
      "productId": "507f1f77bcf86cd799439013",
      "quantity": 20,
      "frequency": "Once Daily",
      "duration": "20 days",
      "instructions": "Before breakfast"
    }
  ]
}
```

**Response:**
```json
{
  "success": true,
  "message": "Items added to prescription successfully",
  "data": [...]
}
```

---

### Update Prescription Status
```
PUT /prescriptions/:id/status
```
**Access:** Private/Pharmacist

**Headers:**
```
Authorization: Bearer <pharmacist-token>
Content-Type: application/json
```

**Body:**
```json
{
  "status": "Approved"
}
```

**Valid Statuses:** Pending, Approved, Rejected, Filled, Expired

**Response:**
```json
{
  "success": true,
  "message": "Prescription status updated successfully",
  "data": {
    "status": "Approved",
    "filledDate": null,
    "filledBy": null
  }
}
```

---

### Update Prescription Item
```
PUT /prescriptions/items/:itemId
```
**Access:** Private/Pharmacist

**Headers:**
```
Authorization: Bearer <pharmacist-token>
Content-Type: application/json
```

**Body:** (All fields optional)
```json
{
  "quantity": 25,
  "frequency": "Three Times Daily",
  "duration": "25 days",
  "instructions": "After each meal",
  "quantityDispensed": 15
}
```

**Response:**
```json
{
  "success": true,
  "message": "Prescription item updated successfully",
  "data": {
    "quantity": 25,
    "quantityDispensed": 15
  }
}
```

---

### Delete Prescription
```
DELETE /prescriptions/:id
```
**Access:** Private/Pharmacist

**Headers:**
```
Authorization: Bearer <pharmacist-token>
```

**Response:**
```json
{
  "success": true,
  "message": "Prescription deleted successfully",
  "data": {...}
}
```

---

### Get All Prescriptions (Admin/Pharmacist)
```
GET /prescriptions/admin/all
GET /prescriptions/admin/all?page=1&limit=10
GET /prescriptions/admin/all?status=Pending
GET /prescriptions/admin/all?customerId=507f...
```
**Access:** Private/Pharmacist/Admin

**Headers:**
```
Authorization: Bearer <pharmacist-token>
```

**Query Parameters:**
- `page` (default: 1)
- `limit` (default: 10)
- `status` - Filter by status
- `customerId` - Filter by customer

**Response:**
```json
{
  "success": true,
  "count": 10,
  "total": 50,
  "pages": 5,
  "currentPage": 1,
  "data": [...]
}
```

---

### Get Pending Prescriptions
```
GET /prescriptions/pending/list
GET /prescriptions/pending/list?page=1&limit=10
```
**Access:** Private/Pharmacist

**Headers:**
```
Authorization: Bearer <pharmacist-token>
```

**Response:**
```json
{
  "success": true,
  "count": 8,
  "total": 20,
  "pages": 3,
  "currentPage": 1,
  "data": [...]
}
```

---

## POSTMAN COLLECTION SETUP

### Environment Variables
Create an environment in Postman with these variables:

```
base_url = http://localhost:5000/api
customer_token = <customer_jwt_token>
admin_token = <admin_jwt_token>
pharmacist_token = <pharmacist_jwt_token>
product_id = <created_product_id>
category_id = <created_category_id>
manufacturer_id = <created_manufacturer_id>
order_id = <created_order_id>
prescription_id = <created_prescription_id>
```

### Use in Requests
```
GET {{base_url}}/products
Authorization: Bearer {{customer_token}}
```

---

## ROLE REQUIREMENTS

| Role | Endpoints |
|------|-----------|
| **Customer** | Auth, Get Products, Create Orders, Get Own Orders, Get Own Prescriptions |
| **Pharmacist** | All above + Create Prescriptions, Manage Prescriptions, View All Prescriptions |
| **Admin/Manager** | All endpoints |

---

## ERROR RESPONSES

All errors follow this format:

```json
{
  "success": false,
  "message": "Error description"
}
```

**Common Status Codes:**
- `200` - OK
- `201` - Created
- `400` - Bad Request
- `401` - Unauthorized
- `403` - Forbidden
- `404` - Not Found
- `500` - Server Error

---

## NOTES FOR TESTING

1. **Order of Testing:**
   - First: Auth endpoints (Register/Login to get tokens)
   - Second: Product endpoints (Get/Create products)
   - Third: Order endpoints (Create and manage orders)
   - Fourth: Prescription endpoints (Create and manage prescriptions)

2. **Authentication:**
   - All endpoints except `/auth/register`, `/auth/login`, and `GET /products/*` require JWT token
   - Token format: `Authorization: Bearer <token>`

3. **File Uploads:**
   - Use `multipart/form-data` for product and prescription image uploads
   - Supported formats: JPEG, PNG, GIF, WebP
   - Max file size: 5MB

4. **Common Issues:**
   - Ensure MongoDB is running
   - Check JWT_SECRET in .env matches server.js
   - Verify user roles exist in database before creating users
   - Check inventory levels before creating orders
