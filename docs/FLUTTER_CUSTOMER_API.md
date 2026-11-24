# BuilDeck - Customer API Documentation for Flutter Developers

> **Base URL:** `https://your-domain.com/api` (Local: `http://10.0.2.2:8000/api` for Android Emulator or `http://localhost:8000/api` for iOS Simulator)  
> **Default Headers:**
> ```http
> Accept: application/json
> ```
> For Authenticated Requests:
> ```http
> Authorization: Bearer <SANCTUM_TOKEN>
> ```

---

## 📌 Standard API Response Structure

All endpoints return a uniform JSON format:

```json
{
  "auth_status": true,
  "res": "success",
  "msg": "Response message here.",
  "token_type": "Bearer",
  "data": { ... }
}
```

- `auth_status`: `true` if user is authenticated / token issued, else `false`.
- `res`: `"success"` or `"error"`.
- `msg`: Human-readable message (useful for showing SnackBar/Toast).
- `data`: Payload containing models, lists, or tokens.

---

## 🗺️ 1. Location Support APIs (Dropdowns)

### 1.1 Get All States
Load states for the state dropdown during registration/profile edit.

- **Method:** `GET`
- **URL:** `/locations/states`
- **Auth:** Not required

#### ✅ Success Response (200 OK)
```json
{
  "auth_status": false,
  "res": "success",
  "msg": "States fetched successfully.",
  "token_type": "Bearer",
  "data": [
    {
      "id": 10,
      "name": "Delhi"
    },
    {
      "id": 24,
      "name": "Maharashtra"
    },
    {
      "id": 33,
      "name": "Uttar Pradesh"
    }
  ]
}
```

---

### 1.2 Get Cities by State ID
Load cities when the customer selects a state.

- **Method:** `GET`
- **URL:** `/locations/cities/{stateId}`
- **Example:** `/locations/cities/33`
- **Auth:** Not required

#### ✅ Success Response (200 OK)
```json
{
  "auth_status": false,
  "res": "success",
  "msg": "Cities fetched successfully.",
  "token_type": "Bearer",
  "data": [
    {
      "id": 101,
      "name": "Lucknow"
    },
    {
      "id": 102,
      "name": "Kanpur"
    },
    {
      "id": 103,
      "name": "Noida"
    }
  ]
}
```

---

## 👤 2. Customer Authentication APIs

### 2.1 Customer Registration
Used when a new customer registers. Supports file uploads for profile photo and KYC documents.

- **Method:** `POST`
- **URL:** `/customer/register`
- **Content-Type:** `multipart/form-data`
- **Auth:** Not required

#### 📥 Request Parameters (Form-Data)

| Key | Type | Required | Description |
| :--- | :--- | :--- | :--- |
| `name` | String | **Yes** | Full Name of Customer (e.g. `Ramesh Sharma`) |
| `mobile` | String | **Yes** | 10-digit mobile number (e.g. `9876543210`) |
| `email` | String | No | Valid email address |
| `state_id` | Integer | **Yes** | Selected State ID from `/locations/states` |
| `city_id` | Integer | **Yes** | Selected City ID from `/locations/cities/{stateId}` |
| `address` | String | No | Street / House address |
| `zip` | String | No | 6-digit Pincode (e.g. `201301`) |
| `lat` | Double | No | Latitude coordinate (e.g. `28.5355`) |
| `long` | Double | No | Longitude coordinate (e.g. `77.3910`) |
| `aadhaar` | String | No | 12-digit Aadhaar Number |
| `pan` | String | No | 10-character PAN Number |
| `password` | String | No | Optional account password (min 6 chars) |
| `profile_pic` | File | No | Profile photo (`.jpg`, `.jpeg`, `.png`, max 5MB) |
| `aadhaar_doc` | File | No | Aadhaar document (`.pdf`, `.jpg`, `.png`, max 5MB) |
| `pan_doc` | File | No | PAN card document (`.pdf`, `.jpg`, `.png`, max 5MB) |

#### ✅ Success Response (201 Created)
```json
{
  "auth_status": false,
  "res": "success",
  "msg": "Customer onboarding request submitted successfully. Admin will review and approve your account.",
  "token_type": "Bearer",
  "data": {
    "id": 14,
    "name": "Ramesh Sharma",
    "mobile": "9876543210",
    "email": "ramesh@example.com",
    "status": "pending",
    "city": "Noida",
    "state": "Uttar Pradesh",
    "created_at": "2026-11-02T13:00:00.000000Z"
  }
}
```

#### ⚠️ Error Responses
- **409 Conflict** (Already Registered / Under Review):
  ```json
  {
    "auth_status": false,
    "res": "error",
    "msg": "Your onboarding request has already been submitted and is currently pending admin review.",
    "token_type": "Bearer",
    "data": {
      "id": 14,
      "name": "Ramesh Sharma",
      "mobile": "9876543210",
      "status": "pending"
    }
  }
  ```
- **422 Unprocessable Content** (Validation Failed):
  ```json
  {
    "auth_status": false,
    "res": "error",
    "msg": "The mobile field is required.",
    "token_type": "Bearer",
    "data": {
      "mobile": ["The mobile field is required."]
    }
  }
  ```

