// App.js
import { BrowserRouter as Router } from 'react-router-dom';
import { AuthProvider } from './contexts/AuthContext';
import { SubscriptionProvider } from './contexts/SubscriptionContext';
import RoutesV2 from './routes/RoutesV2';
import Layout from './components/layout/Layout';
import './App.css';

function App() {
  return (
    <Router>
      <AuthProvider>
        <SubscriptionProvider>
          <div className="App">
            <Layout>
              <RoutesV2 />
            </Layout>
          </div>
        </SubscriptionProvider>
      </AuthProvider>
    </Router>
  );
}

export default App;
