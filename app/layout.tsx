import "./globals.css";
import LayoutWrapper from "@/components/LayoutWrapper";
import { Providers } from "@/providers/Providers";

export const metadata = {
  title: "Meu App",
};

export default function RootLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <html lang="pt-BR">
      <head>
        <link rel="icon" type="image/svg+xml" href="/favicon.svg" />
      </head>
      <body>
        <Providers>
          <LayoutWrapper>{children}</LayoutWrapper>
        </Providers>
      </body>
    </html>
  );
}
