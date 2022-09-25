import { lazy, Suspense } from "react";
const Loader = (Component:any) => (props:any) => (
	<Suspense fallback={<>Loading</>}>
		<Component {...props}/>
	</Suspense>
)
const Map = lazy(()=>import("../container/map"));
const router = [
	{
		path: "/",
		element: <Map />
	}
]

export default router;

