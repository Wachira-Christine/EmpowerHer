# EmpowerHer Background Email Reminders Service

This directory contains the Spring Boot background scheduling service that scans the Firestore database for active reminders and delivers email notifications using SMTP.

---

## ⚙️ Configuration Setup

### 1. SMTP Credentials Configuration
Open [application.properties](src/main/resources/application.properties) and configure your active mail service credentials:

```properties
spring.mail.host=smtp.gmail.com
spring.mail.port=587
spring.mail.username=your_email@gmail.com
spring.mail.password=your_gmail_app_password
```
*(For Gmail, make sure to generate and use a 16-character **App Password** from your Google Account settings, rather than your standard account password).*

### 2. Firebase Credentials Key Setup
The backend service uses the Firebase Admin SDK to securely communicate with Firestore. 
1. Go to the **Firebase Console** -> **Project Settings** -> **Service Accounts**.
2. Click **Generate New Private Key** to download a `.json` credential file.
3. Save the downloaded file into the resources folder:
   `backend/src/main/resources/service-account.json`
   *(Alternatively, you can save the file anywhere and set the system environment variable `GOOGLE_APPLICATION_CREDENTIALS` pointing to it).*

---

## 🚀 Building and Running

Since Maven is run via JDK/JVM environment, navigate into the `backend/` directory in your IDE/terminal and run:

### Build the Package:
```bash
mvn clean package
```

### Run the Service:
```bash
java -jar target/reminders-service-1.0.0.jar
```

---

## 📝 Features & Architecture
- **Scheduled checks**: Automatically checks Firestore every 60 seconds.
- **Deduplication**: Updates each reminder status and delivery state to `Sent` or `Failed` immediately after triggering to avoid duplicate sends.
- **Frequency calculations**: Automatically calculates `nextReminder` timestamps based on repetition frequency (`Once`, `Monthly`, or `Custom` - which cycles every 2 weeks).
