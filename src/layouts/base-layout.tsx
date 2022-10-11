import { Box } from "@mui/material"
import { ReactNode } from "react";
import { Outlet } from "react-router-dom";
interface BaseLayoutProps {
	children?:ReactNode
}
const BaseLayout:React.FC<BaseLayoutProps> = ({children}) => {
	return (
		<>
			<Box>
				{children || <Outlet/>}
			</Box>
		</>
	)
}

export default BaseLayout;