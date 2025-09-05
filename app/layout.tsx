export const metadata = { title: "AI Figure Generator" };

export default function RootLayout({ children }: { children: React.ReactNode }) {
  return (
    <html lang="vi">
      <body style={{ margin: 0, background: "#0b0d10", color: "#e8e9ea" }}>
        {children}
      </body>
    </html>
  );
}
