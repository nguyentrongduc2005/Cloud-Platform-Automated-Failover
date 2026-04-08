  import React from "react";
import avatar from "../../assets/logo.png";

export default function LecturerCard() {
  return (
    <div className="card side">
      <h3 className="side-title">Giảng viên</h3>
      <div className="lecturer">
        <img className="lecturer-avatar" src={avatar} alt="Lecturer" />
        <div>
          <div className="lecturer-name">TS. Trần Minh Quân</div>
          <div className="muted">Giảng viên Khoa CNTT</div>
        </div>
      </div>
      <div className="lecturer-meta">
        <div className="meta-row">
          <span className="meta-icon">✉️</span>
          <a href="mailto:minhquan@ut.edu.vn">minhquan@ut.edu.vn</a>
        </div>
        <div className="meta-row">
          <span className="meta-icon">📗</span>
          <span>4 khóa học</span>
          <span className="dot" />
          <span>8,900 SV</span>
        </div>
      </div>
    </div>
  );
}
