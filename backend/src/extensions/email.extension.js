"use strict";

const sendEmail = require("../helpers/sendEmail");

const generateVerificationEmail = (data) => {
  const { name, verificationUrl, expiresIn = "24 giờ" } = data;

  return `
    <!DOCTYPE html>
    <html lang="vi">
    <head>
        <meta charset="UTF-8">
        <meta name="viewport" content="width=device-width, initial-scale=1.0">
        <title>Xác Thực Email của Bạn</title>
        <style>
            * {
                margin: 0;
                padding: 0;
                box-sizing: border-box;
            }
            
            body {
                font-family: 'Segoe UI', Tahoma, Geneva, Verdana, sans-serif;
                line-height: 1.6;
                color: #333;
                background-color: #f4f4f4;
            }
            
            .email-container {
                max-width: 600px;
                margin: 0 auto;
                background-color: #ffffff;
                border-radius: 10px;
                overflow: hidden;
                box-shadow: 0 4px 10px rgba(0, 0, 0, 0.1);
            }
            
            .email-header {
                background: linear-gradient(135deg, #4CAF50 0%, #45a049 100%);
                color: white;
                padding: 40px 30px;
                text-align: center;
            }
            
            .email-header h1 {
                font-size: 28px;
                margin-bottom: 10px;
                font-weight: 600;
            }
            
            .email-header p {
                font-size: 16px;
                opacity: 0.9;
            }
            
            .email-body {
                padding: 40px 30px;
            }
            
            .welcome-message {
                font-size: 18px;
                margin-bottom: 20px;
                color: #2c3e50;
            }
            
            .message-content {
                font-size: 16px;
                line-height: 1.8;
                color: #555;
                margin-bottom: 30px;
            }
            
            .verify-button {
                display: inline-block;
                background: linear-gradient(135deg, #4CAF50 0%, #45a049 100%);
                color: white;
                text-decoration: none;
                padding: 15px 35px;
                border-radius: 50px;
                font-weight: 600;
                font-size: 16px;
                text-align: center;
                margin: 20px 0;
                transition: transform 0.2s ease;
            }
            
            .verify-button:hover {
                transform: translateY(-2px);
                box-shadow: 0 6px 20px rgba(76, 175, 80, 0.4);
            }
            
            .button-container {
                text-align: center;
                margin: 30px 0;
            }
            
            .divider {
                height: 1px;
                background: linear-gradient(to right, transparent, #ddd, transparent);
                margin: 30px 0;
            }
            
            .alternative-link {
                background-color: #f8f9fa;
                border: 1px solid #e9ecef;
                border-radius: 8px;
                padding: 20px;
                margin: 20px 0;
            }
            
            .alternative-link p {
                font-size: 14px;
                color: #6c757d;
                margin-bottom: 10px;
            }
            
            .alternative-link a {
                color: #4CAF50;
                word-break: break-all;
                text-decoration: none;
                font-size: 13px;
            }
            
            .security-notice {
                background-color: #fff3cd;
                border: 1px solid #ffeaa7;
                border-radius: 8px;
                padding: 15px;
                margin: 20px 0;
            }
            
            .security-notice .icon {
                color: #856404;
                font-size: 18px;
                margin-right: 10px;
            }
            
            .security-notice p {
                color: #856404;
                font-size: 14px;
                margin: 0;
            }
            
            .email-footer {
                background-color: #f8f9fa;
                padding: 30px;
                text-align: center;
                border-top: 1px solid #e9ecef;
            }
            
            .footer-content {
                font-size: 14px;
                color: #6c757d;
                line-height: 1.6;
            }
            
            .footer-links {
                margin: 20px 0;
            }
            
            .footer-links a {
                color: #4CAF50;
                text-decoration: none;
                margin: 0 15px;
                font-weight: 500;
            }
            
            .footer-links a:hover {
                text-decoration: underline;
            }
            
            .company-info {
                margin-top: 20px;
                font-size: 12px;
                color: #adb5bd;
            }
            
            @media (max-width: 600px) {
                .email-container {
                    margin: 0;
                    border-radius: 0;
                }
                
                .email-header,
                .email-body,
                .email-footer {
                    padding: 20px;
                }
                
                .email-header h1 {
                    font-size: 24px;
                }
                
                .verify-button {
                    display: block;
                    margin: 20px auto;
                }
            }
        </style>
    </head>
    <body>
        <div class="email-container">
            <!-- Header -->
            <div class="email-header">
                <h1>📚 Chào mừng đến với EduLingo!</h1>
                <p>Hãy xác thực tài khoản của bạn để bắt đầu hành trình học tiếng Anh</p>
            </div>
            
            <!-- Body -->
            <div class="email-body">
                <div class="welcome-message">
                    Xin chào <strong>${name}</strong>,
                </div>
                
                <div class="message-content">
                    <p>Cảm ơn bạn đã đăng ký tài khoản tại <strong>EduLingo - Nền tảng học tiếng Anh trực tuyến</strong>! Chúng tôi rất vui mừng được đồng hành cùng bạn trên con đường chinh phục ngôn ngữ.</p>
                    
                    <p>Để hoàn tất đăng ký và bắt đầu học ngay, vui lòng xác thực địa chỉ email của bạn bằng cách nhấn vào nút bên dưới:</p>
                </div>
                
                <div class="button-container">
                    <a href="${verificationUrl}" class="verify-button">
                        ✉️ Xác Thực Email Ngay
                    </a>
                </div>
                
                <div class="divider"></div>
                
                <!-- Alternative Link -->
                <div class="alternative-link">
                    <p><strong>Nút không hoạt động?</strong> Sao chép và dán đường link sau vào trình duyệt:</p>
                    <a href="${verificationUrl}">${verificationUrl}</a>
                </div>
                
                <!-- Security Notice -->
                <div class="security-notice">
                    <p>
                        <span class="icon">🔒</span>
                        <strong>Lưu ý bảo mật:</strong> Link xác thực này sẽ hết hạn sau <strong>${expiresIn}</strong>. 
                        Nếu bạn không tạo tài khoản tại EduLingo, vui lòng bỏ qua email này.
                    </p>
                </div>
                
                <div class="message-content">
                    <p>Sau khi xác thực thành công, bạn sẽ có thể:</p>
                    <ul style="margin: 15px 0; padding-left: 20px;">
                        <li>Truy cập hàng ngàn bài học tiếng Anh từ cơ bản đến nâng cao</li>
                        <li>Luyện tập 4 kỹ năng: Nghe - Nói - Đọc - Viết</li>
                        <li>Tham gia các lớp học trực tuyến với giáo viên bản ngữ</li>
                        <li>Theo dõi tiến độ học tập chi tiết</li>
                        <li>Nhận chứng chỉ hoàn thành khóa học</li>
                    </ul>
                </div>
            </div>
            
            <!-- Footer -->
            <div class="email-footer">
                <div class="footer-content">
                    <p>Cần hỗ trợ? Chúng tôi luôn sẵn sàng giúp bạn!</p>
                    
                    <div class="footer-links">
                        <a href="mailto:support@edulingo.vn">Liên hệ hỗ trợ</a>
                        <a href="https://edulingo.vn/help">Trung tâm trợ giúp</a>
                        <a href="https://edulingo.vn/privacy">Chính sách bảo mật</a>
                    </div>
                    
                    <div class="company-info">
                        <p>© 2024 EduLingo. Bảo lưu mọi quyền.</p>
                        <p>123 Đường Nguyễn Văn Linh, Quận 7, TP.HCM</p>
                    </div>
                </div>
            </div>
        </div>
    </body>
    </html>
    `;
};

