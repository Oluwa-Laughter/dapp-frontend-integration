import { useState } from "react";

export default function RegistrationForm({ loading, onRegister }) {
  const [form, setForm] = useState({ name: "", age: "", course: "" });

  const submit = async (event) => {
    event.preventDefault();
    const registered = await onRegister(form);
    if (registered) setForm({ name: "", age: "", course: "" });
  };

  return (
    <form className="panel" onSubmit={submit}>
      <div className="panel-heading">
        <span className="step">01</span>
        <div>
          <h2>Register student</h2>
          <p>Saved from your connected wallet.</p>
        </div>
      </div>
      <label>
        Name
        <input
          value={form.name}
          onChange={(event) => setForm({ ...form, name: event.target.value })}
        />
      </label>
      <label>
        Age
        <input
          type="number"
          min="1"
          value={form.age}
          onChange={(event) => setForm({ ...form, age: event.target.value })}
        />
      </label>
      <label>
        Course
        <input
          value={form.course}
          onChange={(event) => setForm({ ...form, course: event.target.value })}
        />
      </label>
      <button type="submit" disabled={loading}>
        {loading ? "Confirming..." : "Register onchain"}
      </button>
    </form>
  );
}
