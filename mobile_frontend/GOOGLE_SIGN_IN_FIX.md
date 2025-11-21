# Fix Google Sign-In Error: ApiException 10 (DEVELOPER_ERROR)

## ❌ Current Error
```
PlatformException(sign_in_failed, com.google.android.gms.common.api.ApiException: 10: , null, null)
```

**Error Code 10 = DEVELOPER_ERROR** - This means your Android app is not properly registered with Google.

---

## ✅ Solution Steps

### Step 1: Get Your Debug SHA-1 Fingerprint

Run this command in your terminal:

```bash
cd android
./gradlew signingReport
```

Or use keytool directly:

```bash
keytool -list -v -keystore %USERPROFILE%\.android\debug.keystore -alias androiddebugkey -storepass android -keypass android
```

**Copy the SHA-1 fingerprint** (looks like: `A1:B2:C3:D4:E5:F6...`)

---

### Step 2: Configure Google Cloud Console

1. **Go to**: https://console.cloud.google.com/
2. **Select your project** (or create new one)
3. **Navigate to**: APIs & Services → Credentials
4. **Create Credentials** → OAuth 2.0 Client ID
5. **Choose**: Android
6. **Fill in**:
   - **Name**: Android client for mobile_frontend
   - **Package name**: `com.example.mobile_frontend`
   - **SHA-1 certificate fingerprint**: (paste from Step 1)
7. **Click Create**

---

### Step 3: Add google-services.json (CRITICAL!)

#### Option A: Using Firebase (Recommended)

1. **Go to**: https://console.firebase.google.com/
2. **Add project** (use same name as Google Cloud project)
3. **Add Android app**:
   - Package name: `com.example.mobile_frontend`
   - App nickname: Mobile Frontend
   - Debug signing certificate SHA-1: (paste from Step 1)
4. **Download `google-services.json`**
5. **Place file in**: `android/app/google-services.json`

#### Option B: Manual Configuration (Advanced)

Create `android/app/google-services.json`:

```json
{
  "project_info": {
    "project_number": "YOUR_PROJECT_NUMBER",
    "project_id": "your-project-id",
    "storage_bucket": "your-project-id.appspot.com"
  },
  "client": [
    {
      "client_info": {
        "mobilesdk_app_id": "1:YOUR_PROJECT_NUMBER:android:YOUR_APP_ID",
        "android_client_info": {
          "package_name": "com.example.mobile_frontend"
        }
      },
      "oauth_client": [
        {
          "client_id": "YOUR_ANDROID_CLIENT_ID.apps.googleusercontent.com",
          "client_type": 1,
          "android_info": {
            "package_name": "com.example.mobile_frontend",
            "certificate_hash": "YOUR_SHA1_WITHOUT_COLONS"
          }
        }
      ],
      "api_key": [
        {
          "current_key": "YOUR_API_KEY"
        }
      ]
    }
  ],
  "configuration_version": "1"
}
```

---

### Step 4: Verify Configuration Files

I've already updated these files for you:

✅ **android/build.gradle.kts** - Added Google Services plugin
✅ **android/app/build.gradle.kts** - Applied Google Services plugin

Make sure the package name matches:
- Package in `build.gradle.kts`: `com.example.mobile_frontend`
- Package in Google Cloud Console: `com.example.mobile_frontend`
- Package in `google-services.json`: `com.example.mobile_frontend`

---

### Step 5: Clean and Rebuild

```bash
# Clean build
flutter clean

# Get dependencies
flutter pub get

# Rebuild Android
cd android
./gradlew clean
cd ..

# Run app
flutter run
```

---

## 🔍 Verification Checklist

- [ ] SHA-1 fingerprint added to Google Cloud Console
- [ ] OAuth 2.0 Android client created
- [ ] `google-services.json` file exists in `android/app/`
- [ ] Package name matches everywhere: `com.example.mobile_frontend`
- [ ] Google Services plugin added to both gradle files
- [ ] Rebuilt the app after configuration

---

## 🚨 Common Issues

### Issue 1: "google-services.json not found"
**Solution**: Make sure the file is in `android/app/google-services.json` (not in `android/`)

### Issue 2: Still getting error after adding file
**Solution**: Run `flutter clean` and rebuild completely

### Issue 3: Different package name
**Solution**: Update package name in:
- `android/app/build.gradle.kts` (applicationId)
- Google Cloud Console
- `google-services.json`

### Issue 4: Release vs Debug builds
**Solution**: For release builds, you need a separate SHA-1 from your release keystore

---

## 📝 Testing After Fix

1. **Run the app**:
   ```bash
   flutter run
   ```

2. **Try Google Sign-In** - Should now work!

3. **Check logs** for successful authentication:
   ```
   ✅ Google sign in successful
   ```

---

## 🔗 Resources

- [Google Sign-In Flutter Setup](https://pub.dev/packages/google_sign_in)
- [Firebase Console](https://console.firebase.google.com/)
- [Google Cloud Console](https://console.cloud.google.com/)
- [SHA-1 Fingerprint Guide](https://developers.google.com/android/guides/client-auth)
