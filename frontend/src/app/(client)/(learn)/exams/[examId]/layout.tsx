export default function ExamLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  // Layout riêng cho exam page - không có sidebar và header
  return <>{children}</>;
}


