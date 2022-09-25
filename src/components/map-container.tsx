import { Map, View } from "ol";
import { useEffect, useRef } from "react";

import "ol/ol.css"
import TileLayer from "ol/layer/Tile";
import { OSM, WMTS } from "ol/source";

import { get as getProjection, transform, Projection } from "ol/proj"
import { getTopLeft, getWidth } from 'ol/extent';
import WMTSTileGrid from "ol/tilegrid/WMTS";

const  projection = new Projection({
code: 'EPSG:4326',
units: 'degrees',
axisOrientation: 'neu'
});

interface MapProps {
	center?: [number, number]
}
const MapContainer: React.FC<MapProps> = () => {
	const mapElement = useRef<any>(null);
	const mapRef = useRef<any>(null);

	const initialMap = () => {

		const projectionTile = "EPSG:4326";
		const projection_2 = getProjection(projectionTile);

		const projectionExtent = projection_2?.getExtent();
		const size = getWidth(projectionExtent!) / 512;
		const maxTileZoom = 22
		const resolutions = new Array(maxTileZoom);
		const matrixIds = new Array(maxTileZoom);
		for (let z = 0; z < maxTileZoom; ++z) {
			console.log(size, Math.pow(2, z))
			resolutions[z] = size / Math.pow(2, z);
			matrixIds[z] = `${projectionTile}:${z}`;
		}
		console.log(resolutions, matrixIds);

		const map = new Map({
			target: mapElement.current,
			view: new View({
				// center: transform(
				// 	[106.9202854, -6.8494057],
				// 	"EPSG:4326",
				// 	"EPSG:3857"
				// ),
				center:[106.9202854, -6.8494057],
				zoom: 13,
				projection: projection,
				extent: [-180.0,-90.0,180.0,90.0]

			}),

			layers: [
				new TileLayer({

					source: new OSM()
				}),
				new TileLayer({
					source: new WMTS({
						attributions:
							'Tiles © <a href="https://mrdata.usgs.gov/geology/state/"' +
							' target="_blank">USGS</a>',
						url: 'http://localhost:8080/geoserver/gwc/service/wmts',
						layer: 'sukabumi:data_grid_from_xyz',
						matrixSet: projectionTile,
						format: 'image/png',
						projection: projection!,
						tileGrid: new WMTSTileGrid({
							origin: getTopLeft(projectionExtent!),
							resolutions: resolutions,
							matrixIds: matrixIds,
						}),
						style: '',
						wrapX: true,
					}),
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


	return (<>
		<div ref={mapElement} style={{ height: '100vh' }}></div>
	</>);
}

export default MapContainer