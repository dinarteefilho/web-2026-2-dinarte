import { StrictMode } from 'react'
import { createRoot } from 'react-dom/client'
import { Amplify } from 'aws-amplify'
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
    <App />
  </StrictMode>,
)