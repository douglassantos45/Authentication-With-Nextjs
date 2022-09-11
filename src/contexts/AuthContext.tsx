import * as React from "react";
import { parseCookies, setCookie, destroyCookie } from "nookies";
import api from "../services/api";
import Router from "next/router";

type SignInCredentialsProps = {
  email: string;
  password: string;
};

type AuthContextDataProps = {
  signIn(credentials: SignInCredentialsProps): Promise<void>;
  isAuthenticated: boolean;
  user: UserProps;
};

type AuthProviderProps = {
  children: React.ReactNode; //Quando o component pode receber qualquer outra coisa dentro dele
};

type UserProps = {
  email: string;
  permissions: string[];
  roles: string[];
};

const AuthContext = React.createContext({} as AuthContextDataProps);

export const logOut = () => {
  destroyCookie(undefined, "nextauth.token");
  destroyCookie(undefined, "nextauth.refreshToken");

  Router.push("/");
};

export const AuthProvider = ({ children }: AuthProviderProps) => {
  const [user, setUser] = React.useState<UserProps>();
  const isAuthenticated = !!user;

  //quando o usuário acessar a aplicação apenas uma única vez
  React.useEffect(() => {
    const { "nextauth.token": token } = parseCookies();

    //Toda vez que o usuário der refresh minha aplicação busca os dados por meio do token e setamos o estado de user para recuperar algumas informações
    if (token) {
      api
        .get("/me")
        .then((res) => {
          const { email, permissions, roles } = res.data;

          setUser({ email, permissions, roles });
        })
        .catch(() => {
          logOut();
        });
    }
  }, []);

  //Types que retornam Promise sempre tem que ter um async
  const signIn = async ({ email, password }: SignInCredentialsProps) => {
    try {
      const response = await api.post("sessions", {
        email,
        password,
      });

      const { token, refreshToken, permissions, roles } = response.data;

      setCookie(undefined, "nextauth.token", token, {
        //Tempo para expirar
        maxAge: 60 * 60 * 24 * 30, //30 days
        path: "/", //quais caminhos vão ter acesso ao cookie e o / qualquer rota pode ter acesso
      }); //1 param - contexto da requisição(sempre undefined), 2 param - nome do cookie, 3 param - é o valor que você quer armazenar e 4 param - são opções para o cookie
      setCookie(undefined, "nextauth.refreshToken", refreshToken, {
        maxAge: 60 * 60 * 24 * 30,
        path: "/",
      });

      setUser({
        email,
        permissions,
        roles,
      });

      //Atualizando o cabeçalho com o token válido assim que o usuário realiza o login
      api.defaults.headers["Authorization"] = `Bearer ${token}`;

      Router.push("/dashboard");
    } catch (err) {
      console.log("erro ao fazer login", err);
      throw new Error(err);
    }
  };

  return (
    <AuthContext.Provider value={{ signIn, isAuthenticated, user }}>
      {children}
    </AuthContext.Provider>
  );
};

export const useAuthContext = () => {
  return React.useContext(AuthContext);
};