---

### 2.2 Customer Login
Login using Mobile Number (or Email) and Password.

- **Method:** `POST`
- **URL:** `/customer/login`
- **Content-Type:** `application/json`
- **Auth:** Not required

#### 📥 Request Body
Supports optional `lat`, `long`, or `latlong` string format. If provided, the login response directly reverts the nearby available products (`items`) matching the customer's area!

```json
{
  "login": "9876543210",
  "password": "yourPassword123",
  "lat": 26.38967,
  "long": 80.48587346,
  "latlong": "(26.38967,80.48587346)"
}
```
*(Note: `lat`, `long`, and `latlong` are completely **optional**)*

#### ✅ Success Response (200 OK)
```json
{
  "auth_status": true,
  "res": "success",
  "msg": "Login successful.",
  "token_type": "Bearer",
  "data": {
    "token": "1|qXyZ1234567890abcdef...",
    "user": {
      "id": 14,
      "name": "Ramesh Sharma",
      "email": "ramesh@example.com",
      "mobile": "9876543210",
      "role": "customer",
      "status": "approved",
      "address": "Flat 402, Lotus Arena, Sector 150",
      "city": "Noida",
      "state": "Uttar Pradesh",
      "zip": "201301",
      "lat": 26.38967,
      "long": 80.48587346,
      "profile_pic": "https://your-domain.com/storage/customer_documents/photo123.jpg"
    },
    "customer_location": {
      "lat": 26.38967,
      "long": 80.48587346
    },
    "items": [
      {
        "id": 10,
        "name": "UltraTech Super Cement",
        "brand_name": "UltraTech",
        "cover_image_url": "https://your-domain.com/storage/products/cement.jpg",
        "base_uom": "Kilogram",
        "base_uom_symbol": "kg",
        "available_vendors_count": 3,
        "starting_price": 380.00
      }
    ]
  }
}
```

#### ⚠️ Error Responses
- **401 Unauthorized** (Wrong Password or User Not Found):
  ```json
  {
    "auth_status": false,
    "res": "error",
    "msg": "Invalid login credentials.",
    "token_type": "Bearer",
    "data": []
  }
  ```
- **403 Forbidden** (Pending Admin Approval):
  ```json
  {
    "auth_status": false,
    "res": "error",
    "msg": "Your customer account is pending admin approval. You can login once approved.",
    "token_type": "Bearer",
    "data": { "status": "pending" }
  }
  ```

---

## 🔒 3. Authenticated Customer APIs (Requires Bearer Token)

### 3.1 Get Profile Details
Fetches full profile information of the logged-in customer.

- **Method:** `GET`
- **URL:** `/customer/profile`
- **Headers:** `Authorization: Bearer <TOKEN>`

#### ✅ Success Response (200 OK)
```json
{
  "auth_status": true,
  "res": "success",
  "msg": "Customer profile fetched successfully.",
  "token_type": "Bearer",
  "data": {
    "user": {
      "id": 14,
      "name": "Ramesh Sharma",
      "email": "ramesh@example.com",
      "mobile": "9876543210",
      "role": "customer",
      "status": "approved",
      "address": "Sector 150",
      "city_id": 103,
      "city": "Noida",
      "state_id": 33,
      "state": "Uttar Pradesh",
      "zip": "201301",
      "lat": "28.53550000",
      "long": "77.39100000",
      "aadhaar": "123456789012",
      "pan": "ABCDE1234F",
      "profile_pic": "https://your-domain.com/storage/customer_documents/photo123.jpg",
      "created_at": "2026-11-02T13:00:00.000000Z"
    }
  }
}
```

---

### 3.2 Update Profile
Update profile info or profile picture.

- **Method:** `POST`
- **URL:** `/customer/profile`
- **Headers:** `Authorization: Bearer <TOKEN>`
- **Content-Type:** `multipart/form-data`

#### 📥 Request Parameters (Form-Data)
All fields are optional (`sometimes`):
- `name` (String)
- `email` (String)
- `address` (String)
- `state_id` (Integer)
- `city_id` (Integer)
- `zip` (String)
- `lat` (Double)
- `long` (Double)
- `profile_pic` (File)

#### ✅ Success Response (200 OK)
```json
{
  "auth_status": true,
  "res": "success",
  "msg": "Profile updated successfully.",
  "token_type": "Bearer",
  "data": {
    "user": { ... }
  }
}
```

---

### 3.3 Customer Logout
Revokes the current authentication token.

- **Method:** `POST`
- **URL:** `/customer/logout`
- **Headers:** `Authorization: Bearer <TOKEN>`

#### ✅ Success Response (200 OK)
```json
{
  "auth_status": false,
  "res": "success",
  "msg": "Logged out successfully.",
  "token_type": "Bearer",
  "data": []
}
```

---

## 🚀 4. Flutter Dart Code Integration Examples

### 4.1 Customer Registration (Dio Example)

