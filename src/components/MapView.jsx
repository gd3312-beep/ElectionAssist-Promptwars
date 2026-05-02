import React from 'react'
import { useAppContext } from '../context/AppContext'
import { MapPin, ExternalLink } from 'lucide-react'

export default function MapView() {
  const { state } = useAppContext()
  const apiKey = import.meta.env.VITE_GOOGLE_MAPS_API_KEY
  
  // Default to a general query if no location provided
  const query = state.location ? `polling booths near ${state.location}` : "polling booth"
  
  const mapUrl = `https://www.google.com/maps/embed/v1/search?key=${apiKey}&q=${encodeURIComponent(query)}`
  const streetViewUrl = `https://www.google.com/maps/embed/v1/streetview?key=${apiKey}&location=${encodeURIComponent(state.location || 'Washington DC')}&heading=210&pitch=10&fov=35`

  return (
    <div className="glass-panel" style={{ display: 'flex', flexDirection: 'column', height: '100%', overflow: 'hidden' }}>
      <div style={{ padding: '1.5rem', display: 'flex', justifyContent: 'space-between', alignItems: 'center', borderBottom: '1px solid var(--card-border)' }}>
        <div style={{ display: 'flex', alignItems: 'center', gap: '0.75rem' }}>
          <MapPin color="var(--primary-color)" size={24} />
          <div>
            <h2 style={{ margin: 0, fontSize: '1.2rem' }}>Nearest Polling Booth</h2>
            <p style={{ margin: 0, fontSize: '0.85rem', color: 'var(--text-secondary)', display: 'flex', gap: '1rem', alignItems: 'center' }}>
              <span>{state.location ? `Showing results near ${state.location}` : "Ask me to find booths near your location"}</span>
              {state.location && (
                <span style={{ color: 'var(--accent-color)', fontWeight: 'bold', background: 'rgba(16, 185, 129, 0.1)', padding: '0.1rem 0.5rem', borderRadius: 'var(--radius-md)' }}>
                  1.2 km (5 min)
                </span>
              )}
            </p>
          </div>
        </div>
        
        {state.location && (
          <div style={{ display: 'flex', gap: '0.5rem' }}>
            <a 
              href={`https://www.google.com/maps/dir/?api=1&destination=${encodeURIComponent(query)}`} 
              target="_blank" 
              rel="noreferrer"
              style={{ display: 'flex', alignItems: 'center', gap: '0.5rem', textDecoration: 'none', background: 'var(--accent-color)', color: 'white', padding: '0.5rem 1rem', borderRadius: 'var(--radius-xl)', fontSize: '0.85rem', fontWeight: 'bold' }}
            >
              Show Directions
            </a>
            <a 
              href={`https://www.google.com/maps/search/?api=1&query=${encodeURIComponent(query)}`} 
              target="_blank" 
              rel="noreferrer"
              style={{ display: 'flex', alignItems: 'center', gap: '0.5rem', textDecoration: 'none', background: 'var(--primary-color)', color: 'white', padding: '0.5rem 1rem', borderRadius: 'var(--radius-xl)', fontSize: '0.85rem' }}
            >
              Open Maps <ExternalLink size={14} />
            </a>
          </div>
        )}
      </div>

      <div style={{ flex: 1, display: 'flex', flexDirection: 'column', position: 'relative' }}>
        {!apiKey ? (
          <div style={{ position: 'absolute', inset: 0, display: 'flex', alignItems: 'center', justifyContent: 'center', background: 'rgba(0,0,0,0.05)', color: 'var(--text-secondary)' }}>
            Missing Google Maps API Key
          </div>
        ) : (
          <>
            <iframe
              title="Polling Locations Map"
              style={{ flex: 1, border: 0, borderBottom: state.location ? '2px solid var(--card-border)' : 'none' }}
              loading="lazy"
              allowFullScreen
              src={mapUrl}
            ></iframe>
            {state.location && (
              <iframe
                title="Street View"
                style={{ flex: 1, border: 0 }}
                loading="lazy"
                allowFullScreen
                src={streetViewUrl}
              ></iframe>
            )}
          </>
        )}
      </div>
    </div>
  )
}
