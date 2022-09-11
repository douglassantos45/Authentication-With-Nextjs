import * as React from "react";
import { useAuthContext } from "../contexts/AuthContext";
import ReactLoading from "react-loading";

export default function Home() {
  const [inputs, setInputs] = React.useState({
    email: "diego@rocketseat.team",
    password: "123456",
    /*  email: "",
    password: "", */
  });

  const [isLoading, setIsloading] = React.useState(false);
  const [isError, setIsError] = React.useState(false);

  const { signIn } = useAuthContext();

  const handleChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const { name, value } = e.target;
    setInputs({ ...inputs, [name]: value });
    setIsError(false);
  };

  const handleSubmit = async (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault();
    const { email, password } = inputs;
    const data = {
      email,
      password,
    };
    setIsloading(!isLoading);
    try {
      await signIn(data);
    } catch (error) {
      setIsloading(false);
      setIsError(true);
    }
  };

  return (
    <div className="container" style={{ padding: "1rem" }}>
      <h1 style={{ textAlign: "center", marginBottom: "2rem" }}>Login</h1>
      <form
        onSubmit={handleSubmit}
        style={{
          padding: "3rem 2rem",
          maxWidth: "360px",

          backgroundColor: "var(--gray-800)",
          borderRadius: "0.7rem",
        }}
      >
        {isError && (
          <div
            style={{
              width: "100%",
              display: "flex",
              justifyContent: "center",
              marginBottom: "2rem",
              color: "var(--gray-100)",
              backgroundColor: "var(--red-background)",
              padding: "1.2rem",
              borderRadius: "0.4rem",
              border: "1px solid var(--red-600)",
            }}
          >
            Usuário ou Senha invalido
          </div>
        )}

        <div>
          <input
            name="email"
            type="email"
            placeholder="E-mail"
            value={inputs.email}
            onChange={handleChange}
            style={{ marginBottom: "1.2rem" }}
          />

          <label htmlFor="" style={{ position: "relative" }}>
            <input
              name="password"
              type="password"
              placeholder="Password"
              value={inputs.password}
              onChange={handleChange}
            />
          </label>
        </div>
        <button
          type="submit"
          style={{
            marginTop: "2.5rem",
            display: "flex",
            alignItems: "center",
            justifyContent: "center",
            fontWeight: "bold",
          }}
          disabled={!!!inputs.email || !!!inputs.password}
        >
          {isLoading ? (
            <ReactLoading
              type="spin"
              color="var(--gray-50)"
              height={30}
              width={30}
            />
          ) : (
            "ENVIAR"
          )}
        </button>
      </form>

      <p style={{ marginTop: "2rem", textAlign: "center", fontSize: "1.2rem" }}>
        Usuário Padrão: diego@rocketseat.team
        <br />
        Senha Padrão: 123456
      </p>
    </div>
  );
}
