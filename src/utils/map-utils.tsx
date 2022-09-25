import Map from "ol/Map";
import TileLayer from "ol/layer/Tile";
import SourceTileWMS from "ol/source/TileWMS";
import { Vector as VectorLayer, VectorTile as VectorTileLayer } from "ol/layer";
import { Vector as VectorSource, TileArcGISRest, VectorTile as VectorTileSource } from "ol/source";
import { Feature, View } from "ol";
import { Point } from "ol/geom";
import { transform } from "ol/proj";
import { KML as FormatKML, WMSCapabilities, MVT } from "ol/format";
import axios from "axios";
import { Extent } from "ol/extent";
import { createXYZ } from "ol/tilegrid"
import { Style, Fill as styleFill, Stroke as styleStroke } from "ol/style"

type TypeLocation = {
	latitude: string | null;
	longitude: string | null;
};
export default class MapUtils {
	addWms(
		map: Map,
		url: string,
		layerName: string,
		layerTitle: string,
		layerOpacity: number,
		layerVisible: boolean,
		style?: string
	): void {
		let default_style = "generic";
		if (style != null) {
			default_style = style;
			console.log("style", style);
		}
		console.log(layerName);
		const source = new SourceTileWMS({
			url: url,
			params: {
				layers: layerName,
				tiled: true,
				styles: default_style,
			},
			serverType: "geoserver",
			crossOrigin: "anonymous",
		});

		const layer = new TileLayer({
			source: source,
			visible: layerVisible,
			// zIndex: 99,
		});
		layer.set("code", layerName);
		layer.set("title", layerTitle);

		console.log("adding layer", layer.get("code"));

		map.addLayer(layer);
	}

	addRestLayer(map: Map, url: string): void {
		const source = new TileArcGISRest({
			url: url,
			crossOrigin: "anonymous",
		});
		const tileLayer = new TileLayer({
			source: source,
		});
		map.addLayer(tileLayer);
	}

	addVectorLayer(
		map: Map,
		rndlayerid: number | string,
		code: string,
		title: string,
		visible: boolean,
		sorted: number
	): void {
		const layerSource = new VectorSource();
		const layerVector = new VectorLayer({
			source: layerSource,
			visible: visible,
			zIndex: sorted,
		});
		layerVector.set("code", code);
		layerVector.set("title", title);
		layerVector.set("tipe", "VECTOR");

		map.addLayer(layerVector);
	}


	addVectorTileLayer(map: Map, code: string) {
		const code_epsg = "EPSG:900913";
		const url = `http://localhost:8080/geoserver/gwc/service/tms/1.0.0/${code}@${code_epsg}@pbf/{z}/{x}/{-y}.pbf`
		const vectorTileLayer = new VectorTileLayer({
			style: function (feature) {
				return new Style({
					fill: new styleFill({
						color: '#ADD8E6'
					}),
					stroke: new styleStroke({
						color: '#880000',
						width: 1
					})
				});
			},
			source: new VectorTileSource({
				// tilePixelRatio: 1, // oversampling when > 1
				tileGrid: createXYZ({ maxZoom: 19 }),
				format: new MVT(),
				url: url,
			})
		})
		vectorTileLayer.set("id", code);
		map.addLayer(vectorTileLayer)
	}

	zoomToExtent(map: Map, extent: []): void {
		map.getView().fit(extent);
	}

	zoomLayerToExtent(map: Map, layer: any): void {
		const wms_url =
			"http://localhost:8080/geoserver/wms?service=wms&version=1.1.1&request=GetCapabilities";
		const parser = new WMSCapabilities();
		console.log("layer", layer);
		axios.get(wms_url).then((res) => {
			const data = parser.read(res.data);
			const layers = data?.Capability?.Layer?.Layer;

			const layer_filter = layers?.filter(
				(l: any) => l.Name === `kotabogor:${layer.get("code")}`
			)[0];
			console.log(layer_filter);

			if (layer_filter) {
				const bbox = layer_filter?.LatLonBoundingBox;
				map.getView().fit(bbox);
			}
		});
	}

	findLayerBy(layer: any, key: string, value: string): any {
		if (layer.get(key) === value) {
			return layer;
		}

		if (layer.getLayers) {
			const layers = layer.getLayers().getArray();
			const len = layers.length;
			let result;
			for (let i = 0; i < len; i++) {
				result = this.findLayerBy(layers[i], key, value);
				if (result) {
					return result;
				}
			}
		}

		return null;
	}

	generatePoint(props: TypeLocation, view: View): boolean | Feature {
		const feature = new Feature(props);

		if (props.latitude == null && props.latitude == null) {
			console.log("kordinat salah");
			return false;
		} else {
			const coordinate = transform(
				[parseFloat(props.latitude), parseFloat(props.latitude)],
				"EPSG:4326",
				"EPSG:3857"
			);
			view.animate({
				center: coordinate,
				duration: 2000,
			});
			if (!isNaN(coordinate[0]) && !isNaN(coordinate[1])) {
				const geometry = new Point(coordinate);
				feature.setGeometry(geometry);
				return feature;
			}
		}
		return false;
	}

	generateLegend(code: string): HTMLElement {
		const legend = document.createElement("div");
		legend.className = "legend";
		legend.innerHTML = `<div class="legend-title">${code}</div>`;
		return legend;
	}

	convertDDToDMS(D: number, lng: number): object {
		const M = 0 | ((D % 1) * 60e7);

		return {
			dir: D < 0 ? (lng ? "W" : "S") : lng ? "E" : "N",
			deg: 0 | (D < 0 ? (D = -D) : D),
			min: 0 | (M / 1e7),
			sec: (0 | (((M / 1e6) % 1) * 6e4)) / 100,
		};
	}

	addKmlToMap(map: Map, loc_file: string) {
		const extension = loc_file.split(".").pop();
		let format = new FormatKML();
		if (extension == "kml") {
			format = new FormatKML();
		}
		const kml_layer = new VectorLayer({
			source: new VectorSource({
				url: loc_file,
				format: format,
			}),
		});
		console.log(kml_layer);
		map.addLayer(kml_layer);

		setTimeout(() => {
			const extent: Extent | undefined = kml_layer.getSource()?.getExtent();
			map.getView().fit(extent!);
		}, 5000);
	}
}
