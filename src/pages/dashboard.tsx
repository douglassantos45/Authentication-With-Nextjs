import { useEffect } from "react";
import { logOut, useAuthContext } from "../contexts/AuthContext";
import api from "../services/api";

const Dashboard = () => {
  const { user } = useAuthContext();

  useEffect(() => {
    api
      .get("/me")
      .then((res) => console.log(res))
      .catch((error) => console.log(error));
  });

  return (
    <div>
      <h2
        style={{
          color: "var(--green-400)",
          textAlign: "center",
          marginBottom: "1rem",
        }}
      >
        Logado
      </h2>
      <p style={{ textAlign: "center" }}>
        <span style={{ fontWeight: "bold" }}>E-mail:</span> {user?.email}
      </p>
      <button style={{ marginTop: "1rem" }} onClick={logOut}>
        Sair
      </button>
    </div>
  );
};

export default Dashboard;