const generatePasswordResetConfirmationEmail = (data) => {
  const {
    name,
    resetTime,
    ipAddress = "Không xác định",
    userAgent = "Không xác định",
    loginUrl,
    supportUrl,
  } = data;

  return `
    <!DOCTYPE html>
    <html lang="vi">
    <head>
        <meta charset="UTF-8">
        <meta name="viewport" content="width=device-width, initial-scale=1.0">
        <title>Đặt Lại Mật Khẩu Thành Công</title>
        <style>
            * {
                margin: 0;
                padding: 0;
                box-sizing: border-box;
            }
            
            body {
                font-family: 'Segoe UI', Tahoma, Geneva, Verdana, sans-serif;
                line-height: 1.6;
                color: #333;
                background-color: #f4f4f4;
            }
            
            .email-container {
                max-width: 600px;
                margin: 0 auto;
                background-color: #ffffff;
                border-radius: 10px;
                overflow: hidden;
                box-shadow: 0 4px 10px rgba(0, 0, 0, 0.1);
            }
            
            .email-header {
                background: linear-gradient(135deg, #4CAF50 0%, #45a049 100%);
                color: white;
                padding: 40px 30px;
                text-align: center;
            }
            
            .email-header h1 {
                font-size: 28px;
                margin-bottom: 10px;
                font-weight: 600;
            }
            
            .email-header p {
                font-size: 16px;
                opacity: 0.9;
            }
            
            .success-icon {
                font-size: 48px;
                margin-bottom: 20px;
                display: block;
            }
            
            .email-body {
                padding: 40px 30px;
            }
            
            .greeting {
                font-size: 18px;
                margin-bottom: 20px;
                color: #2c3e50;
            }
            
            .message-content {
                font-size: 16px;
                line-height: 1.8;
                color: #555;
                margin-bottom: 30px;
            }
            
            .success-notice {
                background-color: #d4edda;
                border: 1px solid #c3e6cb;
                border-radius: 8px;
                padding: 20px;
                margin: 20px 0;
            }
            
            .success-notice .icon {
                color: #155724;
                font-size: 20px;
                margin-right: 10px;
            }
            
            .success-notice h3 {
                color: #155724;
                font-size: 16px;
                margin-bottom: 10px;
            }
            
            .success-notice p {
                color: #155724;
                font-size: 14px;
                margin: 5px 0;
            }
            
            .reset-details {
                background-color: #f8f9fa;
                border: 1px solid #dee2e6;
                border-radius: 8px;
                padding: 20px;
                margin: 20px 0;
            }
            
            .reset-details h4 {
                color: #495057;
                font-size: 14px;
                margin-bottom: 15px;
                text-transform: uppercase;
                letter-spacing: 1px;
            }
            
            .detail-row {
                display: flex;
                justify-content: space-between;
                margin: 8px 0;
                padding: 8px 0;
                border-bottom: 1px solid #e9ecef;
            }
            
            .detail-row:last-child {
                border-bottom: none;
            }
            
            .detail-label {
                font-weight: 600;
                color: #6c757d;
                font-size: 13px;
            }
            
            .detail-value {
                color: #495057;
                font-size: 13px;
                text-align: right;
                max-width: 60%;
                word-break: break-word;
            }
            
            .cta-section {
                text-align: center;
                margin: 30px 0;
            }
            
            .cta-button {
                display: inline-block;
                background: linear-gradient(135deg, #4CAF50 0%, #45a049 100%);
                color: white;
                text-decoration: none;
                padding: 15px 35px;
                border-radius: 50px;
                font-weight: 600;
                font-size: 16px;
                margin: 10px;
                transition: transform 0.2s ease;
            }
            
            .cta-button:hover {
                transform: translateY(-2px);
                box-shadow: 0 6px 20px rgba(76, 175, 80, 0.4);
            }
            
            .security-tips {
                background-color: #fff3cd;
                border: 1px solid #ffeaa7;
                border-radius: 8px;
                padding: 20px;
                margin: 20px 0;
            }
            
            .security-tips h3 {
                color: #856404;
                font-size: 16px;
                margin-bottom: 15px;
            }
            
            .security-tips ul {
                list-style: none;
                padding: 0;
            }
            
            .security-tips li {
                margin: 8px 0;
                padding-left: 20px;
                position: relative;
                color: #856404;
                font-size: 14px;
            }
            
            .security-tips li:before {
                content: "🔒";
                position: absolute;
                left: 0;
            }
            
            .warning-notice {
                background-color: #f8d7da;
                border: 1px solid #f5c6cb;
                border-radius: 8px;
                padding: 20px;
                margin: 20px 0;
            }
            
            .warning-notice p {
                color: #721c24;
                font-size: 14px;
                margin: 0;
            }
            
            .email-footer {
                background-color: #f8f9fa;
                padding: 30px;
                text-align: center;
                border-top: 1px solid #e9ecef;
            }
            
            .footer-content {
                font-size: 14px;
                color: #6c757d;
                line-height: 1.6;
            }
            
            .footer-links {
                margin: 20px 0;
            }
            
            .footer-links a {
                color: #4CAF50;
                text-decoration: none;
                margin: 0 15px;
                font-weight: 500;
            }
            
            .footer-links a:hover {
                text-decoration: underline;
            }
            
            .company-info {
                margin-top: 20px;
                font-size: 12px;
                color: #adb5bd;
            }
            
            @media (max-width: 600px) {
                .email-container {
                    margin: 0;
                    border-radius: 0;
                }
                
                .email-header,
                .email-body,
                .email-footer {
                    padding: 20px;
                }
                
                .detail-row {
                    flex-direction: column;
                    gap: 5px;
                }
                
                .detail-value {
                    text-align: left;
                    max-width: 100%;
                }
                
                .cta-button {
                    display: block;
                    margin: 10px auto;
                    max-width: 250px;
                }
            }
        </style>
    </head>
    <body>
        <div class="email-container">
            <!-- Header -->
            <div class="email-header">
                <span class="success-icon">✅</span>
                <h1>Đặt Lại Mật Khẩu Thành Công</h1>
                <p>Tài khoản học tập của bạn đã được bảo mật</p>
            </div>
            
            <!-- Body -->
            <div class="email-body">
                <div class="greeting">
                    Xin chào <strong>${name}</strong>,
                </div>
                
                <div class="message-content">
                    <p>Mật khẩu của bạn đã được đặt lại thành công cho tài khoản <strong>EduLingo</strong>. Bạn có thể đăng nhập bằng mật khẩu mới ngay bây giờ.</p>
                </div>
                
                <!-- Success Notice -->
                <div class="success-notice">
                    <h3>
                        <span class="icon">🎉</span>
                        Hoàn Tất Đặt Lại Mật Khẩu
                    </h3>
                    <p>Mật khẩu của bạn đã được thay đổi thành công và tất cả phiên đăng nhập cũ đã được đăng xuất vì lý do bảo mật.</p>
                    <p>Bạn sẽ cần đăng nhập lại trên tất cả thiết bị.</p>
                </div>
                
                <!-- Reset Details -->
                <div class="reset-details">
                    <h4>🔍 Chi Tiết Đặt Lại:</h4>
                    <div class="detail-row">
                        <span class="detail-label">Thời gian:</span>
                        <span class="detail-value">${new Date(resetTime).toLocaleString("vi-VN")}</span>
                    </div>
                    <div class="detail-row">
                        <span class="detail-label">Địa chỉ IP:</span>
                        <span class="detail-value">${ipAddress}</span>
                    </div>
                    <div class="detail-row">
                        <span class="detail-label">Thiết bị:</span>
                        <span class="detail-value">${userAgent.includes("Mobile") ? "Thiết bị di động" : "Máy tính"}</span>
                    </div>
                    <div class="detail-row">
                        <span class="detail-label">Phiên đăng nhập:</span>
                        <span class="detail-value">Đã thu hồi tất cả</span>
                    </div>
                </div>
                
                <!-- CTA Section -->
                <div class="cta-section">
                    <h3>Sẵn sàng học tập?</h3>
                    <p>Sử dụng mật khẩu mới để truy cập tài khoản của bạn</p>
                    
                    <a href="${loginUrl}" class="cta-button">
                        🚀 Đăng Nhập Ngay
                    </a>
                </div>
                
                <!-- Security Tips -->
                <div class="security-tips">
                    <h3>🛡️ Lời Khuyên Bảo Mật:</h3>
                    <ul>
                        <li>Không chia sẻ mật khẩu với bất kỳ ai</li>
                        <li>Sử dụng mật khẩu riêng cho tài khoản EduLingo</li>
                        <li>Kích hoạt xác thực hai bước để tăng bảo mật</li>
                        <li>Lưu mật khẩu trong trình quản lý mật khẩu an toàn</li>
                        <li>Đăng xuất khỏi máy tính công cộng sau khi sử dụng</li>
                    </ul>
                </div>
                
                <!-- Warning Notice -->
                <div class="warning-notice">
                    <p>
                        <strong>⚠️ Không phải bạn đặt lại mật khẩu?</strong> 
                        Nếu bạn không thực hiện yêu cầu này, vui lòng liên hệ đội ngũ hỗ trợ ngay lập tức. 
                        Tài khoản của bạn có thể đã bị xâm phạm.
                    </p>
                </div>
                
                <div class="message-content">
                    <p>Nếu bạn có bất kỳ thắc mắc nào về bảo mật tài khoản, đội ngũ hỗ trợ của chúng tôi luôn sẵn sàng giúp đỡ 24/7.</p>
                    
                    <p><strong>Học an toàn và hiệu quả!</strong><br>Đội ngũ Bảo mật EduLingo</p>
                </div>
            </div>
            
            <!-- Footer -->
            <div class="email-footer">
                <div class="footer-content">
                    <p>Cần trợ giúp? Đội ngũ bảo mật luôn sẵn sàng hỗ trợ bạn!</p>
                    
                    <div class="footer-links">
                        <a href="${supportUrl}">Liên hệ hỗ trợ</a>
                        <a href="https://edulingo.vn/security">Trung tâm bảo mật</a>
                        <a href="https://edulingo.vn/help">Trung tâm trợ giúp</a>
                        <a href="https://edulingo.vn/privacy">Chính sách bảo mật</a>
                    </div>
                    
                    <div class="company-info">
                        <p>© 2024 EduLingo. Bảo lưu mọi quyền.</p>
                        <p>123 Đường Nguyễn Văn Linh, Quận 7, TP.HCM</p>
                        <p>Email này được gửi vì mật khẩu của bạn đã được đặt lại trên nền tảng của chúng tôi.</p>
                    </div>
                </div>
            </div>
        </div>
    </body>
    </html>
    `;
};

