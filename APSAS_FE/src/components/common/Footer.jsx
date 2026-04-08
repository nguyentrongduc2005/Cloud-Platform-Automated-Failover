import React from "react";

export default function Footer() {
  return (
    <footer className="app-footer">
      <div className="container footer-row">
        <div>Copyright © {new Date().getFullYear()} APSAS</div>
        <nav>
          <a href="#">Help Center</a>
          <a href="#">Jobs</a>
          <a href="#">Blog</a>
          <a href="#">Terms</a>
          <a href="#">Privacy Policy</a>
        </nav>
      </div>
    </footer>
  );
}
