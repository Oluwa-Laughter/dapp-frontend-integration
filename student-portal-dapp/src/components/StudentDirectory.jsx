import { useState } from "react";
import StudentCard from "./StudentCard";

export default function StudentDirectory({
  account,
  loading,
  onFetch,
  students,
}) {
  const [addressText, setAddressText] = useState(account);

  const fetchStudents = () => {
    onFetch(addressText.split(/[\s,]+/).filter(Boolean));
  };

  return (
    <section className="panel directory">
      <div className="panel-heading">
        <span className="step">03</span>
        <div>
          <h2>Student directory</h2>
          <p>Multicall2 reads the addresses you provide.</p>
        </div>
      </div>
      <textarea
        value={addressText}
        onChange={(event) => setAddressText(event.target.value)}
        placeholder="Paste student addresses, one per line"
      />
      <button type="button" onClick={fetchStudents} disabled={loading}>
        {loading ? "Reading students..." : "Fetch student details"}
      </button>
      <div className="student-list">
        {students.map((student) => (
          <StudentCard key={student.address} student={student} />
        ))}
        {!loading && students.length === 0 && (
          <p className="empty">No registered students found.</p>
        )}
      </div>
    </section>
  );
}
