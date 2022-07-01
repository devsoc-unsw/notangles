import React, { useState } from 'react';
import OAuth2Login from 'react-simple-oauth2-login';

export default function AuthorizationCodeExample() {
  const [user, setUser] = useState(null);
  const [error, setError] = useState(null);

  const onSuccess = ({ code }) =>
    fetch(`http://localhost:3001/auth/token`, {
      method: 'POST',
      body: JSON.stringify({ code }),
      headers: {
        'content-type': 'application/json',
      },
    })
      .then((res) => res.json())
      .then((data) => {
        setUser(data);
      })
      .catch(setError);

  return (
    <div className="column">
      {error && <p>{error}</p>}
      <OAuth2Login
        id="auth-code-login-btn"
        authorizationUrl={'https://accounts.google.com/o/oauth2/auth'}
        clientId={'255102332142-ubcqeee66fs66mibr62o4eaouf2rjcjl.apps.googleusercontent.com'}
        redirectUri={'http://localhost:3000/'}
        responseType="code"
        scope={'openid email'}
        buttonText="Auth code login"
        onSuccess={onSuccess}
        onFailure={setError}
      />
      {user && (
        <div>
          <h3>User data</h3>
          <p>Obtained from token-protected API</p>
          <p>
            {user.name} {user.email}
          </p>
        </div>
      )}
    </div>
  );
}
