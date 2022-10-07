import MapContainer from "@/components/map-container";
import { Layer } from "@/core/interface";
import { AppBar, Box, Card, Container, Stack, Toolbar } from "@mui/material";
import { useState } from "react";
import cn from "classnames"
import { styled } from "@mui/material";

const HeaderWrapper = styled(Box)(({ theme }) => `
  backdrop-filter: blur(3px);
  position: fixed;
  justify-content: space-between;
  width: 100%;
  right: 0;
  z-index: 6;
`)

const Header = () => {
  return (
  <HeaderWrapper display={'flex'} alignItems="center">
    <Stack direction="row" alignItems="center"></Stack>
    <Box display="flex" alignItems="center">

    </Box>
  </HeaderWrapper>
  )
}


const Map: React.FC = () => {
  const [info, setInfo] = useState<any>(null)
  const [showSidebar, setShowSidebar] = useState<boolean>(true);
  const [currentZoom, setCurrentZoom] = useState(13);
  const [layers, setLayers] = useState<Layer[]>([
    {
    url: import.meta.env.GEOSERVER_URL,
    code: "sidik:data_grid_from_xyz",
    name: "Grid Indonesia",
    is_active: true,
    type: "wmts"
    },
])


  return (<>
    <Box sx={{ display: 'flex', height: '100%', }}>
      {/* Header */}
      <Header />

      <MapContainer className="w-full h-fit" callbakInfo={setInfo} layers={layers} />
      <Card sx={{ position: "absolute", zIndex: 7, bottom: 0, right: 0, width: 300 }}>
        <Box sx={{ p: 2, display: "flex", justifyContent: "space-between", alignItems: "center" }}>

          <span>
            {currentZoom}
          </span>
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
    </Box>
  </>)
}
export default Map;