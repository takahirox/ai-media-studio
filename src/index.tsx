import { RefObject, StrictMode } from "react";
import { createRoot } from "react-dom/client";
import { BrowserRouter } from "react-router-dom";
import { RecoilRoot } from "recoil";
import { Auth0Provider } from "@auth0/auth0-react";
import '@google/model-viewer'
import { App } from "./App";
import { AUTH0_AUDIENCE, AUTH0_CLIENT_ID, AUTH0_DOMAIN } from "./constants";
import './index.css';

import "./Processors/Dispatcher";

// TODO: Move to somewhere better place
declare global {
  // eslint-disable-next-line @typescript-eslint/no-namespace
  namespace JSX {
    interface IntrinsicElements {
      'model-viewer': ModelViewerAttributes;
    }
    interface ModelViewerAttributes {
      // Add more attributes when needed
      ref?: RefObject<HTMLElement>;
      ar?: boolean;
      'auto-rotate'?: boolean;
      'camera-controls'?: boolean;
      class?: string;
      loading?: string;
      'max-camera-orbit'?: string;
      onClick?: () => void;
      orientation?: string;
      'rotation-per-second'?: string;
      src?: string;
      style?: any;
    }
  }
}

const root = document.createElement('div');
document.body.appendChild(root);

createRoot(root).render(
  <StrictMode>
    <RecoilRoot>
      <Auth0Provider
        clientId={AUTH0_CLIENT_ID}
        domain={AUTH0_DOMAIN}
        authorizationParams={{
          audience: AUTH0_AUDIENCE,
          redirect_uri: window.location.origin + '/auth0',
        }}
        cacheLocation="localstorage"
        useRefreshTokens
      >
        <BrowserRouter>
          <App />
        </BrowserRouter>
      </Auth0Provider>
    </RecoilRoot>
  </StrictMode>
);
