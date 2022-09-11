import axios, { AxiosError } from "axios";
import { parseCookies, setCookie } from "nookies";
import { logOut } from "../contexts/AuthContext";

let cookies = parseCookies();
let isRefreshing = false; //Identifica se estou atualizando o token ou não
let failedRequestsQueue = [];

const api = axios.create({
  baseURL: "https://6xpq6h-3333.preview.csb.app/",
  //Setando os cookies no cabeçalho para todas as requisições
  headers: {
    "Content-Type": "application/json",
    Authorization: `Bearer ${cookies["nextauth.token"]}`, //Como o usuário ainda não fez login assim que a aplicação é carregada, mandamos um token undefined e depois modificamos assim que o usuário faz login na aplicação
  },
});

//Fazendo refreshToken para todas as chamadas da API
//Interceptando a responsta do backend
//Axios Interceptors - Recebe 2 funções - success end error
api.interceptors.response.use(
  (response) => {
    return response;
  },
  (error: AxiosError) => {
    if (error.response.status === 401) {
      // Verificando se o token está expirado
      if (error.response.data?.code === "token.expired") {
        //renovar o token
        cookies = parseCookies(); //Atualizando cookies
        const { "nextauth.refreshToken": refreshToken } = cookies;

        const originalConfig = error.config; //configuranção com todas as informações para repetir as requisições

        //Faz o refreshToken apenas quando o token está expirado para depois fazer as requisições que dependem do token
        if (!isRefreshing) {
          isRefreshing = true;

          api
            .post("/refresh", {
              refreshToken,
            })
            .then((res) => {
              const { token } = res.data;

              setCookie(undefined, "nextauth.token", token, {
                maxAge: 60 * 60 * 24 * 30, //30 days
                path: "/",
              });

              setCookie(
                undefined,
                "nextauth.refreshToken",
                res.data.refreshToken,
                {
                  maxAge: 60 * 60 * 24 * 30, //30 days
                  path: "/",
                }
              );

              //atualizando o header com o novo token válido
              api.defaults.headers["Authorization"] = `Bearer ${token}`;

              //pegando as requisições que deram falha e repassando novo token para cada uma
              failedRequestsQueue.forEach((req) => req.onSuccess(token));
              failedRequestsQueue = [];
            })
            .catch((error) => {
              failedRequestsQueue.forEach((req) => req.onFailure(error));
              failedRequestsQueue = [];
            })
            .finally(() => (isRefreshing = false));
        }

        //aguardando o token ser atualizado para depois fazer as outras requisições
        return new Promise((resolve, reject) => {
          failedRequestsQueue.push({
            onSuccess: (newToken: string) => {
              //refazendo a requisição
              originalConfig.headers["Authorization"] = `Bearer ${newToken}`;

              resolve(api(originalConfig)); //fazendo novamente uma chamada para api com o novo token
            },
            onFailure: (error: AxiosError) => {
              reject(error);
            },
          });
        });
      } else {
        //deslogar o usuário
        logOut();
      }
    }
    return Promise.reject(error);
  }
);

export default api;
