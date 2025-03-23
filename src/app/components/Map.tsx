import React from 'react';
import mapboxgl from 'mapbox-gl';
import { useEffect } from 'react';
mapboxgl.accessToken = 'pk.eyJ1Ijoicm9nZXJzYW50YW5hc3Vhc3RlIiwiYSI6ImNtODdjamtmMTBlbXAybHE5cDA2N2N0d3EifQ.A0vwTYWm4fFXzEyrPAll9Q';
// COORDS I WANT TO USE: 21.04976380146583, -86.84705025483673
const Map: React.FC = () => {
    useEffect(() => {
        const map = new mapboxgl.Map({
            container: 'map-container',
            style: 'mapbox://styles/mapbox/streets-v11',
            center: [-86.84705025483673, 21.04976380146583],
            zoom: 15
        });

        return () => map.remove();
    }, []);

    return (
        <div id="map-container" className="map-container" style={{ width: '100%', height: '100%' }} />
    );
}

export default Map;