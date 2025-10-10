"use client";

import { useEffect, useMemo, useState } from "react";

type Profile = {
  displayName: string;
  email: string;
  phoneNumber: string;
  birthday: string; // yyyy-mm-dd
};

export default function ProfilePage() {
  // Trạng thái form (để trống, sẽ bind dữ liệu từ API)
  const [displayName, setDisplayName] = useState<string>("");
  const [email, setEmail] = useState<string>("");
  const [phoneNumber, setPhoneNumber] = useState<string>("");
  const [birthday, setBirthday] = useState<string>("");

  // Trạng thái UI
  const [loading, setLoading] = useState<boolean>(true);      // tải dữ liệu ban đầu
  const [saving, setSaving] = useState<boolean>(false);       // đang lưu
  const [error, setError] = useState<string>("");             // lỗi hiển thị đơn giản
  const [success, setSuccess] = useState<string>("");         // thông báo thành công

  // Ký tự đầu cho avatar
  const avatarInitial = useMemo(() => {
    const c = (displayName || email || "t").trim()[0];
    return (c || "t").toLowerCase();
    }, [displayName, email]);

  // Helper: gộp state về object Profile
  const getProfilePayload = (): Profile => ({
    displayName: displayName?.trim() ?? "",
    email: email?.trim() ?? "",
    phoneNumber: phoneNumber?.trim() ?? "",
    birthday: birthday ?? "",
  });
  // Tải dữ liệu hồ sơ từ API khi vào trang
  useEffect(() => {
    let isMounted = true;

    async function loadProfile() {
      try {
        setLoading(true);
        setError("");
        setSuccess("");

        // Gọi API GET profile
        const res = await fetch("/api/profile", {     //nơi để link api
          method: "GET",
          credentials: "include",               // nếu backend dùng cookie/session
          headers: {
            "Accept": "application/json",
          },
        });

        if (!res.ok) {
          throw new Error(`GET /api/profile failed: ${res.status}`);
        }

        const data: Partial<Profile> = await res.json();

        if (!isMounted) return;
        // Map dữ liệu vào state (có fallback rỗng)
        setDisplayName(data.displayName ?? "");
        setEmail(data.email ?? "");
        setPhoneNumber(data.phoneNumber ?? "");
        // Đảm bảo input type="date" nhận format yyyy-mm-dd
        setBirthday((data.birthday ?? "").slice(0, 10));
      } catch (e: any) {
        if (!isMounted) return;
        setError(e?.message || "Không thể tải thông tin hồ sơ.");
      } finally {
        if (isMounted) setLoading(false);
      }
    }
    loadProfile();
    return () => {
      isMounted = false;
    };
  }, []);

  // Lưu thay đổi về API
  async function handleSave() {
    try {
      setSaving(true);
      setError("");
      setSuccess("");

      const payload = getProfilePayload();

      const res = await fetch("/api/profile", {
        method: "PUT",
        credentials: "include",
        headers: {
          "Content-Type": "application/json",
          "Accept": "application/json",
        },
        body: JSON.stringify(payload),
      });

      if (!res.ok) {
        // backend nên trả JSON có message; nếu không có, hiển thị mã lỗi
        let message = `PUT /api/profile failed: ${res.status}`;
        try {
          const errJson = await res.json();
          if (errJson?.message) message = errJson.message;
        } catch {}
        throw new Error(message);
      }
       setSuccess("Cập nhật hồ sơ thành công.");
    } catch (e: any) {
      setError(e?.message || "Không thể cập nhật hồ sơ.");
    } finally {
      setSaving(false);
    }
  }
   return (
    // Nền xám nhạt cho toàn trang
    <main className="min-h-screen bg-[#f7f7f8]">
      {/* Header của trang hồ sơ */}
      <header className="flex items-center justify-between px-6 py-6 md:px-10">
        <div className="text-[28px] font-semibold tracking-tight">User profile</div>

        {/* Khu vực bên phải: ngôn ngữ + avatar (minh họa) */}
        <div className="flex items-center gap-4">
          <div className="hidden md:flex items-center gap-2 text-sm text-gray-600">
            <span className="font-medium">Site language:</span>
            <div className="flex items-center gap-1 rounded-md border bg-white px-2 py-1">
              <span role="img" aria-label="flag">🇬🇧</span>
              <span className="text-gray-700">EN</span>
            </div>
          </div>
          <div className="grid h-10 w-10 place-items-center rounded-full bg-green-800 text-white text-lg">
            {avatarInitial}
          </div>
        </div>
      </header>
      
      {/* Vùng nội dung chính */}
      <section className="mx-auto max-w-[1240px] px-6 pb-16 md:px-10">
        {/* Thông báo lỗi/thành công đơn giản */}
        {(error || success) && (
          <div className="mb-4">
            {error && (
              <div className="rounded-md border border-red-200 bg-red-50 px-4 py-3 text-sm text-red-700">
                {error}
              </div>
            )}
            {success && (
              <div className="rounded-md border border-green-200 bg-green-50 px-4 py-3 text-sm text-green-700">
                {success}
              </div>
            )}
          </div>
        )}
        {/* Hiển thị skeleton đơn giản khi loading */}
        {loading ? (
          <div className="grid gap-6 md:grid-cols-[360px,1fr]">
            <div className="h-80 animate-pulse rounded-2xl bg-gray-200" />
            <div className="space-y-6">
              <div className="h-72 animate-pulse rounded-2xl bg-gray-200" />
              <div className="h-36 animate-pulse rounded-2xl bg-gray-200" />
            </div>
          </div>
        ) : (
          <div className="grid gap-6 md:grid-cols-[360px,1fr]">
            {/* Cột trái: avatar + thông tin upload + nút xóa user */}
            <aside className="rounded-2xl border border-gray-200 bg-white p-6 shadow-sm">
              <div className="flex flex-col items-center">
                {/* Vòng tròn avatar (kí tự đầu) */}
                <div className="relative h-40 w-40 overflow-hidden rounded-full bg-green-800 text-white grid place-items-center text-7xl">
                  {avatarInitial}
                </div>

                {/* Hướng dẫn loại file/giới hạn dung lượng */}
                <p className="mt-5 text-center text-sm leading-5 text-gray-500">
                  Allowed *.jpeg, *.jpg, *.png, *.gif
                  <br />
                  Max size of 2 MB
                </p>

                {/* Nút xóa tài khoản (demo) */}
                <button
                  type="button"
                  className="mt-6 rounded-md bg-red-500 px-4 py-2 text-white transition-colors hover:bg-red-600"
                  onClick={() => alert("Delete user action")}
                >
                  Delete User
                </button>
              </div>
            </aside>

            {/* Cột phải: các khối form */}
            <div className="space-y-6">
              {/* Khối: Thông tin cá nhân */}
              <div className="rounded-2xl border border-gray-200 bg-white p-6 shadow-sm">
                <div className="mb-6 flex items-center justify-between">
                  <h2 className="text-[20px] font-semibold">Personal information</h2>
                  <button
                  type="button"
                    className="rounded-md bg-blue-600 px-4 py-2 text-white transition-colors hover:bg-blue-700 disabled:opacity-60"
                    onClick={handleSave}
                    disabled={saving}
                  >
                    {saving ? "Saving..." : "Save changes"}
                  </button>
                </div>

                <div className="space-y-5">
                  {/* Tên hiển thị */}
                  <div>
                    <label className="mb-1 block text-sm font-medium text-gray-800">
                      Display Name
                    </label>
                    <input
                      className="w-full rounded-md border border-gray-300 bg-white p-3 outline-none transition-shadow focus:ring-2 focus:ring-blue-500"
                      value={displayName}
                      onChange={(e) => setDisplayName(e.target.value)}
                      placeholder="Your name"
                    />
                  </div>

                  {/* Email tài khoản */}
                  <div>
                    <label className="mb-1 block text-sm font-medium text-gray-800">
                      Account/Email
                    </label>
                    <input
                      className="w-full rounded-md border border-gray-300 bg-white p-3 outline-none transition-shadow focus:ring-2 focus:ring-blue-500"
                      value={email}
                      onChange={(e) => setEmail(e.target.value)}
                      placeholder="name@example.com"
                      inputMode="email"
                    />
                  </div>

                  {/* Số điện thoại */}
                  <div>
                    <label className="mb-1 block text-sm font-medium text-gray-800">
                      Phone number
                    </label>
                    <input
                      className="w-full rounded-md border border-gray-300 bg-white p-3 outline-none transition-shadow focus:ring-2 focus:ring-blue-500"
                      value={phoneNumber}
                      onChange={(e) => setPhoneNumber(e.target.value)}
                      placeholder="0123456789"
                      inputMode="tel"
                    />
                  </div>

                  {/* Ngày sinh */}
                  <div>
                    <label className="mb-1 block text-sm font-medium text-gray-800">
                      Birthday
                    </label>
                    <div className="relative">
                      <input
                        type="date"
                        className="w-full rounded-md border border-gray-300 bg-white p-3 pr-10 outline-none transition-shadow focus:ring-2 focus:ring-blue-500"
                        value={birthday}
                        onChange={(e) => setBirthday(e.target.value)}
                      />
                      {/* Icon lịch minh họa */}
                      <span className="pointer-events-none absolute inset-y-0 right-3 grid place-items-center text-gray-400">
                        📅
                      </span>
                    </div>
                  </div>
                </div>
              </div>

              {/* Khối: Mật khẩu */}
              <div className="rounded-2xl border border-gray-200 bg-white p-6 shadow-sm">
                <h2 className="text-[20px] font-semibold">Password</h2>
                <div className="mt-4">
                  <button
                    type="button"
                    className="rounded-md bg-blue-600 px-4 py-2 text-white transition-colors hover:bg-blue-700"
                    onClick={() => alert("Open password update flow")}
                  >
                    Update password
                  </button>
                </div>
              </div>
            </div>
          </div>
        )}
      </section>
    </main>
  );
}