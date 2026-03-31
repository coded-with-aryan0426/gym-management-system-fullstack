# Social Login + Multi-Channel OTP Implementation Plan

## Goal
Add Google, Facebook social login + Email, SMS, WhatsApp OTP verification with role-based redirects for the Gym Management System - **ALL FREE**.

---

## 🆓 Free Service Providers

| Feature | Free Provider | Free Tier Limits |
|---------|---------------|------------------|
| **Google Login** | Google OAuth 2.0 | ✅ Unlimited |
| **Facebook Login** | Facebook Login SDK | ✅ Unlimited |
| **Email OTP** | Gmail SMTP / Resend | 100/day (Gmail) or 3000/month (Resend) |
| **SMS OTP** | Twilio Free Trial | 500 SMS free credits |
| **WhatsApp OTP** | Twilio Free Trial | Included in credits |

> [!IMPORTANT]
> **Alternative SMS/WhatsApp (100% Free):** Use **Firebase Phone Auth** (10,000 verifications/month FREE) or **MSG91** (India - 100 free SMS/day).

---

## User Experience Flow

```
┌─────────────────────────────────────────────────────────────────────┐
│                        LOGIN / SIGNUP PAGE                          │
├─────────────────────────────────────────────────────────────────────┤
│                                                                     │
│   ┌──────────────┐  ┌──────────────┐  ┌──────────────┐             │
│   │   Google     │  │   Facebook   │  │    Email     │             │
│   │   Sign In    │  │   Sign In    │  │   + OTP      │             │
│   └──────────────┘  └──────────────┘  └──────────────┘             │
│                                                                     │
│   ┌──────────────────────────────────────────────────┐             │
│   │  📱 Phone Number + OTP (SMS or WhatsApp)         │             │
│   └──────────────────────────────────────────────────┘             │
│                                                                     │
│   ┌──────────────────────────────────────────────────┐             │
│   │  🔑 Traditional Email + Password Login           │             │
│   └──────────────────────────────────────────────────┘             │
│                                                                     │
└─────────────────────────────────────────────────────────────────────┘
                              │
                              ▼
             ┌────────────────────────────────┐
             │   User Matching Logic          │
             │   ─────────────────────────    │
             │   Match by: email OR phone     │
             │   New User → Create account    │
             │   Existing → Link & login      │
             └────────────────────────────────┘
                              │
                              ▼
             ┌────────────────────────────────┐
             │   Role-Based Redirect          │
             │   ─────────────────────────    │
             │   OWNER/ADMIN → /admin         │
             │   TRAINER → /trainer           │
             │   MEMBER → /member             │
             └────────────────────────────────┘
```

---

## Proposed Changes

### Backend (Spring Boot)

---

#### [NEW] [OAuthConfig.java](file:///Users/aryan/Intership/backend/src/main/java/com/gym/management/config/OAuthConfig.java)
- Spring Security OAuth2 client configuration
- Google and Facebook provider setup

#### [NEW] [OAuth2Controller.java](file:///Users/aryan/Intership/backend/src/main/java/com/gym/management/controller/OAuth2Controller.java)
- `/api/auth/oauth2/google` - Google OAuth callback
- `/api/auth/oauth2/facebook` - Facebook OAuth callback
- Handle user creation/linking and JWT generation

#### [NEW] [SmsService.java](file:///Users/aryan/Intership/backend/src/main/java/com/gym/management/service/SmsService.java)
- Twilio integration for SMS OTP
- Send OTP via SMS

#### [NEW] [WhatsAppService.java](file:///Users/aryan/Intership/backend/src/main/java/com/gym/management/service/WhatsAppService.java)
- Twilio WhatsApp API integration
- Send OTP via WhatsApp

#### [MODIFY] [OtpService.java](file:///Users/aryan/Intership/backend/src/main/java/com/gym/management/service/OtpService.java)
- Add multi-channel support (EMAIL, SMS, WHATSAPP)
- Unified OTP generation and verification

#### [MODIFY] [AuthController.java](file:///Users/aryan/Intership/backend/src/main/java/com/gym/management/controller/AuthController.java)
- Add `/api/auth/send-otp` with channel selection
- Add `/api/auth/verify-otp` unified verification
- Add social login token exchange endpoints

#### [MODIFY] [SecurityConfig.java](file:///Users/aryan/Intership/backend/src/main/java/com/gym/management/security/SecurityConfig.java)
- Add OAuth2 login configuration
- Configure social login success/failure handlers

#### [MODIFY] [User.java](file:///Users/aryan/Intership/backend/src/main/java/com/gym/management/model/User.java)
- Add `googleId`, `facebookId` fields
- Add `phoneNumber` field (if not exists)
- Add `authProvider` enum (LOCAL, GOOGLE, FACEBOOK)

#### [MODIFY] [application.properties](file:///Users/aryan/Intership/backend/src/main/resources/application.properties)
- Add OAuth2 client credentials
- Add Twilio credentials
- Add OTP configuration

---

### Frontend (React)

---

#### [NEW] [SocialLoginButtons.tsx](file:///Users/aryan/Intership/frontend/src/components/auth/SocialLoginButtons.tsx)
- Google Sign-In button (using @react-oauth/google)
- Facebook Login button (using react-facebook-login)
- Styled with existing theme

