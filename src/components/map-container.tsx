import { Map, View } from "ol";
import { useEffect, useRef } from "react";

import "ol/ol.css"
import TileLayer from "ol/layer/Tile";
import { OSM } from "ol/source";

import { Projection, transform } from "ol/proj"
import MapUtils from "@/utils/map-utils";

const  projection = new Projection({
code: 'EPSG:4326',
units: 'degrees',
axisOrientation: 'neu'
});
const mapUtils = new MapUtils();

interface MapProps {
	center?: [number, number]
}
const MapContainer: React.FC<MapProps> = () => {
	const mapElement = useRef<any>(null);
	const mapRef = useRef<any>(null);

	const initialMap = () => {

		const map = new Map({
			target: mapElement.current,
			view: new View({
				center:[106.9202854, -6.8494057],
				// center: transform([106.9202854, -6.8494057], "EPSG:4326", "EPSG:3857"),
				zoom: 13,
				projection: projection,
				extent: [-180.0,-90.0,180.0,90.0]
			}),

			layers: [
				new TileLayer({
					source: new OSM()
				}),

			]
		})
		mapRef.current = map;
	}


	useEffect(() => {
		initialMap();
		return () => {
			mapRef.current.setTarget(undefined);
		}
	}, [])

	// Initial Layer
	useEffect(()=>{
		mapUtils.addTileLayer(mapRef.current, "sukabumi:data_grid_from_xyz", 22, "EPSG:4326", "sidik_grid");
		// mapUtils.addVectorTileLayer(mapRef.current, "sukabumi:data_grid_from_xyz");
	},[])


	return (<>
		<div ref={mapElement} style={{ height: '100vh' }}></div>
	</>);
}

export default MapContainer