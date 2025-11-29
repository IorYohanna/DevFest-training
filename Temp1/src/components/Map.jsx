import React, { useEffect, useState, useRef } from "react";
import { MapContainer, TileLayer, Marker, Popup, useMap, Circle } from "react-leaflet";
import L from "leaflet";
import "leaflet/dist/leaflet.css";
import "leaflet-routing-machine/dist/leaflet-routing-machine.css";
import "leaflet-routing-machine";

// --- Styles locaux pour l'icône pulsante (inclus dans le composant pour simplicité) ---
const injectedStyles = `
.leaflet-container { font-family: Inter, ui-sans-serif, system-ui, -apple-system, 'Segoe UI', Roboto, 'Helvetica Neue', Arial; }
.pulse-marker {
  width: 18px; height: 18px; border-radius: 50%;
  background: rgba(66,133,244,1); box-shadow: 0 0 0 6px rgba(66,133,244,0.25);
  border: 2px solid white;
}
.pulse-marker::after{
  content: ''; position: absolute; left: -6px; top: -6px; width: 30px; height: 30px; border-radius: 50%;
  background: rgba(66,133,244,0.25); animation: pulse 1.8s infinite;
}
@keyframes pulse { 0% { transform: scale(0.8); opacity: 0.7 } 70% { transform: scale(1.6); opacity: 0 } 100% { opacity: 0 } }
.control-card { background: rgba(255,255,255,0.98); padding: 16px; border-radius: 12px; box-shadow: 0 8px 24px rgba(0,0,0,0.12); }
`;

// --- Fix icône par défaut de Leaflet sous React ---
import iconUrl from "leaflet/dist/images/marker-icon.png";
import iconShadowUrl from "leaflet/dist/images/marker-shadow.png";
const DefaultIcon = L.icon({ iconUrl, shadowUrl: iconShadowUrl, iconSize: [25,41], iconAnchor: [12,41] });
L.Marker.prototype.options.icon = DefaultIcon;

// --- Petit utilitaire pour recentrer la carte proprement ---
const RecenterMap = ({ position, follow }) => {
  const map = useMap();
  useEffect(() => {
    if (!position) return;
    if (follow) {
      map.setView(position, Math.max(map.getZoom(), 15), { animate: true });
    }
  }, [position, follow, map]);
  return null;
};

// --- Composant de routage (Leaflet Routing Machine) avec options en français ---
const RoutingMachine = ({ start, end }) => {
  const map = useMap();
  const controlRef = useRef(null);

  useEffect(() => {
    if (!map || !start || !end) return;

    // Nettoyage d'un éventuel contrôle précédent
    if (controlRef.current) {
      try { map.removeControl(controlRef.current); } catch (e) {}
    }

    const rc = L.Routing.control({
      waypoints: [ L.latLng(start[0], start[1]), L.latLng(end[0], end[1]) ],
      routeWhileDragging: false,
      showAlternatives: false,
      fitSelectedRoutes: true,
      lineOptions: { styles: [{ color: '#6FA1EC', weight: 5 }] },
      createMarker: (i, wp) => L.marker(wp.latLng, { draggable: false }),
      language: 'fr'
    }).addTo(map);

    controlRef.current = rc;

    return () => {
      if (controlRef.current) map.removeControl(controlRef.current);
    };
  }, [map, start, end]);

  return null;
};

// --- Fonction basique de géocodage (Nominatim) en français ---
const geocode = async (query) => {
  const url = `https://nominatim.openstreetmap.org/search?format=json&limit=1&q=${encodeURIComponent(query)}`;
  try {
    const res = await fetch(url, { headers: { 'Accept-Language': 'fr' } });
    const data = await res.json();
    if (data && data[0]) return [parseFloat(data[0].lat), parseFloat(data[0].lon)];
    return null;
  } catch (e) {
    console.error('Erreur geocoding', e);
    return null;
  }
};

