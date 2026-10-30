# Vendor API Integration Guide for Flutter Developers

Yeh document Flutter developers ke liye backend APIs ko easily implement karne ke liye banaya gaya hai.

---

## 1. General Configuration

- **Base URL:** `https://your-domain.com/api` (Local development ke liye: Android Emulator `http://10.0.2.2:8000/api`, Physical device `http://YOUR_LOCAL_IP:8000/api`)
- **Default Headers:**
  ```http
  Accept: application/json
  ```
- **Authenticated Headers (Protected Routes):**
  ```http
  Accept: application/json
  Authorization: Bearer <SANCTUM_TOKEN>
  ```

---

## 2. Standard API Response Structure

Backend ka har ek response isi fixed JSON format me return hoga:

```json
{
  "auth_status": true,
  "res": "success",
  "msg": "Action completed successfully.",
  "token_type": "Bearer",
  "data": { ... }
}
```

- `auth_status` *(bool)*: `true` agar authenticated session valid hai, warna `false`.
- `res` *(string)*: `'success'` ya `'error'`.
- `msg` *(string)*: User-friendly message (SnackBar / Toast me display karne ke liye).
- `token_type` *(string)*: Hamesha `'Bearer'`.
- `data` *(dynamic)*: Response payload ya validation errors list/map.

---

## 3. Recommended Dart Models

Aap is base model ko apne Flutter project me use kar sakte hain:

```dart
// lib/models/api_response.dart
class ApiResponse<T> {
  final bool authStatus;
  final String res;
  final String msg;
  final String tokenType;
  final T? data;

  ApiResponse({
    required this.authStatus,
    required this.res,
    required this.msg,
    required this.tokenType,
    this.data,
  });

  bool get isSuccess => res == 'success';

  factory ApiResponse.fromJson(
    Map<String, dynamic> json,
    T Function(dynamic json)? fromJsonT,
  ) {
    return ApiResponse<T>(
      authStatus: json['auth_status'] ?? false,
      res: json['res'] ?? 'error',
      msg: json['msg'] ?? '',
      tokenType: json['token_type'] ?? 'Bearer',
      data: json['data'] != null && fromJsonT != null
          ? fromJsonT(json['data'])
          : json['data'],
    );
  }
}
```

---

## 4. Endpoints Overview

| Action | Method | Endpoint | Auth Required | Content-Type |
| :--- | :--- | :--- | :--- | :--- |
| **Get States** | `GET` | `/locations/states` | No | `application/json` |
| **Get Cities** | `GET` | `/locations/cities/{stateId}` | No | `application/json` |
| **Vendor Onboard Request** | `POST` | `/vendor/register` | No | `multipart/form-data` |
| **Vendor Login** | `POST` | `/vendor/login` | No | `application/json` |
| **Vendor Profile** | `GET` | `/vendor/profile` | Yes (`Bearer token`) | `application/json` |
| **Vendor Logout** | `POST` | `/vendor/logout` | Yes (`Bearer token`) | `application/json` |

---

## 5. Endpoints Detail & Flutter Implementation

### 1) Get States
Registration form me Indian states populate karne ke liye:
- **URL:** `GET /locations/states`
- **Response `data`:**
  ```json
  [
    {"id": 22, "name": "MAHARASHTRA"},
    {"id": 34, "name": "UTTAR PRADESH"}
  ]
  ```

---

### 2) Get Cities by State
State select karne ke baad corresponding cities load karne ke liye:
- **URL:** `GET /locations/cities/{stateId}`
- **Example:** `GET /locations/cities/34`
- **Response `data`:**
  ```json
  [
    {"id": 41, "name": "LUCKNOW"},
    {"id": 44, "name": "AGRA"}
  ]
  ```

---

### 3) Vendor Onboard / Registration Request
Vendor apna registration form aur KYC documents submit karta hai:
- **URL:** `POST /vendor/register`
- **Content-Type:** `multipart/form-data`
- **Fields:**
  - `vendor_name` *(String, Required)*: Shop / Business Name
  - `owner_name` *(String, Required)*: Owner Full Name
  - `mobile` *(String, Required)*: 10 digit mobile
  - `email` *(String, Required)*: Email address
  - `state_id` *(int, Required)*: Selected state ID from states API
  - `city_id` *(int, Required)*: Selected city ID from cities API
  - `address` *(String, Optional)*: Full address
  - `pincode` *(String, Optional)*: 6 digit pincode
  - `supply_radius` *(double, Optional)*: Supply radius in KM
  - `lat` *(double, Optional)*: Latitude
  - `long` *(double, Optional)*: Longitude
  - `gst` *(String, Optional)*: GSTIN
  - `pan` *(String, Optional)*: PAN Number
  - `aadhaar` *(String, Optional)*: 12 digit Aadhaar
  - `bussiness_certificate` *(String, Optional)*: MSME / Shop Act number
  - `aadaar_doc` *(File, Optional)*: Aadhaar Card (.pdf, .jpg, .png)
  - `pan_doc` *(File, Optional)*: PAN Card (.pdf, .jpg, .png)
  - `bussiness_certificate_doc` *(File, Optional)*: Business Certificate (.pdf, .jpg, .png)