#### [NEW] [OtpVerification.tsx](file:///Users/aryan/Intership/frontend/src/components/auth/OtpVerification.tsx)
- Multi-channel OTP input UI
- Channel selector (Email/SMS/WhatsApp)
- Auto-verify and redirect

#### [MODIFY] [Login.tsx](file:///Users/aryan/Intership/frontend/src/pages/Login.tsx)
- Integrate social login buttons
- Add phone number + OTP option
- Role-based redirect after login

#### [MODIFY] [Signup.tsx](file:///Users/aryan/Intership/frontend/src/pages/Signup.tsx)
- Add social signup options
- Phone verification flow
- Auto-detect existing accounts

---

## Configuration Required

### 1. Google OAuth Setup (FREE)
```properties
# Get from: https://console.cloud.google.com/apis/credentials
spring.security.oauth2.client.registration.google.client-id=YOUR_GOOGLE_CLIENT_ID
spring.security.oauth2.client.registration.google.client-secret=YOUR_GOOGLE_CLIENT_SECRET
```

### 2. Facebook Login Setup (FREE)
```properties
# Get from: https://developers.facebook.com/apps
spring.security.oauth2.client.registration.facebook.client-id=YOUR_FACEBOOK_APP_ID
spring.security.oauth2.client.registration.facebook.client-secret=YOUR_FACEBOOK_APP_SECRET
```

### 3. Twilio Setup (FREE Trial - $15 Credit)
```properties
# Get from: https://console.twilio.com
twilio.account.sid=YOUR_ACCOUNT_SID
twilio.auth.token=YOUR_AUTH_TOKEN
twilio.phone.number=+1XXXXXXXXXX
twilio.whatsapp.number=whatsapp:+14155238886
```

### 4. Email (Gmail - Already configured)
```properties
# Already in your application.properties
spring.mail.username=your-email@gmail.com
spring.mail.password=your-app-password
```

---

## User Matching Logic

```java
// When user logs in via any method, match accounts:
User findOrCreateUser(String email, String phone, AuthProvider provider) {
    // 1. Try to find by email
    User user = userRepository.findByEmail(email);
    
    // 2. If not found, try by phone
    if (user == null && phone != null) {
        user = userRepository.findByPhoneNumber(phone);
    }
    
    // 3. If still not found, create new user
    if (user == null) {
        user = createNewUser(email, phone, provider);
    } else {
        // Link the new auth provider to existing account
        linkAuthProvider(user, provider);
    }
    
    return user;
}
```

---

## Role-Based Redirect Logic

```typescript
// Frontend: After successful login
const redirectByRole = (user: User) => {
  const roles = user.roles.map(r => r.name);
  
  if (roles.includes('OWNER') || roles.includes('ADMIN')) {
    navigate('/admin/dashboard');
  } else if (roles.includes('TRAINER')) {
    navigate('/trainer/dashboard');
  } else if (roles.includes('CUSTOMER')) {
    navigate('/member/dashboard');
  } else {
    navigate('/onboarding'); // New users without role
  }
};
```

---

## Dependencies to Add

### Backend (pom.xml)
```xml
<!-- OAuth2 -->
<dependency>
    <groupId>org.springframework.boot</groupId>
    <artifactId>spring-boot-starter-oauth2-client</artifactId>
</dependency>

<!-- Twilio -->
<dependency>
    <groupId>com.twilio.sdk</groupId>
    <artifactId>twilio</artifactId>
    <version>9.14.0</version>
</dependency>
```

### Frontend (package.json)
```json
{
  "@react-oauth/google": "^0.12.1",
  "react-facebook-login": "^4.1.1"
}
```

---

## Verification Plan

### Automated Tests
1. **Unit Tests** (New):
   - `OtpServiceTest.java` - Test OTP generation and verification
   - `OAuth2ControllerTest.java` - Test social login token exchange

2. **Run existing tests**:
   ```bash
   cd /Users/aryan/Intership/backend
   mvn test
   ```

### Manual Verification
1. **Google Login Flow**:
   - Click "Sign in with Google" → Select Google account → Should redirect to correct dashboard

2. **Facebook Login Flow**:
   - Click "Sign in with Facebook" → Authorize app → Should redirect correctly

3. **Email OTP**:
   - Enter email → Click "Send OTP" → Check inbox → Enter OTP → Verify login

4. **SMS OTP**:
   - Enter phone → Select SMS → Receive SMS → Enter OTP → Verify

5. **WhatsApp OTP**:
   - Enter phone → Select WhatsApp → Receive message → Enter OTP → Verify

6. **Role-Based Redirect**:
   - Login as OWNER → Should go to `/admin/dashboard`
   - Login as TRAINER → Should go to `/trainer/dashboard`
   - Login as MEMBER → Should go to `/member/dashboard`

---

## User Review Required

> [!WARNING]
> **API Keys Needed**: You'll need to create free accounts and get API keys from:
> - Google Cloud Console (OAuth credentials)
> - Facebook Developers (App credentials)
> - Twilio Console (Account SID, Auth Token)
> 
> **Do you want me to proceed with the implementation?**

> [!IMPORTANT]
> **Alternative to Twilio**: If you prefer 100% free SMS/WhatsApp without limits, I can integrate **Firebase Phone Auth** instead (10,000 verifications/month FREE). Let me know your preference.
