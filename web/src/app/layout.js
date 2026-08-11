import "./globals.css";
import SmoothScroll from "@/components/SmoothScroll";
import CustomCursor from "@/components/CustomCursor";

export const metadata = {
  title: "Sproutt | Growing Tomorrow Starts Today",
  description: "We are Gen Z building a better future for Gen Alpha through creativity, technology, and sustainability.",
};

export default function RootLayout({ children }) {
  return (
    <html lang="en">
      <body>
        <SmoothScroll>{children}</SmoothScroll>
        <CustomCursor />
      </body>
    </html>
  );
}
