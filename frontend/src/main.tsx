import { StrictMode } from 'react'
import { createRoot } from 'react-dom/client'
import { Amplify } from 'aws-amplify'
import { GoogleOAuthProvider } from '@react-oauth/google'
import './index.css'
import App from './App.tsx'

Amplify.configure({
  Auth: {
    Cognito: {
      userPoolId: 'us-east-1_CTuLDkuR5',
      userPoolClientId: '2egeffsvboq4oo8b5o1ke53gn1',
    }
  }
});

createRoot(document.getElementById('root')!).render(
  <StrictMode>
    {/* 2. Envolver a App com o GoogleOAuthProvider para o botão funcionar */}
    <GoogleOAuthProvider clientId="31969959440-88teelbr46drud6vkgjjvvh3egi9bd95.apps.googleusercontent.com">
      <App />
    </GoogleOAuthProvider>
  </StrictMode>,
)