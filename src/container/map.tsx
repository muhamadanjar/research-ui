import MapContainer from "@/components/map-container";
import { Box, AppBar, Toolbar, IconButton, Typography } from "@mui/material";
import MenuIcon from '@mui/icons-material/Menu';

const Map: React.FC = () => {
  return (<>
    <Box sx={{ flexGrow: 1 }}>
      <AppBar position="fixed">
        <Toolbar variant="dense">
          <IconButton edge="start" color="inherit" aria-label="menu" sx={{ mr: 2 }}>
            <MenuIcon />
          </IconButton>
          <Typography variant="h6" color="inherit" component="div">
            Photos
          </Typography>
        </Toolbar>
      </AppBar>
    </Box>
    <Box sx={{ height: '100%', marginTop: '4%' }}>
      <MapContainer />
    </Box>
  </>)
}
export default Map;