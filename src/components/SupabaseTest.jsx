import { useState, useEffect } from 'react';
import { supabase } from '../lib/supabase';

export default function SupabaseTest() {
  const [status, setStatus] = useState('Testing connection...');
  const [connected, setConnected] = useState(false);

  useEffect(() => {
    testConnection();
  }, []);

  const testConnection = async () => {
    try {
      // Test connection by checking auth status
      const { data: { session }, error } = await supabase.auth.getSession();
      
      if (error) {
        setStatus(`❌ Connection failed: ${error.message}`);
        setConnected(false);
      } else {
        setStatus('✅ Supabase connected successfully!');
        setConnected(true);
      }
    } catch (error) {
      setStatus(`❌ Connection error: ${error.message}`);
      setConnected(false);
    }
  };

  return (
    <div style={{
      padding: '20px',
      margin: '20px',
      border: `2px solid ${connected ? '#10b981' : '#ef4444'}`,
      borderRadius: '8px',
      backgroundColor: connected ? '#d1fae5' : '#fee2e2'
    }}>
      <h3>Supabase Connection Test</h3>
      <p>{status}</p>
      <button 
        onClick={testConnection}
        style={{
          padding: '8px 16px',
          backgroundColor: '#3b82f6',
          color: 'white',
          border: 'none',
          borderRadius: '4px',
          cursor: 'pointer'
        }}
      >
        Test Again
      </button>
    </div>
  );
}
