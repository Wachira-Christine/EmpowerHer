# Manual Admin Account Creation Instructions

To create an administrator account for the EmpowerHer PWA, follow these manual configuration steps in the Firebase Console:

### Step 1
Go to **Firebase Console** → **Authentication** → **Users** → **Add user**.

### Step 2
Create the admin account by specifying a secure email and password.

### Step 3
Copy the newly created **Firebase UID** of the admin user.

### Step 4
Navigate to **Firestore Database** → **users** collection.

### Step 5
Create a new document using the copied **admin UID** as the unique Document ID.

### Step 6
Add the following fields and values to the admin user document:

- **fullName**: `Admin User` (String)
- **email**: `admin@example.com` (String)
- **role**: `admin` (String)
- **accountStatus**: `active` (String)
- **createdAt**: `current timestamp` (String or Timestamp)
