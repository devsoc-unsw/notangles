import { useState } from 'react';
import './App.css';
import { useEffect } from 'react';

const buildURL = () => {
  const url = new URL('https://accounts.google.com/o/oauth2/v2/auth');
  const params = new URLSearchParams('');
  params.set('response_type', 'code');
  params.set('client_id', '255102332142-ubcqeee66fs66mibr62o4eaouf2rjcjl.apps.googleusercontent.com');
  params.set('scope', 'openid email');
  params.set('redirect_uri', 'http://localhost:3000');
  params.set('state', '12345');

  url.search = params.toString();
  return url.toString();
};

function App() {
  const [authCode, setAuthCode] = useState(null);
  const [state, setState] = useState(null);
  const [response, setResponse] = useState(null);

  const [loading, setLoading] = useState(false);

  // Populate the state and auth code from the URL if they are there
  useEffect(() => {
    const url = new URL(window.location.href);
    const params = new URLSearchParams(url.search);
    const code = params.get('code');
    const state = params.get('state');

    if (code) {
      setAuthCode(code);
    }

    if (state) {
      setState(state);
    }
  }, []);

  const handleClick = async () => {
    setLoading(true);
    fetch(`/auth/token?code=${authCode}&state=${state}`)
      .then((res) => res.json())
      .then((data) => {
        setResponse(data);
        setLoading(false);
      })
      .catch((err) => {
        setResponse(err);
        setLoading(false);
      });
  };

  return (
    <div className="App">
      <main className="App-header">
        {!!loading ? (
          <div className="App-logo">Loading...</div>
        ) : (
          <img src={'/public/floosh.png'} className="App-logo" alt="logo" />
        )}
        <section className="authentication">
          <div>
            <a className="App-link" href={buildURL()}>
              Authenticate with Google
            </a>
          </div>
          <div className="results">
            <label htmlFor="authCode">Auth code: </label>
            <input type="text" name="authCode" value={authCode} disabled />
            <label htmlFor="state">State: </label>
            <input type="text" name="state" value={state} disabled />
          </div>
        </section>
        <section className="authorization">
          <div className="results">
            <a className="App-link" onClick={handleClick}>
              Authorize with Notangles API
            </a>
          </div>
          <div className="results">
            <label htmlFor="response">Response: </label>
            <textarea name="response" disabled>
              {response}
            </textarea>
          </div>
        </section>
      </main>
    </div>
  );
}

export default App;
