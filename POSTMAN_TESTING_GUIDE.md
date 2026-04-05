# DRUGSTORE MANAGEMENT SYSTEM - POSTMAN API COLLECTION

**Base URL:** `http://localhost:5000/api`

**Authentication:** Most endpoints require JWT token in `Authorization: Bearer <token>` header

---

## 1. AUTHENTICATION APIs

### 1.1 Register User
```
Method: POST
URL: {{base_url}}/auth/register
Headers: Content-Type: application/json
Body (raw JSON):
{
  "firstName": "Nguyen",
  "lastName": "Van A",
  "email": "nguyenvana@example.com",
  "phone": "0987654321",
  "password": "password123",
  "passwordConfirm": "password123"
}
```

### 1.2 Login User
```
Method: POST
URL: {{base_url}}/auth/login
Headers: Content-Type: application/json
Body (raw JSON):
{
  "email": "nguyenvana@example.com",
  "password": "password123"
}
```

### 1.3 Get Current User
```
Method: GET
URL: {{base_url}}/auth/me
Headers: Authorization: Bearer {{token}}
```

### 1.4 Change Password
```
Method: PUT
URL: {{base_url}}/auth/change-password
Headers:
  Authorization: Bearer {{token}}
  Content-Type: application/json
Body (raw JSON):
{
  "currentPassword": "password123",
  "newPassword": "newpassword123",
  "newPasswordConfirm": "newpassword123"
}
```

### 1.5 Logout
```
Method: POST
URL: {{base_url}}/auth/logout
Headers: Authorization: Bearer {{token}}
```

---

## 2. PRODUCT APIs

### 2.1 Create Product (with Image)
```
Method: POST
URL: {{base_url}}/products
Headers: Authorization: Bearer {{admin_token}}
Body: form-data
  image: <select image file>
  name: "Paracetamol"
  sku: "PAR001"
  description: "Thuốc giảm đau hạ sốt"
  category: "{{category_id}}"
  manufacturer: "{{manufacturer_id}}"
  price: 25.000
  dosage: "500mg"
  form: "Viên nén"
  requiresPrescription: false
  sideEffects: ["Buồn nôn", "Chóng mặt"]
  warnings: ["Không dùng cho trẻ em dưới 12 tuổi"]
```

### 2.2 Get All Products
```
Method: GET
URL: {{base_url}}/products?page=1&limit=10
Headers: (none required - public)
```

### 2.3 Get All Products with Filters
```
Method: GET
URL: {{base_url}}/products?page=1&limit=5&category={{category_id}}&minPrice=10&maxPrice=100
Headers: (none required - public)
```

### 2.4 Get Single Product
```
Method: GET
URL: {{base_url}}/products/{{product_id}}
Headers: (none required - public)
```

### 2.5 Search Products
```
Method: GET
URL: {{base_url}}/products/search/paracetamol
Headers: (none required - public)
```

### 2.6 Get Products by Category
```
Method: GET
URL: {{base_url}}/products/category/{{category_id}}
Headers: (none required - public)
```

### 2.7 Get Prescription Required Products
```
Method: GET
URL: {{base_url}}/products/prescription/required
Headers: (none required - public)
```

### 2.8 Update Product (with Image)
```
Method: PUT
URL: {{base_url}}/products/{{product_id}}
Headers: Authorization: Bearer {{admin_token}}
Body: form-data
  image: <select new image file - optional>
  name: "Paracetamol 500mg"
  price: 30.000
  description: "Thuốc giảm đau hạ sốt hiệu quả"
```

### 2.9 Delete Product
```
Method: DELETE
URL: {{base_url}}/products/{{product_id}}
Headers: Authorization: Bearer {{admin_token}}
```

---

## 3. ORDER APIs

### 3.1 Create Order
```
Method: POST
URL: {{base_url}}/orders
Headers:
  Authorization: Bearer {{customer_token}}
  Content-Type: application/json
Body (raw JSON):
{
  "items": [
    {
      "productId": "{{product_id_1}}",
      "quantity": 2
    },
    {
      "productId": "{{product_id_2}}",
      "quantity": 1
    }
  ],
  "shippingAddress": {
    "street": "123 Đường ABC",
    "city": "Hồ Chí Minh",
    "state": "HCM",
    "zipCode": "70000",
    "country": "Việt Nam"
  },
  "paymentMethod": "Thẻ tín dụng"
}
```

### 3.2 Get User's Orders
```
Method: GET
URL: {{base_url}}/orders/my-orders?page=1&limit=10
Headers: Authorization: Bearer {{customer_token}}
```

### 3.3 Get Single Order
```
Method: GET
URL: {{base_url}}/orders/{{order_id}}
Headers: Authorization: Bearer {{customer_token}}
```

### 3.4 Cancel Order
```
Method: PUT
URL: {{base_url}}/orders/{{order_id}}/cancel
Headers: Authorization: Bearer {{customer_token}}
```

### 3.5 Get All Orders (Admin)
```
Method: GET
URL: {{base_url}}/orders/admin/all?page=1&limit=10&status=Pending
Headers: Authorization: Bearer {{admin_token}}
```

### 3.6 Update Order Status (Admin)
```
Method: PUT
URL: {{base_url}}/orders/{{order_id}}/status
Headers:
  Authorization: Bearer {{admin_token}}
  Content-Type: application/json
Body (raw JSON):
{
  "status": "Shipped"
}
```

### 3.7 Update Payment Status (Admin)
```
Method: PUT
URL: {{base_url}}/orders/{{order_id}}/payment
Headers:
  Authorization: Bearer {{admin_token}}
  Content-Type: application/json
Body (raw JSON):
{
  "paymentStatus": "Completed"
}
```

