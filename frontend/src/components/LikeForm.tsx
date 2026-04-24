import { useState, type FormEvent } from "react";

type LikeFormProps = {
  onSubmit: (userId: string) => Promise<void>;
  loading: boolean;
};

export function LikeForm({ onSubmit, loading }: LikeFormProps) {
  const [userId, setUserId] = useState("");
  const [errorMessage, setErrorMessage] = useState("");

  async function handleSubmit(event: FormEvent<HTMLFormElement>) {
    event.preventDefault();

    if (!userId.trim()) {
      setErrorMessage("Informe um identificador de usuário para enviar a curtida.");
      return;
    }

    setErrorMessage("");
    await onSubmit(userId.trim());
  }

  return (
    <form className="like-form" onSubmit={handleSubmit}>
      <label className="field">
        <span>Identificador do usuário</span>
        <input
          type="text"
          value={userId}
          onChange={(event) => {
            setUserId(event.target.value);

            if (errorMessage) {
              setErrorMessage("");
            }
          }}
          placeholder="ex.: usuario-123"
          disabled={loading}
        />
        <small className="field-help">Use qualquer texto único por pessoa, por exemplo: usuario-123.</small>
        {errorMessage ? <small className="field-error">{errorMessage}</small> : null}
      </label>

      <button type="submit" disabled={loading}>
        {loading ? "Enviando curtida..." : "Curtir post"}
      </button>
    </form>
  );
}
