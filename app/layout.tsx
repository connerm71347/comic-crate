"use client";
import { AuthProvider } from "@/contexts/AuthContext";
import "./globals.css";
import styles from "./layout.module.css";
import Header from "@/components/Header";

export default function RootLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <html lang="en">
      <body className={styles.rootLayout}>
        <AuthProvider>
          <Header /> {/* client header with modal trigger */}
          <main>{children}</main>
          <footer>
            <p>&copy; 2025 ComicCrate. All rights reserved.</p>
          </footer>
        </AuthProvider>
      </body>
    </html>
  );
}
