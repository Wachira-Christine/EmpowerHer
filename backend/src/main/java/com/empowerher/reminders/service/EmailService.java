package com.empowerher.reminders.service;

import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.mail.javamail.JavaMailSender;
import org.springframework.mail.javamail.MimeMessageHelper;
import org.springframework.stereotype.Service;

import jakarta.mail.MessagingException;
import jakarta.mail.internet.MimeMessage;

@Service
public class EmailService {

    @Autowired
    private JavaMailSender mailSender;

    public void sendReminderEmail(String toEmail, String userName, String title, String note, String date, String time) throws MessagingException {
        MimeMessage message = mailSender.createMimeMessage();
        MimeMessageHelper helper = new MimeMessageHelper(message, true, "UTF-8");

        helper.setTo(toEmail);
        helper.setSubject("EmpowerHer Reminder – Time for Your Breast Self-Examination");

        // Beautiful zine-style HTML email body matching EmpowerHer's palette:
        // Paper background (#F8EEF0), Oxblood header (#7A1638), Coral accents (#E0356F)
        String htmlContent = "<!DOCTYPE html>"
                + "<html>"
                + "<head>"
                + "<meta charset='UTF-8'>"
                + "<style>"
                + "  body { font-family: 'Helvetica Neue', Helvetica, Arial, sans-serif; background-color: #F8EEF0; margin: 0; padding: 40px 20px; color: #241318; }"
                + "  .container { max-width: 600px; background-color: #FFFFFF; border: 1.5px solid rgba(36,19,24,0.16); margin: 0 auto; padding: 40px; box-shadow: 4px 4px 0px rgba(36,19,24,0.15); }"
                + "  .header { border-bottom: 2px solid rgba(36,19,24,0.16); padding-bottom: 20px; margin-bottom: 30px; }"
                + "  .brand { font-family: Georgia, serif; font-size: 28px; font-weight: bold; color: #7A1638; margin: 0; }"
                + "  .brand em { font-style: italic; color: #E0356F; font-weight: normal; }"
                + "  .eyebrow { font-family: monospace; font-size: 11px; text-transform: uppercase; letter-spacing: 0.12em; color: #7A1638; margin-bottom: 10px; }"
                + "  h2 { font-family: Georgia, serif; font-size: 22px; font-weight: normal; margin-top: 0; color: #7A1638; }"
                + "  p { font-size: 15px; line-height: 1.6; color: #241318; opacity: 0.85; margin-bottom: 20px; }"
                + "  .reminder-box { border: 1px solid rgba(36,19,24,0.16); border-left: 4px solid #B5447A; background-color: #F8EEF0; padding: 20px; margin: 25px 0; font-size: 14.5px; }"
                + "  .reminder-box strong { font-family: monospace; font-size: 11px; text-transform: uppercase; letter-spacing: 0.08em; color: #7A1638; display: block; margin-bottom: 6px; }"
                + "  .bullet-list { margin-top: 5px; padding-left: 20px; }"
                + "  .bullet-list li { margin-bottom: 5px; opacity: 0.8; }"
                + "  .footer { border-top: 1px solid rgba(36,19,24,0.16); margin-top: 40px; padding-top: 20px; font-size: 12px; opacity: 0.6; text-align: center; font-family: monospace; }"
                + "</style>"
                + "</head>"
                + "<body>"
                + "<div class='container'>"
                + "  <div class='header'>"
                + "    <p class='eyebrow'>PWA Notification Service</p>"
                + "    <h1 class='brand'>Empower<em>Her</em></h1>"
                + "  </div>"
                + "  "
                + "  <h2>Hello " + userName + ",</h2>"
                + "  <p>This is a gentle breast health reminder from your EmpowerHer portal. Taking a few minutes for yourself is a crucial step in proactive care.</p>"
                + "  "
                + "  <div class='reminder-box'>"
                + "    <strong>Scheduled Reminder</strong>"
                + "    <div style='font-size: 18px; font-weight: bold; font-family: Georgia, serif; margin-bottom: 12px; color: #7A1638;'>" + title + "</div>"
                + "    <ul class='bullet-list' style='list-style: none; padding-left: 0; margin-top: 0;'>"
                + "      <li><strong>Date:</strong> " + date + "</li>"
                + "      <li><strong>Time:</strong> " + time + "</li>"
                + "      " + (note != null && !note.trim().isEmpty() ? "<li><strong>Personal Note:</strong> " + note + "</li>" : "")
                + "    </ul>"
                + "  </div>"
                + "  "
                + "  <p><em>Breast health check advice:</em> Regular self-examinations help you become familiar with how your breasts normally look and feel, making it easier to detect any changes early. If you notice unusual changes, lumps, or visual discrepancies, please schedule a visit with a medical professional.</p>"
                + "  "
                + "  <p>Stay healthy,<br><strong>The EmpowerHer Team</strong></p>"
                + "  "
                + "  <div class='footer'>"
                + "    EMPOWERHER — ED. 2026<br>"
                + "    This is an automated reminder. Please do not reply directly to this email."
                + "  </div>"
                + "</div>"
                + "</body>"
                + "</html>";

        helper.setText(htmlContent, true);
        mailSender.send(message);
        System.out.println("Email: Successfully delivered reminder to " + toEmail);
    }
}
