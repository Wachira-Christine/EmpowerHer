package com.empowerher.reminders.config;

import com.google.auth.oauth2.GoogleCredentials;
import com.google.firebase.FirebaseApp;
import com.google.firebase.FirebaseOptions;
import org.springframework.context.annotation.Configuration;

import jakarta.annotation.PostConstruct;
import java.io.FileInputStream;
import java.io.IOException;
import java.io.InputStream;

@Configuration
public class FirebaseConfig {

    @PostConstruct
    public void initializeFirebase() {
        try {
            if (FirebaseApp.getApps().isEmpty()) {
                // 1. Try reading path from system environment variables
                String credentialsPath = System.getenv("GOOGLE_APPLICATION_CREDENTIALS");
                FirebaseOptions options;

                if (credentialsPath != null && !credentialsPath.isEmpty()) {
                    System.out.println("Firebase: Loading credentials from env: " + credentialsPath);
                    FileInputStream serviceAccount = new FileInputStream(credentialsPath);
                    options = FirebaseOptions.builder()
                            .setCredentials(GoogleCredentials.fromStream(serviceAccount))
                            .build();
                } else {
                    // 2. Try reading service-account.json from resources folder
                    InputStream serviceAccountStream = getClass().getClassLoader()
                            .getResourceAsStream("service-account.json");

                    if (serviceAccountStream != null) {
                        System.out.println("Firebase: Loading credentials from classpath (service-account.json)");
                        options = FirebaseOptions.builder()
                                .setCredentials(GoogleCredentials.fromStream(serviceAccountStream))
                                .build();
                    } else {
                        // 3. Fallback to Google Application Default Credentials
                        System.out.println("Firebase: Loading Google Application Default Credentials");
                        options = FirebaseOptions.builder()
                                .setCredentials(GoogleCredentials.getApplicationDefault())
                                .build();
                    }
                }

                FirebaseApp.initializeApp(options);
                System.out.println("Firebase Admin SDK initialized successfully.");
            }
        } catch (IOException e) {
            System.err.println("Firebase initialization failed! Admin SDK commands will error: " + e.getMessage());
        }
    }
}
