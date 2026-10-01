import StudentCard from "./StudentCard";

export default function StudentDetails({ student }) {
  return (
    <section className="panel">
      <div className="panel-heading">
        <span className="step">02</span>
        <div>
          <h2>Your details</h2>
          <p>Read from the registration contract.</p>
        </div>
      </div>
      {student ? (
        <StudentCard student={student} />
      ) : (
        <p className="empty">Fetch your address to view your details.</p>
      )}
    </section>
  );
}
