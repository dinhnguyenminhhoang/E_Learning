"use client";

import { Button } from "@/components/ui/button";
import { ArrowLeft, Shield } from "lucide-react";
import { useRouter } from "next/navigation";

export default function PrivacyPolicyPage() {
    const router = useRouter();

    return (
        <div className="min-h-screen bg-gradient-to-br from-green-50 via-white to-emerald-50 py-12 px-4 sm:px-6 lg:px-8">
            <div className="max-w-4xl mx-auto">
                {/* Header */}
                <div className="mb-8">
                    <Button
                        variant="ghost"
                        onClick={() => router.back()}
                        className="mb-4 -ml-2"
                    >
                        <ArrowLeft className="w-4 h-4 mr-2" />
                        Quay lại
                    </Button>
                    <div className="flex items-center gap-3 mb-4">
                        <div className="p-3 bg-green-100 rounded-lg">
                            <Shield className="w-6 h-6 text-green-600" />
                        </div>
                        <div>
                            <h1 className="text-3xl font-bold text-gray-900">
                                Chính sách bảo mật
                            </h1>
                            <p className="text-sm text-gray-600 mt-1">
                                Cập nhật lần cuối: Tháng 1, 2026
                            </p>
                        </div>
                    </div>
                </div>

                {/* Content */}
                <div className="bg-white rounded-2xl shadow-sm border border-gray-200 p-8 space-y-8">
                    {/* Introduction */}
                    <section>
                        <h2 className="text-2xl font-bold text-gray-900 mb-4">
                            1. Cam kết bảo mật
                        </h2>
                        <p className="text-gray-700 leading-relaxed">
                            E-Learning Platform cam kết bảo vệ quyền riêng tư và bảo mật thông tin cá nhân của người dùng. Chính sách bảo mật này giải thích cách chúng tôi thu thập, sử dụng, lưu trữ và bảo vệ dữ liệu của bạn khi bạn sử dụng nền tảng học tập của chúng tôi.
                        </p>
                        <p className="text-gray-700 leading-relaxed mt-3">
                            Chúng tôi tuân thủ các quy định pháp luật về bảo vệ dữ liệu cá nhân và cam kết không chia sẻ thông tin của bạn với bên thứ ba mà không có sự đồng ý.
                        </p>
                    </section>

                    {/* Information Collection */}
                    <section>
                        <h2 className="text-2xl font-bold text-gray-900 mb-4">
                            2. Thông tin chúng tôi thu thập
                        </h2>
                        <div className="space-y-4">
                            <div>
                                <h3 className="text-lg font-semibold text-gray-900 mb-2">
                                    2.1. Thông tin cá nhân
                                </h3>
                                <p className="text-gray-700 leading-relaxed">
                                    Khi bạn đăng ký tài khoản, chúng tôi thu thập:
                                </p>
                                <ul className="list-disc list-inside space-y-1 ml-4 text-gray-700 mt-2">
                                    <li>Họ và tên</li>
                                    <li>Địa chỉ email</li>
                                    <li>Số điện thoại (nếu cung cấp)</li>
                                    <li>Ảnh đại diện (tùy chọn)</li>
                                    <li>Ngày sinh, giới tính (tùy chọn)</li>
                                </ul>
                            </div>

                            <div>
                                <h3 className="text-lg font-semibold text-gray-900 mb-2">
                                    2.2. Thông tin học tập
                                </h3>
                                <p className="text-gray-700 leading-relaxed">
                                    Để cải thiện trải nghiệm học tập, chúng tôi ghi nhận:
                                </p>
                                <ul className="list-disc list-inside space-y-1 ml-4 text-gray-700 mt-2">
                                    <li>Tiến độ học tập và kết quả bài kiểm tra</li>
                                    <li>Thời gian học tập và tần suất truy cập</li>
                                    <li>Các khóa học đã đăng ký và hoàn thành</li>
                                    <li>Lịch sử tương tác với nội dung học tập</li>
                                    <li>Điểm số, thành tích và chứng chỉ</li>
                                </ul>
                            </div>

                            <div>
                                <h3 className="text-lg font-semibold text-gray-900 mb-2">
                                    2.3. Thông tin kỹ thuật
                                </h3>
                                <p className="text-gray-700 leading-relaxed">
                                    Chúng tôi tự động thu thập:
                                </p>
                                <ul className="list-disc list-inside space-y-1 ml-4 text-gray-700 mt-2">
                                    <li>Địa chỉ IP và vị trí địa lý (gần đúng)</li>
                                    <li>Loại trình duyệt và thiết bị sử dụng</li>
                                    <li>Hệ điều hành</li>
                                    <li>Cookies và dữ liệu phiên làm việc</li>
                                    <li>Log hoạt động và lỗi hệ thống</li>
                                </ul>
                            </div>

                            <div>
                                <h3 className="text-lg font-semibold text-gray-900 mb-2">
                                    2.4. Thông tin thanh toán
                                </h3>
                                <p className="text-gray-700 leading-relaxed">
                                    Khi bạn thanh toán cho khóa học:
                                </p>
                                <ul className="list-disc list-inside space-y-1 ml-4 text-gray-700 mt-2">
                                    <li>Lịch sử giao dịch và hóa đơn</li>
                                    <li>Phương thức thanh toán (được mã hóa)</li>
                                    <li>Thông tin thanh toán được xử lý qua cổng bảo mật (VNPay, Stripe)</li>
                                </ul>
                            </div>
                        </div>
                    </section>

                    {/* How We Use Information */}
                    <section>
                        <h2 className="text-2xl font-bold text-gray-900 mb-4">
                            3. Cách chúng tôi sử dụng thông tin
                        </h2>
                        <div className="space-y-3 text-gray-700">
                            <p className="leading-relaxed">
                                Thông tin của bạn được sử dụng cho các mục đích sau:
                            </p>
                            <ul className="list-disc list-inside space-y-2 ml-4">
                                <li><strong>Cung cấp dịch vụ:</strong> Quản lý tài khoản, cá nhân hóa nội dung học tập, theo dõi tiến độ</li>
                                <li><strong>Cải thiện trải nghiệm:</strong> Phân tích hành vi học tập để tối ưu hóa nội dung và tính năng</li>
                                <li><strong>Giao tiếp:</strong> Gửi thông báo về khóa học, cập nhật hệ thống, khuyến mại</li>
                                <li><strong>Hỗ trợ khách hàng:</strong> Giải đáp thắc mắc, xử lý khiếu nại</li>
                                <li><strong>Bảo mật:</strong> Ngăn chặn gian lận, bảo vệ hệ thống khỏi tấn công</li>
                                <li><strong>Tuân thủ pháp luật:</strong> Đáp ứng yêu cầu của cơ quan chức năng khi cần thiết</li>
                            </ul>
                        </div>
                    </section>

                    {/* Information Sharing */}
                    <section>
                        <h2 className="text-2xl font-bold text-gray-900 mb-4">
                            4. Chia sẻ thông tin
                        </h2>
                        <div className="space-y-3 text-gray-700">
                            <p className="leading-relaxed">
                                <strong>4.1.</strong> Chúng tôi KHÔNG bán hoặc cho thuê thông tin cá nhân của bạn cho bên thứ ba.
                            </p>
                            <p className="leading-relaxed">
                                <strong>4.2.</strong> Thông tin có thể được chia sẻ với:
                            </p>
                            <ul className="list-disc list-inside space-y-2 ml-4">
                                <li><strong>Nhà cung cấp dịch vụ:</strong> Các đối tác hỗ trợ vận hành nền tảng (hosting, phân tích dữ liệu, thanh toán) đều tuân thủ chính sách bảo mật nghiêm ngặt</li>
                                <li><strong>Giảng viên/Tác giả khóa học:</strong> Thông tin cơ bản về tiến độ học tập để cải thiện nội dung</li>
                                <li><strong>Cơ quan pháp luật:</strong> Khi có yêu cầu hợp pháp từ cơ quan nhà nước</li>
                            </ul>
                            <p className="leading-relaxed">
                                <strong>4.3.</strong> Trong trường hợp sáp nhập hoặc mua lại công ty, dữ liệu của bạn có thể được chuyển giao nhưng vẫn được bảo vệ theo chính sách này.
                            </p>
                        </div>
                    </section>

                    {/* Data Security */}
                    <section>
                        <h2 className="text-2xl font-bold text-gray-900 mb-4">
                            5. Bảo mật dữ liệu
                        </h2>
                        <div className="space-y-3 text-gray-700">
                            <p className="leading-relaxed">
                                Chúng tôi áp dụng các biện pháp bảo mật tiên tiến để bảo vệ thông tin của bạn:
                            </p>
                            <ul className="list-disc list-inside space-y-2 ml-4">
                                <li><strong>Mã hóa SSL/TLS:</strong> Tất cả dữ liệu truyền tải được mã hóa</li>
                                <li><strong>Mã hóa mật khẩu:</strong> Mật khẩu được băm (hash) và không thể đọc được</li>
                                <li><strong>Tường lửa và chống xâm nhập:</strong> Hệ thống được giám sát 24/7</li>
                                <li><strong>Kiểm soát truy cập:</strong> Chỉ nhân viên được ủy quyền mới có quyền truy cập dữ liệu</li>
                                <li><strong>Sao lưu định kỳ:</strong> Dữ liệu được sao lưu thường xuyên để phòng tránh mất mát</li>
                                <li><strong>Kiểm tra bảo mật:</strong> Định kỳ đánh giá và cập nhật biện pháp bảo mật</li>
                            </ul>
                        </div>
                    </section>

                    {/* Cookies */}
                    <section>
                        <h2 className="text-2xl font-bold text-gray-900 mb-4">
                            6. Cookies và công nghệ theo dõi
                        </h2>
                        <div className="space-y-3 text-gray-700">
                            <p className="leading-relaxed">
                                <strong>6.1.</strong> Cookies là các tệp văn bản nhỏ được lưu trữ trên thiết bị của bạn để cải thiện trải nghiệm sử dụng.
                            </p>
                            <p className="leading-relaxed">
                                <strong>6.2.</strong> Chúng tôi sử dụng cookies để:
                            </p>
                            <ul className="list-disc list-inside space-y-1 ml-4">
                                <li>Ghi nhớ đăng nhập và tùy chọn cá nhân</li>
                                <li>Phân tích lưu lượng truy cập và hành vi người dùng</li>
                                <li>Cá nhân hóa nội dung và quảng cáo</li>
                                <li>Cải thiện hiệu suất nền tảng</li>
                            </ul>
                            <p className="leading-relaxed">
                                <strong>6.3.</strong> Bạn có thể tắt cookies trong cài đặt trình duyệt, nhưng một số tính năng có thể không hoạt động đúng cách.
                            </p>
                        </div>
                    </section>

                    {/* User Rights */}
                    <section>
                        <h2 className="text-2xl font-bold text-gray-900 mb-4">
                            7. Quyền của người dùng
                        </h2>
                        <div className="space-y-3 text-gray-700">
                            <p className="leading-relaxed">
                                Bạn có các quyền sau đối với dữ liệu cá nhân của mình:
                            </p>
                            <ul className="list-disc list-inside space-y-2 ml-4">
                                <li><strong>Quyền truy cập:</strong> Xem thông tin cá nhân mà chúng tôi lưu trữ</li>
                                <li><strong>Quyền chỉnh sửa:</strong> Cập nhật hoặc sửa đổi thông tin không chính xác</li>
                                <li><strong>Quyền xóa:</strong> Yêu cầu xóa tài khoản và dữ liệu (trừ các thông tin bắt buộc lưu giữ theo pháp luật)</li>
                                <li><strong>Quyền hạn chế xử lý:</strong> Yêu cầu giới hạn cách chúng tôi sử dụng dữ liệu</li>
                                <li><strong>Quyền rút lại đồng ý:</strong> Hủy đăng ký nhận email marketing bất kỳ lúc nào</li>
                                <li><strong>Quyền khiếu nại:</strong> Liên hệ với cơ quan quản lý nếu có vi phạm quyền riêng tư</li>
                            </ul>
                            <p className="leading-relaxed mt-3">
                                Để thực hiện các quyền trên, vui lòng liên hệ với chúng tôi qua email: <strong>privacy@elearning.com</strong>
                            </p>
                        </div>
                    </section>

                    {/* Data Retention */}
                    <section>
                        <h2 className="text-2xl font-bold text-gray-900 mb-4">
                            8. Thời gian lưu trữ dữ liệu
                        </h2>
                        <div className="space-y-3 text-gray-700">
                            <p className="leading-relaxed">
                                <strong>8.1.</strong> Chúng tôi chỉ lưu trữ thông tin cá nhân trong thời gian cần thiết để cung cấp dịch vụ hoặc tuân thủ pháp luật.
                            </p>
                            <p className="leading-relaxed">
                                <strong>8.2.</strong> Khi bạn xóa tài khoản, hầu hết dữ liệu sẽ được xóa trong vòng 30 ngày, trừ:
                            </p>
                            <ul className="list-disc list-inside space-y-1 ml-4">
                                <li>Thông tin thanh toán (lưu 7 năm theo quy định kế toán)</li>
                                <li>Logs bảo mật (lưu 1 năm)</li>
                                <li>Dữ liệu ẩn danh để phân tích (không liên kết với cá nhân)</li>
                            </ul>
                        </div>
                    </section>

                    {/* Third-Party Links */}
                    <section>
                        <h2 className="text-2xl font-bold text-gray-900 mb-4">
                            9. Liên kết bên thứ ba
                        </h2>
                        <div className="space-y-3 text-gray-700">
                            <p className="leading-relaxed">
                                Nền tảng có thể chứa liên kết đến các trang web bên ngoài. Chúng tôi không chịu trách nhiệm về chính sách bảo mật hoặc nội dung của các trang web đó. Vui lòng đọc kỹ chính sách bảo mật của từng trang web trước khi cung cấp thông tin cá nhân.
                            </p>
                        </div>
                    </section>

                    {/* Children Privacy */}
                    <section>
                        <h2 className="text-2xl font-bold text-gray-900 mb-4">
                            10. Quyền riêng tư của trẻ em
                        </h2>
                        <div className="space-y-3 text-gray-700">
                            <p className="leading-relaxed">
                                <strong>10.1.</strong> Nền tảng của chúng tôi dành cho người từ 13 tuổi trở lên.
                            </p>
                            <p className="leading-relaxed">
                                <strong>10.2.</strong> Nếu bạn dưới 18 tuổi, cần có sự đồng ý của cha mẹ/người giám hộ để sử dụng dịch vụ.
                            </p>
                            <p className="leading-relaxed">
                                <strong>10.3.</strong> Chúng tôi không cố ý thu thập thông tin từ trẻ em dưới 13 tuổi. Nếu phát hiện, dữ liệu sẽ được xóa ngay lập tức.
                            </p>
                        </div>
                    </section>

                    {/* Policy Updates */}
                    <section>
                        <h2 className="text-2xl font-bold text-gray-900 mb-4">
                            11. Cập nhật chính sách
                        </h2>
                        <div className="space-y-3 text-gray-700">
                            <p className="leading-relaxed">
                                Chính sách bảo mật này có thể được cập nhật định kỳ để phản ánh thay đổi về luật pháp hoặc cách chúng tôi hoạt động. Mọi thay đổi quan trọng sẽ được thông báo qua email hoặc thông báo trên nền tảng ít nhất 30 ngày trước khi có hiệu lực.
                            </p>
                        </div>
                    </section>

                    {/* Contact */}
                    <section className="bg-green-50 -m-8 p-8 rounded-b-2xl">
                        <h2 className="text-2xl font-bold text-gray-900 mb-4">
                            12. Liên hệ về bảo mật
                        </h2>
                        <p className="text-gray-700 leading-relaxed mb-3">
                            Nếu bạn có câu hỏi hoặc lo ngại về cách chúng tôi xử lý dữ liệu cá nhân, vui lòng liên hệ:
                        </p>
                        <div className="bg-white p-4 rounded-lg border border-green-200">
                            <ul className="space-y-2 text-gray-700">
                                <li><strong>Phòng Bảo mật Dữ liệu:</strong> privacy@elearning.com</li>
                                <li><strong>Email hỗ trợ:</strong> support@elearning.com</li>
                                <li><strong>Điện thoại:</strong> 1900-xxxx (8:00 - 22:00 hàng ngày)</li>
                                <li><strong>Địa chỉ:</strong> Hà Nội, Việt Nam</li>
                            </ul>
                        </div>
                    </section>
                </div>

                {/* Footer */}
                <div className="mt-6 text-center text-sm text-gray-600">
                    <p>
                        Chúng tôi cam kết bảo vệ quyền riêng tư của bạn. Cảm ơn bạn đã tin tưởng E-Learning Platform!
                    </p>
                </div>
            </div>
        </div>
    );
}