### 3.8 Get Order Statistics (Admin)
```
Method: GET
URL: {{base_url}}/orders/stats/summary
Headers: Authorization: Bearer {{admin_token}}
```

---

## 4. PRESCRIPTION APIs

### 4.1 Create Prescription (with Image)
```
Method: POST
URL: {{base_url}}/prescriptions
Headers: Authorization: Bearer {{pharmacist_token}}
Body: form-data
  prescriptionImage: <select prescription image file>
  customerId: "{{customer_id}}"
  doctorName: "BS. Nguyễn Văn Bác"
  licenseNumber: "LIC123456"
  specialization: "Nội khoa"
  prescriptionDate: "2026-04-04"
  expiryDate: "2026-05-04"
  notes: "Uống sau ăn"
  items: [
    {
      "productId": "{{prescription_product_id}}",
      "quantity": 30,
      "frequency": "2 lần/ngày",
      "duration": "30 ngày",
      "instructions": "Sau ăn sáng và tối"
    }
  ]
```

### 4.2 Get User's Prescriptions
```
Method: GET
URL: {{base_url}}/prescriptions/my-prescriptions?page=1&limit=10
Headers: Authorization: Bearer {{customer_token}}
```

### 4.3 Get Single Prescription
```
Method: GET
URL: {{base_url}}/prescriptions/{{prescription_id}}
Headers: Authorization: Bearer {{customer_token}}
```

### 4.4 Check Prescription Validity
```
Method: GET
URL: {{base_url}}/prescriptions/{{prescription_id}}/validity
Headers: Authorization: Bearer {{customer_token}}
```

### 4.5 Add Items to Prescription
```
Method: POST
URL: {{base_url}}/prescriptions/{{prescription_id}}/items
Headers:
  Authorization: Bearer {{pharmacist_token}}
  Content-Type: application/json
Body (raw JSON):
{
  "items": [
    {
      "productId": "{{another_product_id}}",
      "quantity": 20,
      "frequency": "1 lần/ngày",
      "duration": "20 ngày",
      "instructions": "Sáng sớm"
    }
  ]
}
```

### 4.6 Update Prescription Status
```
Method: PUT
URL: {{base_url}}/prescriptions/{{prescription_id}}/status
Headers:
  Authorization: Bearer {{pharmacist_token}}
  Content-Type: application/json
Body (raw JSON):
{
  "status": "Approved"
}
```

### 4.7 Update Prescription Item
```
Method: PUT
URL: {{base_url}}/prescriptions/items/{{item_id}}
Headers:
  Authorization: Bearer {{pharmacist_token}}
  Content-Type: application/json
Body (raw JSON):
{
  "quantity": 25,
  "frequency": "3 lần/ngày",
  "duration": "25 ngày",
  "instructions": "Sau mỗi bữa ăn",
  "quantityDispensed": 15
}
```

### 4.8 Delete Prescription
```
Method: DELETE
URL: {{base_url}}/prescriptions/{{prescription_id}}
Headers: Authorization: Bearer {{pharmacist_token}}
```

### 4.9 Get All Prescriptions (Pharmacist)
```
Method: GET
URL: {{base_url}}/prescriptions/admin/all?page=1&limit=10&status=Pending
Headers: Authorization: Bearer {{pharmacist_token}}
```

### 4.10 Get Pending Prescriptions
```
Method: GET
URL: {{base_url}}/prescriptions/pending/list?page=1&limit=10
Headers: Authorization: Bearer {{pharmacist_token}}
```

---

## 5. HEALTH CHECK API

### 5.1 Server Health Check
```
Method: GET
URL: {{base_url}}/health
Headers: (none required)
```

---

## POSTMAN ENVIRONMENT SETUP

### Environment Variables (Create in Postman)
```
base_url = http://localhost:5000/api

// Tokens (will be set after login)
customer_token =
admin_token =
pharmacist_token =

// IDs (will be set after creating resources)
product_id =
category_id =
manufacturer_id =
order_id =
prescription_id =
customer_id =
prescription_product_id =
item_id =
```

### Testing Order:
1. **Start Server:** `npm run dev`
2. **Create Environment** in Postman with above variables
3. **Test Auth APIs** first (Register/Login to get tokens)
4. **Test Product APIs** (Create products, get products)
5. **Test Order APIs** (Create orders, manage orders)
6. **Test Prescription APIs** (Create prescriptions, manage workflow)

### Sample Test Flow:
1. Register Admin user → Login → Save admin_token
2. Register Customer user → Login → Save customer_token
3. Register Pharmacist user → Login → Save pharmacist_token
4. Create Category (if needed) → Save category_id
5. Create Manufacturer (if needed) → Save manufacturer_id
6. Create Product → Save product_id
7. Create Order (as customer) → Save order_id
8. Create Prescription (as pharmacist) → Save prescription_id

### Common Issues:
- **401 Unauthorized:** Check token is valid and not expired
- **403 Forbidden:** Check user role permissions
- **404 Not Found:** Check IDs exist in database
- **400 Bad Request:** Check required fields and data types
- **500 Server Error:** Check server logs, MongoDB connection

### File Upload Notes:
- Use **form-data** for image uploads
- Supported formats: JPEG, PNG, GIF, WebP
- Max size: 5MB
- Images accessible at: `http://localhost:5000/uploads/filename`

---

## QUICK TEST COMMANDS

### Start Server:
```bash
cd d:\1tuan
npm install
npm run dev
```

### Check if server is running:
```bash
curl http://localhost:5000/api/health
```

### Import to Postman:
1. Copy this entire document
2. In Postman: File → Import → Raw text
3. Create environment with variables above
4. Start testing!

---

**Total APIs: 30+ endpoints across 4 modules**
**Ready for comprehensive testing!** 🚀