const sendTemplatedEmail = async (emailData) => {
  try {
    const { to, subject, template, data, html } = emailData;

    let emailHtml = html;

    // Generate HTML from template if specified
    if (template && !html) {
      switch (template) {
        case "verification":
        case "email-verification":
          emailHtml = generateVerificationEmail(data);
          break;
        case "password-reset":
          emailHtml = generatePasswordResetConfirmationEmail(data);
          break;
        case "forgot-password":
          emailHtml = generatePasswordResetEmail(data);
          break;
        case "welcome":
          emailHtml = generateWelcomeEmail(data);
          break;
        default:
          throw new Error(`Template không tồn tại: ${template}`);
      }
    }

    if (!emailHtml) {
      throw new Error("Không có nội dung HTML");
    }
    await sendEmail(to, subject, emailHtml);
    return "Email đã được gửi thành công";
  } catch (error) {
    console.error("❌ Gửi email thất bại:", error);
    throw new Error("Gửi email thất bại: " + error.message);
  }
};

const generatePasswordResetEmail = (data) => {
  const {
    name,
    resetUrl,
    expiresIn = "1 giờ",
    ipAddress = "Không xác định",
    userAgent = "Không xác định",
  } = data;

  return `
    <!DOCTYPE html>
    <html lang="vi">
    <head>
        <meta charset="UTF-8">
        <meta name="viewport" content="width=device-width, initial-scale=1.0">
        <title>Đặt Lại Mật Khẩu</title>
        <style>
            * {
                margin: 0;
                padding: 0;
                box-sizing: border-box;
            }
            
            body {
                font-family: 'Segoe UI', Tahoma, Geneva, Verdana, sans-serif;
                line-height: 1.6;
                color: #333;
                background-color: #f4f4f4;
            }
            
            .email-container {
                max-width: 600px;
                margin: 0 auto;
                background-color: #ffffff;
                border-radius: 10px;
                overflow: hidden;
                box-shadow: 0 4px 10px rgba(0, 0, 0, 0.1);
            }
            
            .email-header {
                background: linear-gradient(135deg, #ff9800 0%, #f57c00 100%);
                color: white;
                padding: 40px 30px;
                text-align: center;
            }
            
            .email-header h1 {
                font-size: 28px;
                margin-bottom: 10px;
                font-weight: 600;
            }
            
            .email-header p {
                font-size: 16px;
                opacity: 0.9;
            }
            
            .email-body {
                padding: 40px 30px;
            }
            
            .greeting {
                font-size: 18px;
                margin-bottom: 20px;
                color: #2c3e50;
            }
            
            .message-content {
                font-size: 16px;
                line-height: 1.8;
                color: #555;
                margin-bottom: 30px;
            }
            
            .reset-button {
                display: inline-block;
                background: linear-gradient(135deg, #ff9800 0%, #f57c00 100%);
                color: white;
                text-decoration: none;
                padding: 15px 35px;
                border-radius: 50px;
                font-weight: 600;
                font-size: 16px;
                text-align: center;
                margin: 20px 0;
                transition: transform 0.2s ease;
            }
            
            .reset-button:hover {
                transform: translateY(-2px);
                box-shadow: 0 6px 20px rgba(255, 152, 0, 0.4);
            }
            
            .button-container {
                text-align: center;
                margin: 30px 0;
            }
            
            .divider {
                height: 1px;
                background: linear-gradient(to right, transparent, #ddd, transparent);
                margin: 30px 0;
            }
            
            .alternative-link {
                background-color: #f8f9fa;
                border: 1px solid #e9ecef;
                border-radius: 8px;
                padding: 20px;
                margin: 20px 0;
            }
            
            .alternative-link p {
                font-size: 14px;
                color: #6c757d;
                margin-bottom: 10px;
            }
            
            .alternative-link a {
                color: #ff9800;
                word-break: break-all;
                text-decoration: none;
                font-size: 13px;
            }
            
            .security-warning {
                background-color: #fff3cd;
                border: 1px solid #ffeaa7;
                border-radius: 8px;
                padding: 20px;
                margin: 20px 0;
            }
            
            .security-warning .icon {
                color: #856404;
                font-size: 20px;
                margin-right: 10px;
            }
            
            .security-warning h3 {
                color: #856404;
                font-size: 16px;
                margin-bottom: 10px;
            }
            
            .security-warning p {
                color: #856404;
                font-size: 14px;
                margin: 5px 0;
            }
            
            .security-info {
                background-color: #f8f9fa;
                border: 1px solid #dee2e6;
                border-radius: 8px;
                padding: 15px;
                margin: 20px 0;
            }
            
            .security-info h4 {
                color: #495057;
                font-size: 14px;
                margin-bottom: 10px;
            }
            
            .security-info p {
                color: #6c757d;
                font-size: 13px;
                margin: 2px 0;
            }
            
            .no-request-notice {
                background-color: #d1ecf1;
                border: 1px solid #bee5eb;
                border-radius: 8px;
                padding: 20px;
                margin: 20px 0;
            }
            
            .no-request-notice p {
                color: #0c5460;
                font-size: 14px;
                margin: 0;
            }
            
            .email-footer {
                background-color: #f8f9fa;
                padding: 30px;
                text-align: center;
                border-top: 1px solid #e9ecef;
            }
            
            .footer-content {
                font-size: 14px;
                color: #6c757d;
                line-height: 1.6;
            }
            
            .footer-links {
                margin: 20px 0;
            }
            
            .footer-links a {
                color: #ff9800;
                text-decoration: none;
                margin: 0 15px;
                font-weight: 500;
            }
            
            .footer-links a:hover {
                text-decoration: underline;
            }
            
            .company-info {
                margin-top: 20px;
                font-size: 12px;
                color: #adb5bd;
            }
            
            @media (max-width: 600px) {
                .email-container {
                    margin: 0;
                    border-radius: 0;
                }
                
                .email-header,
                .email-body,
                .email-footer {
                    padding: 20px;
                }
                
                .email-header h1 {
                    font-size: 24px;
                }
                
                .reset-button {
                    display: block;
                    margin: 20px auto;
                }
            }
        </style>
    </head>
    <body>
        <div class="email-container">
            <!-- Header -->
            <div class="email-header">
                <h1>🔐 Yêu Cầu Đặt Lại Mật Khẩu</h1>
                <p>Bảo vệ tài khoản học tập của bạn</p>
            </div>
            
            <!-- Body -->
            <div class="email-body">
                <div class="greeting">
                    Xin chào <strong>${name}</strong>,
                </div>
                
                <div class="message-content">
                    <p>Chúng tôi nhận được yêu cầu đặt lại mật khẩu cho tài khoản <strong>EduLingo</strong> của bạn.</p>
                    
                    <p>Nếu bạn thực hiện yêu cầu này, hãy nhấn vào nút bên dưới để tạo mật khẩu mới:</p>
                </div>
                
                <div class="button-container">
                    <a href="${resetUrl}" class="reset-button">
                        🔑 Đặt Lại Mật Khẩu
                    </a>
                </div>
                
                <div class="divider"></div>
                
                <!-- Alternative Link -->
                <div class="alternative-link">
                    <p><strong>Nút không hoạt động?</strong> Sao chép và dán đường link sau vào trình duyệt:</p>
                    <a href="${resetUrl}">${resetUrl}</a>
                </div>
                
                <!-- Security Warning -->
                <div class="security-warning">
                    <h3>
                        <span class="icon">⚠️</span>
                        Thông Tin Bảo Mật Quan Trọng
                    </h3>
                    <p>• Link đặt lại mật khẩu sẽ hết hạn sau <strong>${expiresIn}</strong></p>
                    <p>• Link này chỉ có thể sử dụng một lần</p>
                    <p>• Vui lòng chọn mật khẩu mạnh và duy nhất</p>
                    <p>• Không chia sẻ link này với bất kỳ ai</p>
                </div>
                
                <!-- Request Info -->
                <div class="security-info">
                    <h4>🔍 Chi Tiết Yêu Cầu:</h4>
                    <p><strong>Thời gian:</strong> ${new Date().toLocaleString("vi-VN")}</p>
                    <p><strong>Địa chỉ IP:</strong> ${ipAddress}</p>
                    <p><strong>Thiết bị:</strong> ${userAgent.includes("Mobile") ? "Thiết bị di động" : "Máy tính"}</p>
                </div>
                
                <!-- Didn't Request Notice -->
                <div class="no-request-notice">
                    <p>
                        <strong>📋 Không phải bạn yêu cầu?</strong> 
                        Nếu bạn không yêu cầu đặt lại mật khẩu, vui lòng bỏ qua email này. 
                        Mật khẩu của bạn sẽ không thay đổi. Hãy xem xét thay đổi mật khẩu 
                        nếu bạn nghi ngờ tài khoản bị truy cập trái phép.
                    </p>
                </div>
                
                <div class="message-content">
                    <p><strong>Mẹo tạo mật khẩu an toàn:</strong></p>
                    <ul style="margin: 15px 0; padding-left: 20px;">
                        <li>Sử dụng ít nhất 8 ký tự với sự kết hợp của chữ cái, số và ký hiệu</li>
                        <li>Tránh sử dụng thông tin cá nhân hoặc từ phổ biến</li>
                        <li>Không tái sử dụng mật khẩu từ các tài khoản khác</li>
                        <li>Cân nhắc sử dụng trình quản lý mật khẩu</li>
                    </ul>
                </div>
            </div>
            
            <!-- Footer -->
            <div class="email-footer">
                <div class="footer-content">
                    <p>Cần trợ giúp? Đội ngũ hỗ trợ của chúng tôi luôn sẵn sàng!</p>
                    
                    <div class="footer-links">
                        <a href="mailto:support@edulingo.vn">Liên hệ hỗ trợ</a>
                        <a href="https://edulingo.vn/security">Trung tâm bảo mật</a>
                        <a href="https://edulingo.vn/help">Trung tâm trợ giúp</a>
                    </div>
                    
                    <div class="company-info">
                        <p>© 2024 EduLingo. Bảo lưu mọi quyền.</p>
                        <p>123 Đường Nguyễn Văn Linh, Quận 7, TP.HCM</p>
                    </div>
                </div>
            </div>
        </div>
    </body>
    </html>
    `;
};
const generateWelcomeEmail = (data) => {
  const { name, dashboardUrl, supportUrl } = data;

  return `
    <!DOCTYPE html>
    <html lang="vi">
    <head>
        <meta charset="UTF-8">
        <meta name="viewport" content="width=device-width, initial-scale=1.0">
        <title>Chào mừng đến với EduLingo!</title>
        <style>
            * {
                margin: 0;
                padding: 0;
                box-sizing: border-box;
            }
            
            body {
                font-family: 'Segoe UI', Tahoma, Geneva, Verdana, sans-serif;
                line-height: 1.6;
                color: #333;
                background-color: #f4f4f4;
            }
            
            .email-container {
                max-width: 600px;
                margin: 0 auto;
                background-color: #ffffff;
                border-radius: 10px;
                overflow: hidden;
                box-shadow: 0 4px 10px rgba(0, 0, 0, 0.1);
            }
            
            .email-header {
                background: linear-gradient(135deg, #2196F3 0%, #1976D2 100%);
                color: white;
                padding: 40px 30px;
                text-align: center;
            }
            
            .email-header h1 {
                font-size: 28px;
                margin-bottom: 10px;
                font-weight: 600;
            }
            
            .email-header p {
                font-size: 16px;
                opacity: 0.9;
            }
            
            .celebration-icon {
                font-size: 48px;
                margin-bottom: 20px;
                display: block;
            }
            
            .email-body {
                padding: 40px 30px;
            }
            
            .welcome-message {
                font-size: 18px;
                margin-bottom: 20px;
                color: #2c3e50;
                text-align: center;
            }
            
            .message-content {
                font-size: 16px;
                line-height: 1.8;
                color: #555;
                margin-bottom: 30px;
            }
            
            .features-grid {
                display: grid;
                grid-template-columns: 1fr 1fr;
                gap: 20px;
                margin: 30px 0;
            }
            
            .feature-item {
                background-color: #f8f9fa;
                padding: 20px;
                border-radius: 8px;
                text-align: center;
                border: 1px solid #e9ecef;
            }
            
            .feature-icon {
                font-size: 24px;
                margin-bottom: 10px;
                display: block;
            }
            
            .feature-title {
                font-weight: 600;
                margin-bottom: 8px;
                color: #2c3e50;
            }
            
            .feature-desc {
                font-size: 14px;
                color: #6c757d;
            }
            
            .cta-section {
                background: linear-gradient(135deg, #2196F3 0%, #1976D2 100%);
                color: white;
                padding: 30px;
                border-radius: 10px;
                text-align: center;
                margin: 30px 0;
            }
            
            .cta-button {
                display: inline-block;
                background: rgba(255, 255, 255, 0.2);
                color: white;
                text-decoration: none;
                padding: 15px 35px;
                border-radius: 50px;
                font-weight: 600;
                font-size: 16px;
                margin: 15px 10px;
                transition: all 0.3s ease;
                border: 2px solid rgba(255, 255, 255, 0.3);
            }
            
            .cta-button:hover {
                background: rgba(255, 255, 255, 0.3);
                transform: translateY(-2px);
            }
            
            .cta-button.primary {
                background: white;
                color: #2196F3;
            }
            
            .next-steps {
                background-color: #e7f3ff;
                border: 1px solid #b8daff;
                border-radius: 8px;
                padding: 20px;
                margin: 20px 0;
            }
            
            .next-steps h3 {
                color: #0056b3;
                margin-bottom: 15px;
                font-size: 16px;
            }
            
            .next-steps ul {
                list-style: none;
                padding: 0;
            }
            
            .next-steps li {
                margin: 8px 0;
                padding-left: 20px;
                position: relative;
                color: #495057;
                font-size: 14px;
            }
            
            .next-steps li:before {
                content: "✓";
                position: absolute;
                left: 0;
                color: #28a745;
                font-weight: bold;
            }
            
            .email-footer {
                background-color: #f8f9fa;
                padding: 30px;
                text-align: center;
                border-top: 1px solid #e9ecef;
            }
            
            .footer-content {
                font-size: 14px;
                color: #6c757d;
                line-height: 1.6;
            }
            
            .footer-links {
                margin: 20px 0;
            }
            
            .footer-links a {
                color: #2196F3;
                text-decoration: none;
                margin: 0 15px;
                font-weight: 500;
            }
            
            .footer-links a:hover {
                text-decoration: underline;
            }
            
            .company-info {
                margin-top: 20px;
                font-size: 12px;
                color: #adb5bd;
            }
            
            @media (max-width: 600px) {
                .email-container {
                    margin: 0;
                    border-radius: 0;
                }
                
                .email-header,
                .email-body,
                .email-footer {
                    padding: 20px;
                }
                
                .features-grid {
                    grid-template-columns: 1fr;
                    gap: 15px;
                }
                
                .cta-button {
                    display: block;
                    margin: 10px auto;
                    max-width: 250px;
                }
            }
        </style>
    </head>
    <body>
        <div class="email-container">
            <!-- Header -->
            <div class="email-header">
                <span class="celebration-icon">🎊</span>
                <h1>Chào mừng đến với EduLingo!</h1>
                <p>Hành trình chinh phục tiếng Anh của bạn bắt đầu từ đây</p>
            </div>
            
            <!-- Body -->
            <div class="email-body">
                <div class="welcome-message">
                    Chào mừng bạn, <strong>${name}</strong>! 🚀
                </div>
                
                <div class="message-content">
                    <p>Chúc mừng! Email của bạn đã được xác thực thành công và tài khoản học tập của bạn đã được kích hoạt hoàn toàn. Bạn giờ đây là thành viên của cộng đồng học viên năng động tại EduLingo.</p>
                    
                    <p>EduLingo là nền tảng học tiếng Anh trực tuyến hàng đầu, giúp bạn nâng cao trình độ tiếng Anh một cách hiệu quả và thú vị.</p>
                </div>
                
                <!-- Features Grid -->
                <div class="features-grid">
                    <div class="feature-item">
                        <span class="feature-icon">📚</span>
                        <div class="feature-title">Khóa Học Đa Dạng</div>
                        <div class="feature-desc">Từ căn bản đến nâng cao, phù hợp mọi trình độ</div>
                    </div>
                    
                    <div class="feature-item">
                        <span class="feature-icon">🎧</span>
                        <div class="feature-title">Luyện 4 Kỹ Năng</div>
                        <div class="feature-desc">Nghe, Nói, Đọc, Viết toàn diện</div>
                    </div>
                    
                    <div class="feature-item">
                        <span class="feature-icon">👩‍🏫</span>
                        <div class="feature-title">Giáo Viên Bản Ngữ</div>
                        <div class="feature-desc">Học trực tiếp với giáo viên quốc tế</div>
                    </div>
                    
                    <div class="feature-item">
                        <span class="feature-icon">📊</span>
                        <div class="feature-title">Theo Dõi Tiến Độ</div>
                        <div class="feature-desc">Báo cáo chi tiết về quá trình học</div>
                    </div>
                </div>
                
                <!-- CTA Section -->
                <div class="cta-section">
                    <h2>Sẵn sàng bắt đầu chưa?</h2>
                    <p>Hãy kiểm tra trình độ và khám phá các khóa học phù hợp!</p>
                    
                    <a href="${dashboardUrl}" class="cta-button primary">
                        🏠 Vào Trang Học Tập
                    </a>
                    
                    <a href="${dashboardUrl}/test/placement" class="cta-button">
                        📝 Làm Bài Test Đầu Vào
                    </a>
                </div>
                
                <!-- Next Steps -->
                <div class="next-steps">
                    <h3>🎯 Các bước tiếp theo:</h3>
                    <ul>
                        <li>Làm bài kiểm tra trình độ để xác định level phù hợp</li>
                        <li>Hoàn thiện hồ sơ học viên với ảnh và giới thiệu</li>
                        <li>Khám phá thư viện bài học và tài liệu</li>
                        <li>Đăng ký lớp học đầu tiên với giáo viên</li>
                        <li>Tham gia cộng đồng học viên để trao đổi kinh nghiệm</li>
                        <li>Đặt mục tiêu học tập và lập kế hoạch cá nhân</li>
                    </ul>
                </div>
                
                <div class="message-content">
                    <p>Nếu bạn có bất kỳ thắc mắc nào hoặc cần hỗ trợ, đội ngũ tư vấn của chúng tôi luôn sẵn sàng giúp đỡ. Đừng ngần ngại liên hệ!</p>
                    
                    <p>Chúng tôi rất mong được đồng hành cùng bạn trên con đường chinh phục tiếng Anh.</p>
                    
                    <p style="margin-top: 30px;"><strong>Chúc bạn học tập vui vẻ và hiệu quả!</strong><br>Đội ngũ EduLingo</p>
                </div>
            </div>
            
            <!-- Footer -->
            <div class="email-footer">
                <div class="footer-content">
                    <p>Cần hỗ trợ? Chúng tôi luôn ở đây!</p>
                    
                    <div class="footer-links">
                        <a href="${supportUrl}">Hỗ trợ học viên</a>
                        <a href="${dashboardUrl}/help">Trung tâm trợ giúp</a>
                        <a href="https://edulingo.vn/community">Cộng đồng</a>
                        <a href="https://edulingo.vn/blog">Blog học tập</a>
                    </div>
                    
                    <div class="company-info">
                        <p>© 2024 EduLingo. Bảo lưu mọi quyền.</p>
                        <p>123 Đường Nguyễn Văn Linh, Quận 7, TP.HCM</p>
                        <p>Bạn nhận được email này vì đã tạo tài khoản tại EduLingo.</p>
                    </div>
                </div>
            </div>
        </div>
    </body>
    </html>
    `;
};

// Export templates and functions
module.exports = {
  generateVerificationEmail,
  generatePasswordResetEmail,
  generatePasswordResetConfirmationEmail,
  generateWelcomeEmail,
  sendTemplatedEmail,
};
