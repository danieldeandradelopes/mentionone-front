import "./globals.css";
import LayoutWrapper from "@/components/LayoutWrapper";
import { Providers } from "@/providers/Providers";

export const metadata = {
  title: "Meu App",
  icons: {
    icon: [
      { url: "/favicon.svg?v=2", type: "image/svg+xml" },
      { url: "/favicon.svg?v=2", sizes: "any" },
    ],
    shortcut: ["/favicon.svg?v=2"],
  },
};

export default function RootLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <html lang="pt-BR">
      <head>
        <link rel="icon" type="image/svg+xml" href="/favicon.svg?v=2" />
        <link rel="icon" href="/favicon.svg?v=2" sizes="any" />
        <link rel="shortcut icon" href="/favicon.svg?v=2" />
      </head>
      <body>
        <Providers>
          <LayoutWrapper>{children}</LayoutWrapper>
        </Providers>
      </body>
    </html>
  );
}
