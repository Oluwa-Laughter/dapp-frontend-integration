export default function StudentCard({ student }) {
  return (
    <article className="student-card">
      <div>
        <strong>{student.name}</strong>
        <span>{student.course}</span>
      </div>
      <div>
        <strong>{student.age}</strong>
        <span>years old</span>
      </div>
      <code>{student.address}</code>
    </article>
  );
}