#### Flutter Code Example (using `http` package):
```dart
import 'package:http/http.dart' as http;
import 'dart:convert';
import 'dart:io';

Future<ApiResponse> registerVendor({
  required String vendorName,
  required String ownerName,
  required String mobile,
  required String email,
  required int stateId,
  required int cityId,
  String? address,
  String? pincode,
  double? supplyRadius,
  double? lat,
  double? long,
  String? gst,
  String? pan,
  String? aadhaar,
  String? businessCertificate,
  File? aadhaarDoc,
  File? panDoc,
  File? businessCertificateDoc,
}) async {
  final uri = Uri.parse('$baseUrl/vendor/register');
  var request = http.MultipartRequest('POST', uri);
  request.headers['Accept'] = 'application/json';

  // Text Fields
  request.fields['vendor_name'] = vendorName;
  request.fields['owner_name'] = ownerName;
  request.fields['mobile'] = mobile;
  request.fields['email'] = email;
  request.fields['state_id'] = stateId.toString();
  request.fields['city_id'] = cityId.toString();
  if (address != null) request.fields['address'] = address;
  if (pincode != null) request.fields['pincode'] = pincode;
  if (supplyRadius != null) request.fields['supply_radius'] = supplyRadius.toString();
  if (lat != null) request.fields['lat'] = lat.toString();
  if (long != null) request.fields['long'] = long.toString();
  if (gst != null) request.fields['gst'] = gst;
  if (pan != null) request.fields['pan'] = pan;
  if (aadhaar != null) request.fields['aadhaar'] = aadhaar;
  if (businessCertificate != null) request.fields['bussiness_certificate'] = businessCertificate;

  // File Attachments
  if (aadhaarDoc != null) {
    request.files.add(await http.MultipartFile.fromPath('aadaar_doc', aadhaarDoc.path));
  }
  if (panDoc != null) {
    request.files.add(await http.MultipartFile.fromPath('pan_doc', panDoc.path));
  }
  if (businessCertificateDoc != null) {
    request.files.add(await http.MultipartFile.fromPath('bussiness_certificate_doc', businessCertificateDoc.path));
  }

  var streamedResponse = await request.send();
  var response = await http.Response.fromStream(streamedResponse);
  final json = jsonDecode(response.body);

  return ApiResponse.fromJson(json, null);
}
```

---

### 4) Vendor Login
Vendor mobile number ya email aur password ke sath login karta hai:
- **URL:** `POST /vendor/login`
- **Request Body (JSON):**
  ```json
  {
    "login": "9876543210",
    "password": "your_password"
  }
  ```

#### Success Response (200 OK):
```json
{
  "auth_status": true,
  "res": "success",
  "msg": "Login successful.",
  "token_type": "Bearer",
  "data": {
    "token": "1|abcdef123456789...",
    "user": {
      "id": 5,
      "name": "Ramesh Sharma",
      "email": "vendor@example.com",
      "mobile": "9876543210",
      "role": "vendor",
      "status": "approved"
    },
    "vendor_profile": {
      "id": 1,
      "vendor_name": "Ramesh Hardware Supplies",
      "owner_name": "Ramesh Sharma",
      "address": "Shop 12, Main Road",
      "city": "LUCKNOW",
      "state": "UTTAR PRADESH",
      "pincode": "226001",
      "status": "approved"
    }
  }
}
```

> **Important Note for Mobile Devs:**
> Login success hone ke baad `data.token` ko secure storage (jaise `flutter_secure_storage` ya `shared_preferences`) me save karein aur subsequent calls me `Authorization: Bearer <token>` header bhejein.

#### Error Responses:
- **Pending Approval (403):**
  ```json
  {
    "auth_status": false,
    "res": "error",
    "msg": "Your vendor account is pending admin approval. You can login once approved.",
    "data": [],
    "token_type": "Bearer"
  }
  ```
- **Invalid Password / User Not Found (401):**
  ```json
  {
    "auth_status": false,
    "res": "error",
    "msg": "Invalid login credentials.",
    "data": [],
    "token_type": "Bearer"
  }
  ```

#### Flutter Code Example:
```dart
Future<ApiResponse> loginVendor({
  required String login, // Mobile or Email
  required String password,
}) async {
  final response = await http.post(
    Uri.parse('$baseUrl/vendor/login'),
    headers: {
      'Accept': 'application/json',
      'Content-Type': 'application/json',
    },
    body: jsonEncode({
      'login': login,
      'password': password,
    }),
  );

  final json = jsonDecode(response.body);
  return ApiResponse.fromJson(json, (data) => data);
}
```

---

### 5) Authenticated Profile
Log in ho chuke vendor ka complete profile data fetch karne ke liye:
- **URL:** `GET /vendor/profile`
- **Headers:**
  ```http
  Accept: application/json
  Authorization: Bearer <SAVED_TOKEN>
  ```

---

### 6) Vendor Logout
- **URL:** `POST /vendor/logout`
- **Headers:**
  ```http
  Accept: application/json
  Authorization: Bearer <SAVED_TOKEN>
  ```
- Token revoke ho jayega. Local storage se bhi token delete kar dein.

---

## 6. HTTP Status Codes Cheat Sheet

- `200 OK`: Success (Login, Profile, Logout).
- `201 Created`: Onboard request successfully created.
- `401 Unauthorized`: Invalid credentials / Missing or expired token.
- `403 Forbidden`: Account pending approval ya deactivated.
- `409 Conflict`: Mobile / Email pehle se registered hai.
- `422 Unprocessable Content`: Validation failure (missing fields).

