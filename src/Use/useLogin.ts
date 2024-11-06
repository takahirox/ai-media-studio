import { useCallback, useEffect, useState } from "react";
import { IdToken, useAuth0 } from "@auth0/auth0-react";
import { AUTH0_AUDIENCE } from "../constants";

export const useLogin = () => {
  const { getIdTokenClaims, isAuthenticated, isLoading, logout } = useAuth0();
  const [idToken, setIdToken] = useState<IdToken | undefined>(undefined);
  const { loginWithRedirect } = useAuth0();

  useEffect(() => {
    if (!isAuthenticated) return;
    let isCancelled = false;

    (async () => {
      try {
        const idTokenClaims = await getIdTokenClaims();
        if (!isCancelled) setIdToken(idTokenClaims);
      } catch (error) {
        // TODO: Proper error handling
        console.error("[useIdToken]: Failed to acquire token", error);
      }
    })();

    return () => {
      isCancelled = true;
    };
  }, [getIdTokenClaims, isAuthenticated]);

  const login = useCallback(
    () =>
      loginWithRedirect({
        appState: { target: window.location.pathname },
        authorizationParams: {
          audience: AUTH0_AUDIENCE,
        },
      }),
    [loginWithRedirect]
  );

  const logoutCallback = useCallback(
    () => {
      logout({ logoutParams: { returnTo: window.location.origin }});
    },
    [logout]
  );

  return {
    idToken,
    isLoading,
    login,
    logout: logoutCallback
  };
};
