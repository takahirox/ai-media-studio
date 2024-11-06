import { Navigate, Route, Routes } from "react-router-dom";
import { ContentSelectDialog } from "./Commons/ContentSelectDialog";
import { LoginRequired } from "./Commons/LoginRequired";
import { Gallery } from "./Pages/Gallery";
import { Home } from "./Pages/Home";
import { MyContent } from "./Pages/MyContent";
import { NodeEditor } from "./NodeEditor";
import { Tools } from "./Tools/Tool";
import { ToolPage } from "./Tools/ToolPage";
import { useLogin } from "./Use/useLogin";

export const App = (): JSX.Element => {
  return (
    <>
      <Routes>
        <Route
          element={(
            <LoginRequired>
              <Home />
            </LoginRequired>
          )}
          key='Home'
          path='/'
        />
        <Route
          element={(
            <LoginRequired>
              <MyContent />
            </LoginRequired>
          )}
          key='MyContent'
          path='/my_content/:uuid?'
        />
        <Route
          element={(
            <LoginRequired>
              <Gallery />
            </LoginRequired>
          )}
          key='Gallery'
          path='/my_contents'
        />
        {
          Tools.map((tool) => {
            return (
              <Route
                element={(
                  <LoginRequired>
                    <ToolPage
                      key={`${tool.name}`}              
                      tool={tool}
                    />
                  </LoginRequired>
                )}
                key={`${tool.name}`}              
                path={`${tool.path}/:uuid?`}
              />
            );
          })
        }
        <Route
          element={(
            <LoginRequired>
              <NodeEditor />
            </LoginRequired>
          )}
          key='NodeEditor'
          path='/node'
        />
        <Route
          element=<Login />
          key='Auth'
          path='/auth0'
        />
        <Route
          element=<Logout />
          key='Logout'
          path='/logout'
        />
      </Routes>
      <ContentSelectDialog />
    </>
  );
};

// TODO: Fix me
const Login = (): JSX.Element => {
  const { isLoading } = useLogin();
  
  if (isLoading) {
    return <span>Logging in...</span>;
  }

  return <Navigate to='/' replace />;
};

// TODO: Fix me
const Logout = (): JSX.Element => {
  const { logout } = useLogin();
  logout();
  return <span>Logging out...</span>;
};
