import { Map, MapBrowserEvent, View } from "ol";
import { useEffect, useRef, useState } from "react";

import "ol/ol.css"
import TileLayer from "ol/layer/Tile";
import { OSM, TileWMS as TileWMSSource, WMTS as WMTSSource, XYZ } from "ol/source";

import cn from "classnames";
import { Projection, transform } from "ol/proj"
import MapUtils from "@/utils/map-utils";
import http from "@/utils/api/http";
import { Layer } from "@/core/interface";

const projection = new Projection({
	code: 'EPSG:4326',
	units: 'degrees',
	axisOrientation: 'neu'
});
const mapUtils = new MapUtils();

interface MapProps {
	center?: [number, number],
	layers?: Layer[],
	className?: string;
	mapClassName?: string;
	callbakInfo?: any;
	mapView?: View,
	mapHeight?: string;
}
const MapContainer: React.FC<MapProps> = ({ layers, callbakInfo, className, mapClassName="h-fit w-full", mapView, mapHeight = "100vh" }) => {
	const mapElement = useRef<any>(null);
	const mapRef = useRef<any>(null);
	const [stateInfo, setStateInfo] = useState<any>([]);

	const initialMap = () => {
		let view;		
		if(!mapView){
			view = new View({
				center: [106.9202854, -6.8494057],
				// center: transform([106.9202854, -6.8494057], "EPSG:4326", "EPSG:3857"),
				zoom: 6,
				minZoom: 5,
				maxZoom: 12,
				projection: projection,
				extent: [-180.0, -90.0, 180.0, 90.0]
			})
		}else{
			view = mapView
		}
		const map = new Map({
			target: mapElement.current,
			view: view,

			layers: [
				new TileLayer({
					source: new OSM()
				}),

			]
		})
		mapRef.current = map;
	}

	const onMapClick = async (event: MapBrowserEvent<any>) => {
		console.log("map element", mapElement.current)
		setStateInfo([]);


		const pixel = event.pixel;
		const map = mapRef.current;
		let resolution = map?.getView().getResolution();
		let projection = map?.getView().getProjection();
		let features = map?.forEachFeatureAtPixel(pixel, function (feature: any, layer: any) {
			console.log(layer);
			return feature;
		});
		if (features) {
		} else {
			const layers_array: any = map?.getLayers().getArray();
			const visibleLayer = layers_array.filter(function (layer: any) {
				const source = layer.getSource();
				console.log("layer source", source);
				if (source instanceof TileWMSSource) {
					layer.set("type", "wms")
					if (layer.getVisible()) {
						return true;
					}
				} else if (source instanceof WMTSSource) {
					layer.set("type", "wmts")
					if (layer.getVisible()) {
						return true;
					}
				}
			});
			let lyrInfo = visibleLayer.map((item: any) => {
				if (item.get("id") != "basemap") {
					return item.get("code");
				}
			});
			console.log("info layer", lyrInfo);
			console.log(visibleLayer);
			for (let idx = 0; idx < visibleLayer.length; idx++) {
				const layer = visibleLayer[idx];
				console.log("layer info", layer);
				let url = "";
				if (layer.get("type") == 'wms') {
					url = layer
						.getSource()
						.getFeatureInfoUrl(event.coordinate, resolution, projection, {
							INFO_FORMAT: "application/json",
							QUERY_LAYERS: layer.get("code"),
							LAYERS: layer.get("code"),
							FEATURE_COUNT: 20,
						});

				} else {
					url = layer.getSource().getUrls()[0]
					let source = layer.getSource();
					let tilegrid = source.getTileGrid();
					let resolution = mapRef.current.getView().getResolution();
					let tileResolutions = tilegrid.getResolutions();
					let zoomIdx: any, diff = Infinity;
					for (var i = 0; i < tileResolutions.length; i++) {
						var tileResolution = tileResolutions[i];
						var diffP = Math.abs(resolution - tileResolution);
						if (diffP < diff) {
							diff = diffP;
							zoomIdx = i;
						}
						if (tileResolution < resolution) {
							break;
						}
					}
					var tileSize = tilegrid.getTileSize(zoomIdx);
					var tileOrigin = tilegrid.getOrigin(zoomIdx);

					var fx = (event.coordinate[0] - tileOrigin[0]) / (resolution * tileSize[0]);
					var fy = (tileOrigin[1] - event.coordinate[1]) / (resolution * tileSize[1]);
					var tileCol = Math.floor(fx);
					var tileRow = Math.floor(fy);
					var tileI = Math.floor((fx - tileCol) * tileSize[0]);
					var tileJ = Math.floor((fy - tileRow) * tileSize[1]);
					var matrixIds = tilegrid.getMatrixIds()[zoomIdx];
					var matrixSet = source.getMatrixSet();


					let params = new URLSearchParams({
						SERVICE: "WMTS",
						REQUEST: "GetFeatureInfo",
						INFOFORMAT: "application/json",
						LAYER: source.getLayer(),
						TILEMATRIXSET: matrixSet,
						TILEMATRIX: matrixIds,
						TileCol: tileCol.toFixed(),
						TileRow: tileRow.toString(),
						I: tileI.toFixed(),
						J: tileJ.toFixed()
					})
					url = url.concat('?' + params.toString());
					console.log(url);

				}

				if (url) {

					const response = await http.get(url);

					const json = response.data

					const dataCount = json.numberReturned;
					if (json.features) {

						let groupFeature: any = [];
						for (let idx = 0; idx < json.features.length; idx++) {
							const element: any = json.features[idx];
							console.log("element data", element);
							const elementDataKey = `data-${element.id}`;
							console.log(elementDataKey);
							let items = []
							for (let key in element.properties) {
								let value = element.properties[key];
								items.push({ key: key, value: value });
								console.log(key, value);
							}
							groupFeature.push({ keys: elementDataKey, items: items });
							// groupFeature["items"] = items;
						}
						setStateInfo(groupFeature);

						callbakInfo(groupFeature);
					}

				}
			}

		}
		console.log(pixel, resolution, projection);
	};


	useEffect(() => {
		initialMap();
		return () => {
			mapRef.current.setTarget(undefined);
		}
	}, [])

	// Initial Layer
	useEffect(() => {
		layers?.map(function (layer) {
			console.log("layer", layer);
			if (layer.type == "wmts") {
				mapUtils.addTileLayer(mapRef.current, layer.code, 22, "EPSG:4326", layer.styles);
			} else {
				mapUtils.addWms(
					mapRef.current!,
					`${import.meta.env.VITE_GEOSERVER_URL}`,
					layer.code,
					layer.name,
					1,
					true,
					layer.styles
				);
			}
		});
		mapRef.current.on('moveend', function () {
			var view = mapRef.current.getView();
			console.log("zoom level", view.getZoom());
			// setCurrentZoom(view.getZoom())
		}, this);
		mapRef.current?.on("click", onMapClick);
		console.log("map view", mapView);
	}, [])


	return (<>
		<div className={cn("relative", className)}>

			<div ref={mapElement} id="mapElement" className={cn(mapClassName)} style={{ width:'100%', height: mapHeight }}></div>
		</div>
	</>);
}

export default MapContainer