import React, { useState } from 'react'
import { useAppContext } from '../context/AppContext'
import { MapPin, ExternalLink, Search, Navigation, Eye, Map } from 'lucide-react'
import { getLocationInsights } from '../utils/gemini'

/**
 * MapView — Polling Booth Finder
 *
 * Displays an embedded Google Maps search for polling booths near the user's
 * location. Falls back gracefully to deep-link + guidance when no API key is
 * available. Includes a Street View tab for real-world location preview and
 * AI-enhanced location tips via the Gemini utility.
 */
export default function MapView() {
  const { state, dispatch } = useAppContext()
  const [locationInput, setLocationInput] = useState('')
  const [activeTab, setActiveTab] = useState('map') // 'map' | 'streetview'
  const [insights, setInsights] = useState(null)
  const [loadingInsights, setLoadingInsights] = useState(false)

  const apiKey = import.meta.env.VITE_GOOGLE_MAPS_API_KEY
  const hasLocation = !!state.location
  const query = hasLocation ? `polling booths near ${state.location}` : 'polling booth'

  // Google Maps Embed API URL
  const mapUrl = apiKey
    ? `https://www.google.com/maps/embed/v1/search?key=${apiKey}&q=${encodeURIComponent(query)}`
    : null

  // Google Street View Embed API URL
  const streetViewUrl = apiKey && hasLocation
    ? `https://www.google.com/maps/embed/v1/streetview?key=${apiKey}&location=${encodeURIComponent(state.location)}&heading=210&pitch=10&fov=80`
    : null

  const handleSetLocation = async () => {
    if (!locationInput.trim()) return
    dispatch({ type: 'SET_LOCATION', payload: locationInput.trim() })
    setLocationInput('')
    await fetchInsights(locationInput.trim())
  }

  const handleGeolocate = () => {
    if (!navigator.geolocation) return
    navigator.geolocation.getCurrentPosition(
      (pos) => {
        const loc = `${pos.coords.latitude.toFixed(4)},${pos.coords.longitude.toFixed(4)}`
        dispatch({ type: 'SET_LOCATION', payload: loc })
        fetchInsights(loc)
      },
      () => { /* silent — permission denied */ }
    )
  }

  const fetchInsights = async (location) => {
    setLoadingInsights(true)
    setInsights(null)
    const data = await getLocationInsights(location)
    setInsights(data)
    setLoadingInsights(false)
  }

  // Tab button style helper
  const tabStyle = (tab) => ({
    padding: '0.4rem 1rem',
    borderRadius: 'var(--radius-xl)',
    border: 'none',
    cursor: 'pointer',
    fontSize: '0.8rem',
    fontWeight: 700,
    transition: 'all 0.2s ease',
    background: activeTab === tab ? 'var(--primary-color)' : 'transparent',
    color: activeTab === tab ? 'white' : 'var(--text-secondary)',
  })

  return (
    <div className="glass-panel" style={{ display: 'flex', flexDirection: 'column', height: '100%', overflow: 'hidden' }}>

      {/* Header */}
      <div style={{ padding: '1rem 1.25rem', borderBottom: '1px solid var(--card-border)' }}>
        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', gap: '1rem' }}>
          <div style={{ display: 'flex', alignItems: 'center', gap: '0.6rem' }}>
            <MapPin color="var(--primary-color)" size={20} aria-hidden="true" />
            <div>
              <h2 style={{ margin: 0, fontSize: '1rem' }}>Nearest Polling Booth</h2>
              <p style={{ margin: 0, fontSize: '0.75rem', color: 'var(--text-secondary)' }}>
                {hasLocation ? `📍 Showing: ${state.location}` : 'Enter your location to find booths'}
              </p>
            </div>
          </div>

          {hasLocation && (
            <a
              href={`https://www.google.com/maps/search/?api=1&query=${encodeURIComponent(query)}`}
              target="_blank" rel="noreferrer"
              aria-label="Open polling booth location in Google Maps"
              style={{
                display: 'flex', alignItems: 'center', gap: '0.35rem',
                textDecoration: 'none', background: 'var(--primary-color)', color: 'white',
                padding: '0.4rem 0.8rem', borderRadius: 'var(--radius-xl)',
                fontSize: '0.75rem', fontWeight: 700, flexShrink: 0,
              }}
            >
              Open Maps <ExternalLink size={12} aria-hidden="true" />
            </a>
          )}
        </div>

        {/* Location Input Row */}
        <div style={{ display: 'flex', gap: '0.45rem', marginTop: '0.75rem' }}>
          <input
            type="text"
            value={locationInput}
            onChange={e => setLocationInput(e.target.value)}
            onKeyDown={e => e.key === 'Enter' && handleSetLocation()}
            placeholder="Enter area, city or pin code…"
            aria-label="Enter your location"
            style={{
              flex: 1, padding: '0.5rem 0.85rem', borderRadius: 'var(--radius-xl)',
              border: '1px solid var(--card-border)', background: 'var(--card-bg)',
              color: 'var(--text-primary)', fontSize: '0.85rem', outline: 'none',
            }}
          />
          <button
            onClick={handleSetLocation}
            aria-label="Search for polling booths"
            style={{
              padding: '0.5rem 0.9rem', borderRadius: 'var(--radius-xl)',
              background: 'var(--primary-color)', color: 'white', border: 'none',
              cursor: 'pointer', display: 'flex', alignItems: 'center', gap: '0.3rem',
              fontSize: '0.82rem', fontWeight: 700,
            }}
          >
            <Search size={14} aria-hidden="true" /> Find
          </button>
          <button
            onClick={handleGeolocate}
            aria-label="Use my current GPS location"
            title="Use my current location"
            style={{
              padding: '0.5rem 0.7rem', borderRadius: 'var(--radius-xl)',
              background: 'var(--card-bg)', color: 'var(--primary-color)',
              border: '1px solid var(--primary-color)', cursor: 'pointer',
              display: 'flex', alignItems: 'center',
            }}
          >
            <Navigation size={15} aria-hidden="true" />
          </button>
        </div>

        {/* Map / Street View Tab Switcher (only when location is set + API key exists) */}
        {hasLocation && apiKey && (
          <div style={{
            display: 'flex', gap: '0.25rem', marginTop: '0.6rem',
            background: 'rgba(0,0,0,0.12)', borderRadius: 'var(--radius-xl)', padding: '0.2rem',
          }}>
            <button
              style={tabStyle('map')}
              onClick={() => setActiveTab('map')}
              aria-label="Switch to Map view"
              aria-pressed={activeTab === 'map'}
            >
              <Map size={12} style={{ display: 'inline', marginRight: '0.3rem' }} aria-hidden="true" />
              Map View
            </button>
            <button
              style={tabStyle('streetview')}
              onClick={() => setActiveTab('streetview')}
              aria-label="Switch to Street View"
              aria-pressed={activeTab === 'streetview'}
            >
              <Eye size={12} style={{ display: 'inline', marginRight: '0.3rem' }} aria-hidden="true" />
              Street View
            </button>
          </div>
        )}
      </div>

      {/* Main Map / Street View / Fallback Area */}
      <div style={{ flex: 1, position: 'relative', display: 'flex', flexDirection: 'column', minHeight: 0 }}>
        {!hasLocation ? (
          /* ── No location set ── */
          <div style={{
            flex: 1, display: 'flex', flexDirection: 'column',
            alignItems: 'center', justifyContent: 'center',
            padding: '1.5rem', textAlign: 'center', gap: '0.85rem',
          }}>
            <div style={{ fontSize: '3rem' }}>🗺️</div>
            <h3 style={{ margin: 0, fontSize: '1rem' }}>Find Your Polling Booth</h3>
            <p style={{ margin: 0, maxWidth: '260px', fontSize: '0.875rem', color: 'var(--text-secondary)', lineHeight: 1.6 }}>
              Enter your area or pin code above, or tap 📡 to use GPS.
            </p>
            <div style={{ display: 'flex', flexDirection: 'column', gap: '0.45rem', width: '100%', maxWidth: '230px' }}>
              {['Delhi', 'Mumbai', 'Bengaluru', 'Chennai'].map(city => (
                <button
                  key={city}
                  onClick={() => { dispatch({ type: 'SET_LOCATION', payload: city }); fetchInsights(city) }}
                  aria-label={`Search for polling booths near ${city}`}
                  style={{
                    padding: '0.45rem 1rem', borderRadius: 'var(--radius-xl)',
                    background: 'var(--card-bg)', border: '1px solid var(--card-border)',
                    color: 'var(--text-primary)', cursor: 'pointer', fontSize: '0.82rem',
                    transition: 'all 0.2s',
                  }}
                >
                  📍 Search near {city}
                </button>
              ))}
            </div>
            <a href="https://voters.eci.gov.in" target="_blank" rel="noreferrer"
              style={{ fontSize: '0.78rem', color: 'var(--primary-color)' }}>
              Or use official ECI portal →
            </a>
          </div>

        ) : !apiKey ? (
          /* ── Has location, no API key — deep link fallback ── */
          <div style={{
            flex: 1, display: 'flex', flexDirection: 'column',
            alignItems: 'center', justifyContent: 'center',
            padding: '1.5rem', textAlign: 'center', gap: '0.85rem',
          }}>
            <div style={{ fontSize: '2.5rem' }}>📍</div>
            <h3 style={{ margin: 0 }}>Location: {state.location}</h3>
            <p style={{ margin: 0, maxWidth: '260px', fontSize: '0.875rem', color: 'var(--text-secondary)', lineHeight: 1.6 }}>
              Open Google Maps to view polling booths near your location.
            </p>
            <a
              href={`https://www.google.com/maps/search/?api=1&query=${encodeURIComponent(query)}`}
              target="_blank" rel="noreferrer"
              aria-label="Open Google Maps to find nearby polling booths"
              style={{
                display: 'flex', alignItems: 'center', gap: '0.5rem',
                textDecoration: 'none', background: 'var(--primary-color)', color: 'white',
                padding: '0.7rem 1.4rem', borderRadius: 'var(--radius-xl)',
                fontWeight: 700, fontSize: '0.9rem',
              }}
            >
              Open in Google Maps <ExternalLink size={15} aria-hidden="true" />
            </a>
            <a
              href={`https://www.google.com/maps?q=polling+booth+near+${encodeURIComponent(state.location)}&layer=transit`}
              target="_blank" rel="noreferrer"
              style={{ fontSize: '0.82rem', color: 'var(--primary-color)' }}
            >
              View Street View on Google Maps →
            </a>
            <a href="https://voters.eci.gov.in" target="_blank" rel="noreferrer"
              style={{ fontSize: '0.82rem', color: 'var(--text-secondary)' }}>
              Or use official ECI portal →
            </a>
          </div>

        ) : activeTab === 'map' ? (
          /* ── Full embedded map ── */
          <iframe
            key={mapUrl}
            title="Polling Locations Map powered by Google Maps"
            style={{ flex: 1, border: 0, width: '100%', minHeight: '220px' }}
            loading="lazy"
            allowFullScreen
            referrerPolicy="no-referrer-when-downgrade"
            src={mapUrl}
          />
        ) : (
          /* ── Street View ── */
          streetViewUrl ? (
            <iframe
              key={streetViewUrl}
              title="Street View of polling area powered by Google Maps"
              style={{ flex: 1, border: 0, width: '100%', minHeight: '220px' }}
              loading="lazy"
              allowFullScreen
              referrerPolicy="no-referrer-when-downgrade"
              src={streetViewUrl}
            />
          ) : (
            <div style={{
              flex: 1, display: 'flex', flexDirection: 'column',
              alignItems: 'center', justifyContent: 'center', gap: '0.75rem',
              padding: '1.5rem', textAlign: 'center',
            }}>
              <div style={{ fontSize: '2.5rem' }}>🏘️</div>
              <p style={{ fontSize: '0.875rem', color: 'var(--text-secondary)' }}>
                Street View unavailable for this location.
              </p>
              <a
                href={`https://www.google.com/maps/@?api=1&map_action=pano&viewpoint=${encodeURIComponent(state.location)}`}
                target="_blank" rel="noreferrer"
                style={{ fontSize: '0.82rem', color: 'var(--primary-color)' }}
              >
                Open Street View in Google Maps →
              </a>
            </div>
          )
        )}
      </div>

      {/* AI Location Insights (Gemini-enhanced or local fallback) */}
      {hasLocation && (
        <div style={{ borderTop: '1px solid var(--card-border)', padding: '0.85rem 1.25rem' }}>
          {loadingInsights ? (
            <p style={{ margin: 0, fontSize: '0.78rem', color: 'var(--text-secondary)' }}>
              ✨ Fetching tips for {state.location}…
            </p>
          ) : insights ? (
            <div>
              <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: '0.45rem' }}>
                <span style={{ fontSize: '0.72rem', fontWeight: 700, color: 'var(--primary-color)', textTransform: 'uppercase', letterSpacing: '0.04em' }}>
                  {insights.source === 'gemini' ? '✨ AI-enhanced by Gemini' : '💡 Local Tips'}
                </span>
              </div>
              <ul style={{ margin: 0, padding: '0 0 0 1rem', display: 'flex', flexDirection: 'column', gap: '0.3rem' }}>
                {insights.tips.slice(0, 3).map((tip, i) => (
                  <li key={i} style={{ fontSize: '0.8rem', color: 'var(--text-secondary)', lineHeight: 1.5 }}>{tip}</li>
                ))}
              </ul>
            </div>
          ) : (
            <button
              onClick={() => fetchInsights(state.location)}
              aria-label="Load AI-enhanced tips for your location"
              style={{
                background: 'none', border: '1px solid var(--card-border)', cursor: 'pointer',
                color: 'var(--primary-color)', fontSize: '0.78rem', fontWeight: 600,
                padding: '0.35rem 0.75rem', borderRadius: 'var(--radius-xl)',
              }}
            >
              ✨ Get tips for {state.location}
            </button>
          )}
        </div>
      )}

      {/* Google Services Attribution */}
      <div style={{
        borderTop: '1px solid var(--card-border)', padding: '0.4rem 1.25rem',
        display: 'flex', alignItems: 'center', justifyContent: 'space-between',
        fontSize: '0.68rem', color: 'var(--text-secondary)',
      }}>
        <span>🗺️ Powered by Google Maps</span>
        {insights?.source === 'gemini' && <span>🤖 AI enhanced by Gemini</span>}
      </div>
    </div>
  )
}
