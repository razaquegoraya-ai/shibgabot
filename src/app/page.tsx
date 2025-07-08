'use client';
import React, { useEffect, useState } from 'react';

interface Business {
  [key: string]: string;
}

interface MediaFile {
  id: string;
  name: string;
  mimeType: string;
  webViewLink: string;
  webContentLink: string;
}

const Home: React.FC = () => {
  const [businesses, setBusinesses] = useState<Business[]>([]);
  const [media, setMedia] = useState<MediaFile[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [rowStatus, setRowStatus] = useState<Record<number, { loading: boolean; result?: any; error?: string }>>({});

  useEffect(() => {
    const fetchData = async () => {
      try {
        const bizRes = await fetch('/api/businesses');
        const bizData = await bizRes.json();
        const rows = bizData.rows || [];
        const headers = rows[0] || [];
        const businessObjects = rows.slice(1).map((row: string[]) => {
          const obj: Business = {};
          headers.forEach((header: string, idx: number) => {
            obj[header] = row[idx] || '';
          });
          return obj;
        });
        setBusinesses(businessObjects);

        const mediaRes = await fetch('/api/media');
        const mediaData = await mediaRes.json();
        setMedia(mediaData.files || []);
      } catch (err: any) {
        setError(err.message || 'Error fetching data');
      } finally {
        setLoading(false);
      }
    };
    fetchData();
  }, []);

  if (loading) return <div style={{padding: 40}}>Loading...</div>;
  if (error) return <div style={{color: 'red', padding: 40}}>Error: {error}</div>;

  // Automation handler
  const handleAutomation = async (biz: Business, idx: number) => {
    setRowStatus(s => ({ ...s, [idx]: { loading: true } }));
    try {
      const res = await fetch('/api/automate', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ business: biz, index: idx })
      });
      const data = await res.json();
      if (!res.ok) throw new Error(data.error || 'Unknown error');
      setRowStatus(s => ({ ...s, [idx]: { loading: false, result: data } }));
    } catch (err: any) {
      setRowStatus(s => ({ ...s, [idx]: { loading: false, error: err.message || 'Automation failed' } }));
    }
  };

  return (
    <div style={{padding: 40, maxWidth: 1200, margin: '0 auto', fontFamily: 'sans-serif'}}>
      <h1>Business Listings Dashboard</h1>
      <h2>Businesses from Google Sheet</h2>
      <div style={{overflowX: 'auto', marginBottom: 40}}>
        <table style={{borderCollapse: 'collapse', width: '100%'}}>
          <thead>
            <tr>
              {businesses[0] && Object.keys(businesses[0]).map((header) => (
                <th key={header} style={{border: '1px solid #ddd', padding: 8, background: '#f6f6f6'}}>{header}</th>
              ))}
              <th style={{border: '1px solid #ddd', padding: 8, background: '#f6f6f6'}}>Actions</th>
            </tr>
          </thead>
          <tbody>
            {businesses.map((biz, idx) => (
              <tr key={idx}>
                {Object.values(biz).map((val, i) => (
                  <td key={i} style={{border: '1px solid #ddd', padding: 8}}>{val}</td>
                ))}
                <td style={{border: '1px solid #ddd', padding: 8, minWidth: 180}}>
                  <button
                    style={{padding: '6px 16px', background: '#0070f3', color: '#fff', border: 'none', borderRadius: 4, cursor: rowStatus[idx]?.loading ? 'not-allowed' : 'pointer'}}
                    disabled={rowStatus[idx]?.loading}
                    onClick={() => handleAutomation(biz, idx)}
                  >
                    {rowStatus[idx]?.loading ? 'Running...' : 'Start Automation'}
                  </button>
                  {rowStatus[idx]?.result && (
                    <div style={{marginTop: 8, color: 'green', fontSize: 13}}>
                      Success! <a href={rowStatus[idx].result.profileUrl} target="_blank" rel="noopener noreferrer">View Profile</a>
                    </div>
                  )}
                  {rowStatus[idx]?.error && (
                    <div style={{marginTop: 8, color: 'red', fontSize: 13}}>
                      Error: {rowStatus[idx].error}
                    </div>
                  )}
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
      <h2>Media Files from Google Drive</h2>
      <div style={{display: 'flex', flexWrap: 'wrap', gap: 16}}>
        {media.map((file) => (
          <div key={file.id} style={{width: 180, border: '1px solid #eee', borderRadius: 6, padding: 8, textAlign: 'center'}}>
            {file.mimeType.startsWith('image') ? (
              <img src={file.webContentLink} alt={file.name} style={{width: '100%', height: 100, objectFit: 'cover', borderRadius: 4}} />
            ) : file.mimeType.startsWith('video') ? (
              <video src={file.webContentLink} controls style={{width: '100%', height: 100, borderRadius: 4}} />
            ) : (
              <span>{file.name}</span>
            )}
            <div style={{marginTop: 8, fontSize: 12}}>{file.name}</div>
          </div>
        ))}
      </div>
    </div>
  );
};

export default Home;