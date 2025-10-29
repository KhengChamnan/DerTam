<?php

return [

    /*
    |--------------------------------------------------------------------------
    | Third Party Services
    |--------------------------------------------------------------------------
    |
    | This file is for storing the credentials for third party services such
    | as Mailgun, Postmark, AWS and more. This file provides the de facto
    | location for this type of information, allowing packages to have
    | a conventional file to locate the various service credentials.
    |
    */

    'postmark' => [
        'token' => env('POSTMARK_TOKEN'),
    ],

    'ses' => [
        'key' => env('AWS_ACCESS_KEY_ID'),
        'secret' => env('AWS_SECRET_ACCESS_KEY'),
        'region' => env('AWS_DEFAULT_REGION', 'us-east-1'),
    ],

    'resend' => [
        'key' => env('RESEND_KEY'),
    ],

    'slack' => [
        'notifications' => [
            'bot_user_oauth_token' => env('SLACK_BOT_USER_OAUTH_TOKEN'),
            'channel' => env('SLACK_BOT_USER_DEFAULT_CHANNEL'),
        ],
    ],

    'google' => [
        'client_id' => env('GOOGLE_CLIENT_ID'),
        'client_secret' => env('GOOGLE_CLIENT_SECRET'),
        'redirect' => env('GOOGLE_REDIRECT_URL'),
    ],

    'aba' => [
        'merchant_id' => env('ABA_MERCHANT_ID'),
        'api_key' => env('ABA_API_KEY'), // public key from sandbox credentials
        'qr_endpoint' => env('ABA_QR_ENDPOINT', 'https://checkout-sandbox.payway.com.kh/api/payment-gateway/v1/payments/generate-qr'),
        'purchase_endpoint' => env('ABA_PURCHASE_ENDPOINT', 'https://checkout-sandbox.payway.com.kh/api/payment-gateway/v1/payments/purchase'),
        'use_purchase' => filter_var(env('ABA_USE_PURCHASE', false), FILTER_VALIDATE_BOOL),
        'callback_url' => env('ABA_CALLBACK_URL'), // defaults to APP_PUBLIC_URL . '/api/payments/aba/webhook' if null (handled in code)
        'default_currency' => env('ABA_DEFAULT_CURRENCY', 'KHR'),
        'default_lifetime' => env('ABA_DEFAULT_LIFETIME', 10), // minutes
        'qr_image_template' => env('ABA_QR_IMAGE_TEMPLATE', 'template3_color'),
        'webhook_verify_key' => env('ABA_WEBHOOK_VERIFY_KEY'), // optional shared secret for webhook body HMAC
    ],

];
