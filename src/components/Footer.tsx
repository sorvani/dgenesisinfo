import Link from "next/link";

export function Footer() {
  return (
    <footer className="footer">
      <div className="container">
        <p className="footer-text">
          Design &copy; {new Date().getFullYear()} J. Busch | All source data
          copyright of the original rights holders{" "}
          <Link href="/credits">listed here</Link>.
        </p>
      </div>
    </footer>
  );
}