```dart
import 'dart:io';
import 'package:dio/dio.dart';

Future<void> registerCustomer({
  required String name,
  required String mobile,
  String? email,
  required int stateId,
  required int cityId,
  String? address,
  String? zip,
  File? profilePic,
  File? aadhaarDoc,
  File? panDoc,
}) async {
  final dio = Dio(BaseOptions(
    baseUrl: 'https://your-domain.com/api',
    headers: {'Accept': 'application/json'},
  ));

  FormData formData = FormData.fromMap({
    'name': name,
    'mobile': mobile,
    'email': email,
    'state_id': stateId,
    'city_id': cityId,
    'address': address,
    'zip': zip,
    if (profilePic != null)
      'profile_pic': await MultipartFile.fromFile(profilePic.path),
    if (aadhaarDoc != null)
      'aadhaar_doc': await MultipartFile.fromFile(aadhaarDoc.path),
    if (panDoc != null)
      'pan_doc': await MultipartFile.fromFile(panDoc.path),
  });

  try {
    final response = await dio.post('/customer/register', data: formData);
    print(response.data['msg']); // Show in SnackBar
  } on DioException catch (e) {
    if (e.response != null) {
      print('Error: ${e.response?.data['msg']}');
    }
  }
}
```

---

### 4.2 Customer Login Example (With Coordinates Support)

```dart
Future<Map<String, dynamic>?> loginCustomer({
  required String login, // Mobile or Email
  required String password,
  double? lat,
  double? long,
  String? latlong, // e.g. "(26.38967,80.48587346)"
}) async {
  final dio = Dio(BaseOptions(
    baseUrl: 'https://your-domain.com/api',
    headers: {'Accept': 'application/json'},
  ));

  try {
    final response = await dio.post('/customer/login', data: {
      'login': login,
      'password': password,
      if (lat != null) 'lat': lat,
      if (long != null) 'long': long,
      if (latlong != null) 'latlong': latlong,
    });

    final String token = response.data['data']['token'];
    final List<dynamic> nearbyItems = response.data['data']['items'] ?? [];
    // Save token to flutter_secure_storage
    // Display nearby items immediately on home catalog!
    return response.data['data'];
  } on DioException catch (e) {
    print('Login Failed: ${e.response?.data['msg']}');
    return null;
  }
}
```

---

## 🛍️ 5. Customer Geo-Catalog & Product Discovery APIs

### 5.1 Get Geo-Located Items Catalog
Customer ke location ke according nearby vendors ke master items flash karta hai.

- **Method:** `GET`
- **URL:** `/customer/catalog`
- **Query Parameters:** `lat`, `long`, `latlong` (all optional, falls back to saved user coords if authenticated), `search`, `category_id`
- **Auth:** Optional

#### Response (200 OK)
```json
{
  "auth_status": true,
  "res": "success",
  "msg": "Nearby items fetched successfully.",
  "data": {
    "customer_location": { "lat": 26.38967, "long": 80.48587346 },
    "total_items": 12,
    "items": [
      {
        "id": 10,
        "name": "UltraTech Super Cement",
        "brand_name": "UltraTech",
        "cover_image_url": "https://domain.com/storage/products/cement.jpg",
        "base_uom": "Kilogram",
        "base_uom_symbol": "kg",
        "available_vendors_count": 3,
        "starting_price": 380.00
      }
    ]
  }
}
```

---

### 5.2 Get Product Details & Available Vendors in Area
Item click par detailed page open hota hai jisme product specifications aur user ke area me provide karne wale vendors ki live list milti hai.

- **Method:** `GET`
- **URL:** `/customer/products/{productId}`
- **Query Parameters:** `lat`, `long`, `latlong` (optional)
- **Auth:** Optional

#### Response (200 OK)
```json
{
  "auth_status": true,
  "res": "success",
  "msg": "Product details and nearby vendors loaded.",
  "data": {
    "product": {
      "id": 10,
      "name": "UltraTech Super Cement",
      "brand": { "id": 2, "name": "UltraTech", "logo_url": "..." },
      "cover_image_url": "https://domain.com/storage/products/cement.jpg",
      "description": "Premium quality cement...",
      "specifications": { "grade": "PPC 53" }
    },
    "nearby_vendors": [
      {
        "vendor_id": 4,
        "vendor_name": "Gupta Hardware & Sanitary",
        "distance_km": 2.3,
        "available_stock": 250.0,
        "is_in_stock": true,
        "starting_price": 380.00,
        "allows_loose_sale": true
      }
    ]
  }
}
```

---

### 5.3 Vendor Pricing Drawer (BottomSheet)
Vendor click par drawer flash karne ke liye packaging aur price options fetch karein:
- **Method:** `GET`
- **URL:** `/customer/products/{productId}/pricing-modal?vendor_id={vendorId}`

### 5.4 Add to Cart
Drawer me Complete Package ya Loose Sale input submit karne par cart me add karein:
- **Method:** `POST`
- **URL:** `/customer/cart/add`
- **Auth:** Required (Bearer Token)
- **Body:**
```json
{
  "vendor_id": 4,
  "product_id": 10,
  "uom_id": 1,
  "purchase_type": "loose",
  "quantity": 15.5
}
```
*(Ya Full Package: `"purchase_type": "package"`, `"quantity": 2`)*

    return null;
  }
}
```