// --- Composant principal (tout en français) ---
export default function MapReactAmelioree() {
  const [position, setPosition] = useState(null); // position actuelle
  const [accuracy, setAccuracy] = useState(null);
  const [follow, setFollow] = useState(true); // auto recentrage
  const [start, setStart] = useState(null);
  const [end, setEnd] = useState(null);
  const [startInput, setStartInput] = useState('');
  const [endInput, setEndInput] = useState('');
  const [loadingRoute, setLoadingRoute] = useState(false);
  const watchIdRef = useRef(null);
  const intervalRef = useRef(null);

  // Injection CSS
  useEffect(() => {
    const style = document.createElement('style');
    style.innerHTML = injectedStyles;
    document.head.appendChild(style);
    return () => document.head.removeChild(style);
  }, []);

  // Fonction pour mettre à jour la position toutes les 1s (exigence utilisateur)
  useEffect(() => {
    // Première tentative: watchPosition (meilleur pour la réactivité)
    if ('geolocation' in navigator) {
      watchIdRef.current = navigator.geolocation.watchPosition(
        (pos) => {
          const { latitude, longitude, accuracy } = pos.coords;
          setPosition([latitude, longitude]);
          setAccuracy(accuracy);
        },
        (err) => { console.warn('watchPosition erreur', err); },
        { enableHighAccuracy: true, maximumAge: 0, timeout: 5000 }
      );

      // Garantie: poll toutes les 1s si watchPosition est lent ou manque des updates
      intervalRef.current = setInterval(() => {
        navigator.geolocation.getCurrentPosition(
          (p) => {
            const { latitude, longitude, accuracy } = p.coords;
            setPosition([latitude, longitude]);
            setAccuracy(accuracy);
          },
          () => {},
          { enableHighAccuracy: true }
        );
      }, 1000);
    } else {
      alert('Géolocalisation non disponible sur ce navigateur.');
    }

    return () => {
      if (watchIdRef.current !== null) navigator.geolocation.clearWatch(watchIdRef.current);
      if (intervalRef.current) clearInterval(intervalRef.current);
    };
  }, []);

  // Gestionnaire du formulaire d'itinéraire (tout en français)
  const handleRoute = async (e) => {
    e.preventDefault();
    setLoadingRoute(true);

    let s = start;
    let d = end;

    if (startInput) {
      if (startInput.trim().toLowerCase() === 'ma position' && position) s = position;
      else {
        const coords = await geocode(startInput);
        if (!coords) { alert('Point de départ introuvable.'); setLoadingRoute(false); return; }
        s = coords;
      }
    }

    if (endInput) {
      const coords = await geocode(endInput);
      if (!coords) { alert('Destination introuvable.'); setLoadingRoute(false); return; }
      d = coords;
    }

    if (s && d) {
      setStart(s);
      setEnd(d);
      setFollow(false); // ne pas forcer recentrage lors d'une navigation
    } else {
      alert('Veuillez renseigner un point de départ et une destination valides.');
    }

    setLoadingRoute(false);
  };

  // Utilitaire: utiliser la position actuelle comme départ
  const useCurrentAsStart = () => {
    if (!position) { alert('Position non encore disponible.'); return; }
    setStart(position);
    setStartInput('Ma position');
  };

  // Clear route
  const clearRoute = () => { setStart(null); setEnd(null); setStartInput(''); setEndInput(''); };

  return (
    <div className="w-screen h-screen relative">
      {/* Carte */}
      <MapContainer center={position || [0,0]} zoom={position ? 15 : 2} style={{ height: '100%', width: '100%' }}>
        <TileLayer
          attribution='&copy; OpenStreetMap contributors'
          url="https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png"
        />

        {/* Itinéraire si existant */}
        {start && end && <RoutingMachine start={start} end={end} />}

        {/* Cercle d'exactitude et marqueur animé */}
        {position && (
          <>
            {accuracy && <Circle center={position} radius={Math.min(accuracy, 200)} pathOptions={{ color: '#91c0ff', fillOpacity: 0.12 }} />}

            <Marker position={position} icon={L.divIcon({ className: '', html: '<div class="pulse-marker"></div>', iconAnchor: [9,9] })}>
              <Popup>
                <div style={{ minWidth: 180 }}>
                  <strong>Vous êtes ici</strong>
                  <div>Latitude: {position[0].toFixed(6)}</div>
                  <div>Longitude: {position[1].toFixed(6)}</div>
                  {accuracy && <div>Précision: ±{Math.round(accuracy)} m</div>}
                </div>
              </Popup>
            </Marker>

            {/* Recentrage conditionnel */}
            <RecenterMap position={position} follow={follow} />
          </>
        )}
      </MapContainer>

      {/* Panneau de contrôle (français, design moderne) */}
      <div style={{ position: 'absolute', left: 20, top: 20, zIndex: 1000, width: 360 }}>
        <div className="control-card">
          <h2 style={{ margin: 0, fontSize: 18 }}>Planifier un trajet</h2>
          <p style={{ margin: '8px 0 12px 0', color: '#555' }}>Entrez "Ma position" pour utiliser le GPS actuel. Tout est en français.</p>

          <form onSubmit={handleRoute}>
            <div style={{ display: 'flex', gap: 8, marginBottom: 8 }}>
              <input value={startInput} onChange={(e) => setStartInput(e.target.value)} placeholder="Point de départ (ex: Ma position)" style={{ flex: 1, padding: 8, borderRadius: 8, border: '1px solid #e6e6e6' }} />
              <button type="button" onClick={useCurrentAsStart} title="Utiliser ma position" style={{ padding: 8, borderRadius: 8, border: 'none', background: '#eef5ff', cursor: 'pointer' }}>📍</button>
            </div>

            <div style={{ marginBottom: 12 }}>
              <input value={endInput} onChange={(e) => setEndInput(e.target.value)} placeholder="Destination (ex: Antananarivo)" style={{ width: '100%', padding: 8, borderRadius: 8, border: '1px solid #e6e6e6' }} />
            </div>

            <div style={{ display: 'flex', gap: 8 }}>
              <button type="submit" disabled={loadingRoute} style={{ flex: 1, padding: 10, borderRadius: 8, background: '#4285F4', color: 'white', border: 'none', fontWeight: 600 }}>{loadingRoute ? 'Calcul en cours...' : 'Afficher l\'itinéraire'}</button>
              <button type="button" onClick={clearRoute} style={{ padding: 10, borderRadius: 8, border: '1px solid #e6e6e6', background: 'white' }}>Effacer</button>
            </div>
          </form>

          <hr style={{ margin: '12px 0' }} />

          <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
            <div>
              <div style={{ fontSize: 13, color: '#333' }}>Recentrage automatique</div>
              <div style={{ fontSize: 12, color: '#666' }}>La carte vous suit toutes les secondes si activé</div>
            </div>
            <label style={{ display: 'flex', alignItems: 'center', gap: 8 }}>
              <input type="checkbox" checked={follow} onChange={(e) => setFollow(e.target.checked)} />
            </label>
          </div>

          <div style={{ marginTop: 10, fontSize: 13, color: '#444' }}>
            <strong>Astuce :</strong> cliquez sur le marqueur bleu pour voir les coordonnées. Les guides et boutons sont en français.
          </div>
        </div>
      </div>
    </div>
  );
}