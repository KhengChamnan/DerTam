# Laravel Sanctum Authentication Setup

## Overview

This documentation outlines the implementation of Laravel Sanctum for API authentication in the DerTam Capstone Project. Sanctum provides a simple way to authenticate single-page applications (SPAs), mobile applications, and simple, token-based APIs.

## Table of Contents

1. [Installation & Configuration](#installation--configuration)
2. [Database Setup](#database-setup)
3. [Model Configuration](#model-configuration)
4. [API Routes](#api-routes)
5. [Authentication Controllers](#authentication-controllers)
6. [Usage Examples](#usage-examples)
7. [Testing](#testing)

## Installation & Configuration

### 1. Package Installation

Laravel Sanctum is installed using the built-in Laravel command:

```bash
php artisan install:api
```

This single command:
- Installs Laravel Sanctum via Composer
- Publishes the Sanctum configuration file
- Creates the personal access tokens migration
- Updates the User model with HasApiTokens trait

As shown in our `composer.json`, Sanctum is included:
```json
"require": {
    "php": "^8.2",
    "laravel/framework": "^11.31",
    "laravel/sanctum": "^4.0",
    "laravel/tinker": "^2.9"
}
```

### 2. Sanctum Configuration

The Sanctum configuration is located in `config/sanctum.php`:

```php
<?php

use Laravel\Sanctum\Sanctum;

return [
    // Stateful domains for SPA authentication
    'stateful' => explode(',', env('SANCTUM_STATEFUL_DOMAINS', sprintf(
        '%s%s',
        'localhost,localhost:3000,127.0.0.1,127.0.0.1:8000,::1',
        Sanctum::currentApplicationUrlWithPort(),
    ))),

    // Authentication guards
    'guard' => ['web'],

    // Token expiration (null = no expiration)
    'expiration' => null,

    // Token prefix for security scanning
    'token_prefix' => env('SANCTUM_TOKEN_PREFIX', ''),

    // Middleware configuration
    'middleware' => [
        'authenticate_session' => Laravel\Sanctum\Http\Middleware\AuthenticateSession::class,
        'encrypt_cookies' => Illuminate\Cookie\Middleware\EncryptCookies::class,
        'validate_csrf_token' => Illuminate\Foundation\Http\Middleware\ValidateCsrfToken::class,
    ],
];
```

**Key Configuration Points:**
- **Stateful Domains**: Configured for local development (localhost, 127.0.0.1)
- **Guards**: Uses the default 'web' guard
- **Expiration**: No token expiration set (tokens persist until revoked)
- **Token Prefix**: None configured (can be set via environment variable)

## Database Setup

### Personal Access Tokens Table

Sanctum requires a `personal_access_tokens` table to store API tokens. This migration is automatically created when running `php artisan install:api`:

```php
Schema::create('personal_access_tokens', function (Blueprint $table) {
    $table->id();
    $table->morphs('tokenable');
    $table->text('name');
    $table->string('token', 64)->unique();
    $table->text('abilities')->nullable();
    $table->timestamp('last_used_at')->nullable();
    $table->timestamp('expires_at')->nullable()->index();
    $table->timestamps();
});
```

After running `php artisan install:api`, you need to run the migrations:

```bash
php artisan migrate
```

**Table Structure:**
- `tokenable`: Polymorphic relationship to the User model
- `name`: Token name/identifier
- `token`: Hashed token value (64 characters)
- `abilities`: Token permissions (JSON)
- `last_used_at`: Track token usage
- `expires_at`: Optional token expiration

## Model Configuration

### User Model

The `User` model is automatically configured with Sanctum's `HasApiTokens` trait when running `php artisan install:api`:

```php
<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Factories\HasFactory;
use Illuminate\Foundation\Auth\User as Authenticatable;
use Illuminate\Notifications\Notifiable;
use Laravel\Sanctum\HasApiTokens;

class User extends Authenticatable
{
    use HasFactory, Notifiable, HasApiTokens;

    protected $fillable = [
        'name',
        'email',
        'password',
    ];

    protected $hidden = [
        'password',
        'remember_token',
    ];

    protected function casts(): array
    {
        return [
            'email_verified_at' => 'datetime',
            'password' => 'hashed',
        ];
    }
}
```

**Key Features:**
- `HasApiTokens` trait provides token management methods
- `password` is automatically hashed via casting
- Standard Laravel user attributes (name, email, password)

## API Routes

API routes are defined in `routes/api.php`:

```php
<?php

use Illuminate\Http\Request;
use Illuminate\Support\Facades\Route;
use App\Http\Controllers\API\RegisterController;
use App\Http\Controllers\API\ProductController;

// Public routes
Route::controller(RegisterController::class)->group(function(){
    Route::post('register', 'register');
    Route::post('login', 'login');
});

// Protected routes
Route::middleware('auth:sanctum')->group(function () {
    Route::get('/user', function (Request $request) {
        return $request->user();
    });
    
    Route::resource('products', ProductController::class);
});
```

**Route Structure:**
- **Public Routes**: Registration and login (no authentication required)
- **Protected Routes**: User info and product CRUD (requires valid token)
- **Middleware**: `auth:sanctum` protects authenticated endpoints

## Authentication Controllers

### Base Controller

`app/Http/Controllers/API/BaseController.php` provides standardized response methods:

```php
<?php

namespace App\Http\Controllers\API;

use Illuminate\Http\Request;
use App\Http\Controllers\Controller as Controller;

class BaseController extends Controller
{
    /**
     * Success response method.
     */
    public function sendResponse($result, $message)
    {
        $response = [
            'success' => true,
            'data'    => $result,
            'message' => $message,
        ];

        return response()->json($response, 200);
    }

    /**
     * Error response method.
     */
    public function sendError($error, $errorMessages = [], $code = 404)
    {
        $response = [
            'success' => false,
            'message' => $error,
        ];

        if(!empty($errorMessages)){
            $response['data'] = $errorMessages;
        }

        return response()->json($response, $code);
    }
}
```

### Register Controller

`app/Http/Controllers/API/RegisterController.php` handles authentication:

```php
<?php

namespace App\Http\Controllers\API;

use Illuminate\Http\Request;
use App\Http\Controllers\API\BaseController as BaseController;
use App\Models\User;
use Illuminate\Support\Facades\Auth;
use Illuminate\Support\Facades\Validator;
use Illuminate\Http\JsonResponse;

class RegisterController extends BaseController
{
    /**
     * User registration
     */
    public function register(Request $request): JsonResponse
    {
        $validator = Validator::make($request->all(), [
            'name' => 'required',
            'email' => 'required|email',
            'password' => 'required',
            'c_password' => 'required|same:password',
        ]);

        if($validator->fails()){
            return $this->sendError('Validation Error.', $validator->errors());       
        }

        $input = $request->all();
        $input['password'] = bcrypt($input['password']);
        $user = User::create($input);
        $success['token'] =  $user->createToken('MyApp')->plainTextToken;
        $success['name'] =  $user->name;

        return $this->sendResponse($success, 'User register successfully.');
    }

    /**
     * User login
     */
    public function login(Request $request): JsonResponse
    {
        if(Auth::attempt(['email' => $request->email, 'password' => $request->password])){ 
            $user = Auth::user(); 
            $success['token'] =  $user->createToken('MyApp')->plainTextToken; 
            $success['name'] =  $user->name;

            return $this->sendResponse($success, 'User login successfully.');
        } 
        else{ 
            return $this->sendError('Unauthorised.', ['error'=>'Unauthorised']);
        } 
    }
}
```

**Key Features:**
- **Registration**: Validates input, creates user, generates token
- **Login**: Authenticates credentials, generates token
- **Token Generation**: Uses `createToken('MyApp')` to create named tokens
- **Response Format**: Consistent JSON responses with success/error structure

## Usage Examples

### 1. User Registration

**Request:**
```bash
POST /api/register
Content-Type: application/json

{
    "name": "John Doe",
    "email": "john@example.com",
    "password": "password123",
    "c_password": "password123"
}
```

**Response:**
```json
{
    "success": true,
    "data": {
        "token": "1|abcdef123456...",
        "name": "John Doe"
    },
    "message": "User register successfully."
}
```

### 2. User Login

**Request:**
```bash
POST /api/login
Content-Type: application/json

{
    "email": "john@example.com",
    "password": "password123"
}
```

**Response:**
```json
{
    "success": true,
    "data": {
        "token": "2|xyz789456123...",
        "name": "John Doe"
    },
    "message": "User login successfully."
}
```

### 3. Accessing Protected Routes

**Request:**
```bash
GET /api/user
Authorization: Bearer 2|xyz789456123...
```

**Response:**
```json
{
    "id": 1,
    "name": "John Doe",
    "email": "john@example.com",
    "email_verified_at": null,
    "created_at": "2025-10-02T10:30:00.000000Z",
    "updated_at": "2025-10-02T10:30:00.000000Z"
}
```

### 4. Product API (Protected)

**Request:**
```bash
GET /api/products
Authorization: Bearer 2|xyz789456123...
```

All product CRUD operations require authentication via the `auth:sanctum` middleware.

## Security Features

### 1. Token Security
- Tokens are hashed and stored securely in the database
- Only the plain text token is returned once during creation
- Tokens can be revoked or expired

### 2. Validation
- Email format validation
- Password confirmation required during registration
- Proper error handling and validation messages

### 3. CORS and Stateful Domains
- Configured for local development environments
- Can be extended for production domains

## Testing

### Testing Authentication Endpoints

You can test the authentication endpoints using tools like Postman, curl, or Laravel's HTTP testing:

```bash
# Register a new user
curl -X POST http://localhost:8000/api/register \
  -H "Content-Type: application/json" \
  -d '{
    "name": "Test User",
    "email": "test@example.com",
    "password": "password123",
    "c_password": "password123"
  }'

# Login
curl -X POST http://localhost:8000/api/login \
  -H "Content-Type: application/json" \
  -d '{
    "email": "test@example.com",
    "password": "password123"
  }'

# Access protected route
curl -X GET http://localhost:8000/api/user \
  -H "Authorization: Bearer YOUR_TOKEN_HERE"
```

## Environment Configuration

Add the following to your `.env` file if needed:

```env
# Sanctum Configuration
SANCTUM_STATEFUL_DOMAINS=localhost:3000,127.0.0.1:3000
SANCTUM_TOKEN_PREFIX=
```

## Conclusion

This Sanctum implementation provides:

- ✅ Secure token-based authentication
- ✅ User registration and login endpoints  
- ✅ Protected API routes
- ✅ Standardized JSON responses
- ✅ Proper validation and error handling
- ✅ Token management capabilities

The setup was completed with a single command: `php artisan install:api`, which automatically configured everything needed for API authentication in single-page applications, mobile apps, and other client applications that need to authenticate with your Laravel backend.

## Quick Setup Summary

1. **Install Sanctum**: `php artisan install:api`
2. **Run migrations**: `php artisan migrate`
3. **Create authentication controllers** (RegisterController, BaseController)
4. **Define API routes** with `auth:sanctum` middleware
5. **Test endpoints** with registration, login, and protected routes