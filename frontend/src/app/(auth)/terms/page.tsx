"use client";

import { Button } from "@/components/ui/button";
import { ArrowLeft, FileText } from "lucide-react";
import { useRouter } from "next/navigation";

export default function TermsOfServicePage() {
    const router = useRouter();

    return (
        <div className="min-h-screen bg-gradient-to-br from-blue-50 via-white to-indigo-50 py-12 px-4 sm:px-6 lg:px-8">
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
                        <div className="p-3 bg-blue-100 rounded-lg">
                            <FileText className="w-6 h-6 text-blue-600" />
                        </div>
                        <div>
                            <h1 className="text-3xl font-bold text-gray-900">
                                Điều khoản dịch vụ
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
                            1. Giới thiệu
                        </h2>
                        <p className="text-gray-700 leading-relaxed">
                            Chào mừng bạn đến với E-Learning Platform! Bằng việc truy cập và sử dụng nền tảng học tập trực tuyến của chúng tôi, bạn đồng ý tuân thủ các điều khoản và điều kiện được nêu dưới đây. Vui lòng đọc kỹ trước khi sử dụng dịch vụ.
                        </p>
                        <p className="text-gray-700 leading-relaxed mt-3">
                            E-Learning Platform là nền tảng giáo dục trực tuyến cung cấp các khóa học về ngôn ngữ, kỹ năng và kiến thức đa dạng nhằm hỗ trợ người học phát triển toàn diện.
                        </p>
                    </section>

                    {/* Account Registration */}
                    <section>
                        <h2 className="text-2xl font-bold text-gray-900 mb-4">
                            2. Đăng ký tài khoản
                        </h2>
                        <div className="space-y-3 text-gray-700">
                            <p className="leading-relaxed">
                                <strong>2.1.</strong> Để sử dụng đầy đủ các tính năng của nền tảng, bạn cần tạo tài khoản bằng cách cung cấp thông tin chính xác và đầy đủ.
                            </p>
                            <p className="leading-relaxed">
                                <strong>2.2.</strong> Bạn cam kết rằng tất cả thông tin cá nhân bạn cung cấp là chính xác, đầy đủ và cập nhật.
                            </p>
                            <p className="leading-relaxed">
                                <strong>2.3.</strong> Bạn chịu trách nhiệm bảo mật thông tin đăng nhập và toàn bộ hoạt động diễn ra dưới tài khoản của mình.
                            </p>
                            <p className="leading-relaxed">
                                <strong>2.4.</strong> Nghiêm cấm chia sẻ tài khoản hoặc cho phép người khác sử dụng tài khoản của bạn.
                            </p>
                        </div>
                    </section>

                    {/* Usage Rights */}
                    <section>
                        <h2 className="text-2xl font-bold text-gray-900 mb-4">
                            3. Quyền sử dụng nội dung
                        </h2>
                        <div className="space-y-3 text-gray-700">
                            <p className="leading-relaxed">
                                <strong>3.1.</strong> Tất cả nội dung học tập trên E-Learning Platform (bao gồm nhưng không giới hạn: bài học, video, hình ảnh, văn bản, bài tập) đều thuộc quyền sở hữu của chúng tôi hoặc đối tác được cấp phép.
                            </p>
                            <p className="leading-relaxed">
                                <strong>3.2.</strong> Bạn được cấp quyền truy cập và sử dụng nội dung cho mục đích học tập cá nhân, phi thương mại.
                            </p>
                            <p className="leading-relaxed">
                                <strong>3.3.</strong> Nghiêm cấm sao chép, phân phối, chỉnh sửa, hoặc sử dụng nội dung cho mục đích thương mại mà không có sự đồng ý bằng văn bản.
                            </p>
                            <p className="leading-relaxed">
                                <strong>3.4.</strong> Nghiêm cấm tải xuống, ghi âm, hoặc lưu trữ nội dung để chia sẻ hoặc phát hành công khai.
                            </p>
                        </div>
                    </section>

                    {/* User Conduct */}
                    <section>
                        <h2 className="text-2xl font-bold text-gray-900 mb-4">
                            4. Quy tắc ứng xử người dùng
                        </h2>
                        <div className="space-y-3 text-gray-700">
                            <p className="leading-relaxed">
                                Khi sử dụng E-Learning Platform, bạn cam kết <strong>KHÔNG</strong>:
                            </p>
                            <ul className="list-disc list-inside space-y-2 ml-4">
                                <li>Vi phạm pháp luật hoạc quyền của bất kỳ cá nhân, tổ chức nào</li>
                                <li>Đăng tải nội dung xúc phạm, phỉ báng, bạo lực, khiêu dâm hoặc bất hợp pháp</li>
                                <li>Spam, quấy rối, hoặc gửi nội dung không mong muốn đến người dùng khác</li>
                                <li>Cố gắng truy cập trái phép, hack, hoặc làm gián đoạn hệ thống</li>
                                <li>Sử dụng bot, script, hoặc công cụ tự động để truy cập dịch vụ</li>
                                <li>Mạo danh người khác hoặc cung cấp thông tin sai lệch</li>
                            </ul>
                        </div>
                    </section>

                    {/* Payment and Refund */}
                    <section>
                        <h2 className="text-2xl font-bold text-gray-900 mb-4">
                            5. Thanh toán và hoàn tiền
                        </h2>
                        <div className="space-y-3 text-gray-700">
                            <p className="leading-relaxed">
                                <strong>5.1.</strong> Một số khóa học trên nền tảng yêu cầu thanh toán phí. Giá cả sẽ được hiển thị rõ ràng trước khi bạn đăng ký.
                            </p>
                            <p className="leading-relaxed">
                                <strong>5.2.</strong> Các khoản thanh toán được xử lý an toàn thông qua các cổng thanh toán uy tín (VNPay, Stripe...).
                            </p>
                            <p className="leading-relaxed">
                                <strong>5.3.</strong> Chính sách hoàn tiền: Bạn có thể yêu cầu hoàn tiền trong vòng 7 ngày kể từ ngày mua nếu chưa hoàn thành quá 30% khóa học.
                            </p>
                            <p className="leading-relaxed">
                                <strong>5.4.</strong> Chúng tôi có quyền thay đổi giá bất kỳ lúc nào nhưng sẽ không áp dụng hồi tố cho các giao dịch đã hoàn tất.
                            </p>
                        </div>
                    </section>

                    {/* Limitation of Liability */}
                    <section>
                        <h2 className="text-2xl font-bold text-gray-900 mb-4">
                            6. Giới hạn trách nhiệm
                        </h2>
                        <div className="space-y-3 text-gray-700">
                            <p className="leading-relaxed">
                                <strong>6.1.</strong> E-Learning Platform cung cấp nội dung học tập &quot;nguyên trạng&quot; và không đảm bảo rằng dịch vụ sẽ luôn không bị gián đoạn hoặc không có lỗi.
                            </p>
                            <p className="leading-relaxed">
                                <strong>6.2.</strong> Chúng tôi không chịu trách nhiệm về bất kỳ tổn thất, thiệt hại trực tiếp hoặc gián tiếp phát sinh từ việc sử dụng hoặc không thể sử dụng dịch vụ.
                            </p>
                            <p className="leading-relaxed">
                                <strong>6.3.</strong> Người dùng tự chịu trách nhiệm về kết quả học tập cá nhân. Nền tảng chỉ cung cấp công cụ và nội dung hỗ trợ học tập.
                            </p>
                        </div>
                    </section>

                    {/* Intellectual Property */}
                    <section>
                        <h2 className="text-2xl font-bold text-gray-900 mb-4">
                            7. Sở hữu trí tuệ
                        </h2>
                        <div className="space-y-3 text-gray-700">
                            <p className="leading-relaxed">
                                <strong>7.1.</strong> Tất cả quyền sở hữu trí tuệ liên quan đến E-Learning Platform (logo, thiết kế, mã nguồn, nội dung) đều thuộc về chúng tôi.
                            </p>
                            <p className="leading-relaxed">
                                <strong>7.2.</strong> Nếu bạn gửi bất kỳ nội dung nào (bài tập, phản hồi, ý kiến), bạn tự động cấp cho chúng tôi quyền sử dụng nội dung đó nhằm cải thiện dịch vụ.
                            </p>
                        </div>
                    </section>

                    {/* Account Termination */}
                    <section>
                        <h2 className="text-2xl font-bold text-gray-900 mb-4">
                            8. Chấm dứt tài khoản
                        </h2>
                        <div className="space-y-3 text-gray-700">
                            <p className="leading-relaxed">
                                <strong>8.1.</strong> Bạn có thể xóa tài khoản bất kỳ lúc nào thông qua trang cài đặt.
                            </p>
                            <p className="leading-relaxed">
                                <strong>8.2.</strong> Chúng tôi có quyền đình chỉ hoặc chấm dứt tài khoản của bạn nếu phát hiện vi phạm điều khoản dịch vụ.
                            </p>
                            <p className="leading-relaxed">
                                <strong>8.3.</strong> Sau khi tài khoản bị xóa, bạn sẽ mất quyền truy cập vào tất cả nội dung và tiến trình học tập.
                            </p>
                        </div>
                    </section>

                    {/* Changes to Terms */}
                    <section>
                        <h2 className="text-2xl font-bold text-gray-900 mb-4">
                            9. Thay đổi điều khoản
                        </h2>
                        <div className="space-y-3 text-gray-700">
                            <p className="leading-relaxed">
                                Chúng tôi có quyền cập nhật Điều khoản dịch vụ này bất kỳ lúc nào. Mọi thay đổi sẽ được thông báo qua email hoặc thông báo trên nền tảng. Việc bạn tiếp tục sử dụng dịch vụ sau khi có thay đổi đồng nghĩa với việc chấp nhận các điều khoản mới.
                            </p>
                        </div>
                    </section>

                    {/* Contact */}
                    <section className="bg-blue-50 -m-8 p-8 rounded-b-2xl">
                        <h2 className="text-2xl font-bold text-gray-900 mb-4">
                            10. Liên hệ
                        </h2>
                        <p className="text-gray-700 leading-relaxed">
                            Nếu bạn có bất kỳ câu hỏi nào về Điều khoản dịch vụ này, vui lòng liên hệ với chúng tôi qua:
                        </p>
                        <ul className="mt-3 space-y-2 text-gray-700">
                            <li><strong>Email:</strong> support@elearning.com</li>
                            <li><strong>Điện thoại:</strong> 1900-xxxx</li>
                            <li><strong>Địa chỉ:</strong> Hà Nội, Việt Nam</li>
                        </ul>
                    </section>
                </div>

                {/* Footer */}
                <div className="mt-6 text-center text-sm text-gray-600">
                    <p>
                        Bằng việc sử dụng E-Learning Platform, bạn xác nhận rằng đã đọc, hiểu và đồng ý với các điều khoản trên.
                    </p>
                </div>
            </div>
        </div>
    );
}
