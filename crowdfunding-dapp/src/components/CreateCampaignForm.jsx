import { useState } from "react";

export default function CreateCampaignForm({ loading, onCreate }) {
  const [form, setForm] = useState({
    target: "",
    deadline: "",
    token: "",
    amounts: "",
    statuses: "",
  });
  const update = (key, value) =>
    setForm((current) => ({ ...current, [key]: value }));
  const submit = async (event) => {
    event.preventDefault();
    const created = await onCreate(form);
    if (created)
      setForm({
        target: "",
        deadline: "",
        token: "",
        amounts: "",
        statuses: "",
      });
  };

  return (
    <form className="panel" onSubmit={submit}>
      <p className="eyebrow">Create</p>
      <h2>Start a campaign</h2>
      <p className="muted">
        Amounts are raw token units. Milestone status values come from your
        Solidity enum.
      </p>
      <input
        placeholder="target amount"
        value={form.target}
        onChange={(event) => update("target", event.target.value)}
      />
      <input
        type="datetime-local"
        value={form.deadline}
        onChange={(event) => update("deadline", event.target.value)}
      />
      <input
        placeholder="accepted token address"
        value={form.token}
        onChange={(event) => update("token", event.target.value)}
      />
      <input
        placeholder="milestone amounts: 100,200"
        value={form.amounts}
        onChange={(event) => update("amounts", event.target.value)}
      />
      <input
        placeholder="milestone statuses: 0,0"
        value={form.statuses}
        onChange={(event) => update("statuses", event.target.value)}
      />
      <button type="submit" disabled={loading}>
        {loading ? "Confirming..." : "Create campaign"}
      </button>
    </form>
  );
}
