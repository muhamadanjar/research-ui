import MapContainer from "@/components/map-container";
import { Layer } from "@/core/interface";
import Projection from "ol/proj/Projection";
import View from "ol/View";
import { useEffect, useRef, useState } from "react";

const MultiMap: React.FC = () => {
	const projection = new Projection({
		code: 'EPSG:4326',
		units: 'degrees',
		axisOrientation: 'neu'
	});
	const view = new View({
		center: [106.9202854, -6.8494057],
		// center: transform([106.9202854, -6.8494057], "EPSG:4326", "EPSG:3857"),
		zoom: 6,
		minZoom: 5,
		maxZoom: 12,
		projection: projection,
		extent: [-180.0, -90.0, 180.0, 90.0]
	})
	const [layers] = useState<Layer[]>([
		{
			url: import.meta.env.GEOSERVER_URL,
			code: "sidik:data_grid_from_xyz",
			name: "Grid",
			is_active: true,
			type: "wmts"
		},
	])
	const [layers_tiff] = useState<Layer[]>([
		{
			url: import.meta.env.GEOSERVER_URL,
			code: "sidik:sd",
			name: "Grid TIFF Indonesia",
			is_active: true,
			type: "wmts"
		},
	])

	return (
		<>
			<header>

			</header>
			<main>

				<div className="grid grid-cols-2 gap-4">
					<MapContainer className="w-full h-300" mapHeight="300px" mapView={view} layers={layers} />
					<MapContainer className="w-full h-300" mapHeight="300px" mapView={view} layers={layers_tiff} />
					<MapContainer className="w-full h-300" mapHeight="300px" mapView={view} layers={layers_tiff} />
					<MapContainer className="w-full h-300" mapHeight="300px" mapView={view} layers={layers} />
				</div>
			</main>
		</>
	)
}

export default MultiMap;