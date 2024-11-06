import { useLogin } from "../Use/useLogin";

export const LoginRequired = ({
  children
}: {
  children: JSX.Element | JSX.Element[]
}): JSX.Element => {
  const { idToken, login } = useLogin();

  // Disable authentication for now
  // TODO: Fix me
  if (true || idToken) {
    return (
      <>
        {children}
      </>
    );
  }

  return (
    <button
      className='btn btn-primary'
      onClick={() => {
        login();
      }}
    >
      Login
    </button>
  );
};
