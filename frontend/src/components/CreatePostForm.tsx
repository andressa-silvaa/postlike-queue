import { useState, type FormEvent } from "react";

type CreatePostFormProps = {
  onSubmit: (title: string, content: string) => Promise<void>;
  loading: boolean;
};

export function CreatePostForm({ onSubmit, loading }: CreatePostFormProps) {
  const [title, setTitle] = useState("");
  const [content, setContent] = useState("");
  const [errorMessage, setErrorMessage] = useState("");

  async function handleSubmit(event: FormEvent<HTMLFormElement>) {
    event.preventDefault();

    if (!title.trim() || !content.trim()) {
      setErrorMessage("Preencha título e conteúdo para criar o post.");
      return;
    }

    setErrorMessage("");
    await onSubmit(title.trim(), content.trim());
    setTitle("");
    setContent("");
  }

  return (
    <section className="panel">
      <div className="panel-header">
        <h2>Criar post</h2>
        <span className="muted">Fluxo simples para demonstração</span>
      </div>

      <form className="create-post-form" onSubmit={handleSubmit}>
        <label className="field">
          <span>Título</span>
          <input
            type="text"
            value={title}
            onChange={(event) => {
              setTitle(event.target.value);
              if (errorMessage) setErrorMessage("");
            }}
            placeholder="Ex.: Novo post de teste"
            disabled={loading}
          />
        </label>

        <label className="field">
          <span>Conteúdo</span>
          <textarea
            value={content}
            onChange={(event) => {
              setContent(event.target.value);
              if (errorMessage) setErrorMessage("");
            }}
            placeholder="Escreva um conteúdo curto para o post."
            disabled={loading}
            rows={4}
          />
        </label>

        {errorMessage ? <small className="field-error">{errorMessage}</small> : null}

        <button type="submit" disabled={loading}>
          {loading ? "Criando..." : "Criar post"}
        </button>
      </form>
    </section>
  );
}
