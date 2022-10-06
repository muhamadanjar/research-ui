import MapContainer from "@/components/map-container";
import { Layer } from "@/core/interface";
import { Box, Card } from "@mui/material";
import { useState } from "react";

const Map: React.FC = () => {
  const [info, setInfo] = useState<any>(null)
  const [layers, setLayers] = useState<Layer[]>([{
    url: import.meta.env.GEOSERVER_URL,
    code: "sukabumi:data_grid_from_xyz",
    name: "Grid Indonesia",
    is_active: true,
    type: "wmts"
  }])


  return (<>
    <Box sx={{ height: '100%' }}>
      <MapContainer callbakInfo={setInfo} layers={layers} />
    </Box>
    <Card sx={{ position:"absolute", bottom:0, width:300}}>
      <Box sx={{ p:2, display: "flex", justifyContent:"space-between", alignItems:"center" }}>

        <table className="table mx-auto">
          <thead>
            <tr>
              <th className="uppercase">Key</th>
              <th className="uppercase">Value</th>
            </tr>
          </thead>
          <tbody>

            {info &&
              info.map((item: any, idx: number) => (
                <>
                  <tr key={idx} className="bg-slate-500 mx-auto text-center font-semibold uppercase sticky">
                    <td colSpan={2}>{item.keys.split(".")[0]}</td>
                  </tr>
                  {item.items.map((info: any, index: number) => (<>
                    <div className="mt-2"></div>
                    <tr key={index}>
                      <td className="font-bold">{info.key}</td>
                      <td>{info.value}</td>
                    </tr>
                  </>))}
                </>
              ))}
          </tbody>
        </table>
      </Box>
    </Card>
  </>)
}
export default Map;