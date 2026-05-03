import React, { useState } from 'react'
import { useAppContext } from '../context/AppContext'
import { MapPin, ExternalLink, Search, Navigation } from 'lucide-react'

export default function MapView() {
  const { state, dispatch } = useAppContext()
  const [locationInput, setLocationInput] = useState('')
  const apiKey = import.meta.env.VITE_GOOGLE_MAPS_API_KEY

  const hasLocation = !!state.location
  const query = hasLocation ? `polling booths near ${state.location}` : 'polling booth'
  const mapUrl = apiKey
    ? `https://www.google.com/maps/embed/v1/search?key=${apiKey}&q=${encodeURIComponent(query)}`
    : null

  const handleSetLocation = () => {
    if (!locationInput.trim()) return
    dispatch({ type: 'SET_LOCATION', payload: locationInput.trim() })
    setLocationInput('')
  }

  const handleGeolocate = () => {
    if (!navigator.geolocation) return
    navigator.geolocation.getCurrentPosition(
      (pos) => {
        const loc = `${pos.coords.latitude.toFixed(4)},${pos.coords.longitude.toFixed(4)}`
        dispatch({ type: 'SET_LOCATION', payload: loc })
      },
      () => {
        // permission denied or unavailable — silent fail
      }
    )
  }

  return (
    <div className="glass-panel" style={{ display: 'flex', flexDirection: 'column', height: '100%', overflow: 'hidden' }}>

      {/* Header */}
      <div style={{ padding: '1.25rem 1.5rem', borderBottom: '1px solid var(--card-border)' }}>
        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', gap: '1rem' }}>
          <div style={{ display: 'flex', alignItems: 'center', gap: '0.75rem' }}>
            <MapPin color="var(--primary-color)" size={22} />
            <div>
              <h2 style={{ margin: 0, fontSize: '1.1rem' }}>Nearest Polling Booth</h2>
              <p style={{ margin: 0, fontSize: '0.8rem', color: 'var(--text-secondary)' }}>
                {hasLocation ? `📍 Showing results near: ${state.location}` : 'Enter your location to find booths'}
              </p>
            </div>
          </div>

          {hasLocation && (
            <div style={{ display: 'flex', gap: '0.5rem', flexShrink: 0 }}>
              <a
                href={`https://www.google.com/maps/search/?api=1&query=${encodeURIComponent(query)}`}
                target="_blank" rel="noreferrer"
                style={{ display: 'flex', alignItems: 'center', gap: '0.4rem', textDecoration: 'none', background: 'var(--primary-color)', color: 'white', padding: '0.45rem 0.9rem', borderRadius: 'var(--radius-xl)', fontSize: '0.8rem', fontWeight: 600 }}
              >
                Open Maps <ExternalLink size={13} />
              </a>
            </div>
          )}
        </div>

        {/* Location Input */}
        <div style={{ display: 'flex', gap: '0.5rem', marginTop: '0.85rem' }}>
          <input
            type="text"
            value={locationInput}
            onChange={e => setLocationInput(e.target.value)}
            onKeyDown={e => e.key === 'Enter' && handleSetLocation()}
            placeholder="Enter your area, city or pin code…"
            style={{
              flex: 1, padding: '0.55rem 0.9rem', borderRadius: 'var(--radius-xl)',
              border: '1px solid var(--card-border)', background: 'var(--card-bg)',
              color: 'var(--text-primary)', fontSize: '0.875rem', outline: 'none',
            }}
          />
          <button onClick={handleSetLocation} style={{
            padding: '0.55rem 1rem', borderRadius: 'var(--radius-xl)',
            background: 'var(--primary-color)', color: 'white', border: 'none',
            cursor: 'pointer', display: 'flex', alignItems: 'center', gap: '0.35rem',
            fontSize: '0.85rem', fontWeight: 600,
          }}>
            <Search size={15} /> Find
          </button>
          <button onClick={handleGeolocate} title="Use my current location" style={{
            padding: '0.55rem 0.75rem', borderRadius: 'var(--radius-xl)',
            background: 'var(--card-bg)', color: 'var(--primary-color)',
            border: '1px solid var(--primary-color)', cursor: 'pointer',
            display: 'flex', alignItems: 'center',
          }}>
            <Navigation size={16} />
          </button>
        </div>
      </div>

      {/* Map Area */}
      <div style={{ flex: 1, position: 'relative', display: 'flex', flexDirection: 'column' }}>
        {!hasLocation ? (
          /* No location set — guidance state */
          <div style={{
            flex: 1, display: 'flex', flexDirection: 'column',
            alignItems: 'center', justifyContent: 'center',
            padding: '2rem', textAlign: 'center', gap: '1rem',
          }}>
            <div style={{ fontSize: '3.5rem' }}>🗺️</div>
            <h3 style={{ margin: 0, color: 'var(--text-primary)' }}>Find Your Polling Booth</h3>
            <p style={{ margin: 0, maxWidth: '280px', fontSize: '0.9rem', color: 'var(--text-secondary)', lineHeight: 1.6 }}>
              Enter your area name, city, or pin code above — or tap the 📡 button to use your device's GPS.
            </p>
            <div style={{ display: 'flex', flexDirection: 'column', gap: '0.5rem', marginTop: '0.5rem', width: '100%', maxWidth: '260px' }}>
              {['Delhi', 'Mumbai', 'Bengaluru', 'Chennai'].map(city => (
                <button key={city} onClick={() => dispatch({ type: 'SET_LOCATION', payload: city })} style={{
                  padding: '0.5rem 1rem', borderRadius: 'var(--radius-xl)',
                  background: 'var(--card-bg)', border: '1px solid var(--card-border)',
                  color: 'var(--text-primary)', cursor: 'pointer', fontSize: '0.85rem',
                  transition: 'all 0.2s',
                }}>
                  📍 Search near {city}
                </button>
              ))}
            </div>
            <p style={{ margin: '0.5rem 0 0', fontSize: '0.78rem', color: 'var(--text-secondary)' }}>
              Or visit{' '}
              <a href="https://voters.eci.gov.in" target="_blank" rel="noreferrer" style={{ color: 'var(--primary-color)' }}>
                voters.eci.gov.in
              </a>
              {' '}→ "Find Polling Station"
            </p>
          </div>
        ) : !apiKey ? (
          /* Has location but no API key — deep link fallback */
          <div style={{
            flex: 1, display: 'flex', flexDirection: 'column',
            alignItems: 'center', justifyContent: 'center',
            padding: '2rem', textAlign: 'center', gap: '1rem',
          }}>
            <div style={{ fontSize: '3rem' }}>📍</div>
            <h3 style={{ margin: 0, color: 'var(--text-primary)' }}>Location Set: {state.location}</h3>
            <p style={{ margin: 0, maxWidth: '280px', fontSize: '0.9rem', color: 'var(--text-secondary)', lineHeight: 1.6 }}>
              Open Google Maps to find polling booths near you.
            </p>
            <a
              href={`https://www.google.com/maps/search/?api=1&query=${encodeURIComponent(query)}`}
              target="_blank" rel="noreferrer"
              style={{
                display: 'flex', alignItems: 'center', gap: '0.5rem',
                textDecoration: 'none', background: 'var(--primary-color)', color: 'white',
                padding: '0.75rem 1.5rem', borderRadius: 'var(--radius-xl)',
                fontWeight: 700, fontSize: '0.95rem',
              }}
            >
              Open in Google Maps <ExternalLink size={16} />
            </a>
            <a
              href="https://voters.eci.gov.in"
              target="_blank" rel="noreferrer"
              style={{ fontSize: '0.85rem', color: 'var(--primary-color)' }}
            >
              Or use official ECI portal →
            </a>
          </div>
        ) : (
          /* Full embedded map */
          <iframe
            key={mapUrl}
            title="Polling Locations Map"
            style={{ flex: 1, border: 0, width: '100%', minHeight: '300px' }}
            loading="lazy"
            allowFullScreen
            src={mapUrl}
          />
        )}
      </div>
    </div>
  )
}
