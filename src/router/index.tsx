import { lazy, Suspense } from "react";
const Loader = (Component:any) => (props:any) => (
	<Suspense fallback={<>Loading</>}>
		<Component {...props}/>
	</Suspense>
)
const Map = lazy(()=>import("../container/map"));
const MultiMap = lazy(() => import("@/container/multi-map"));
const router = [
	{
		path: "/",
		element: <Map />
	},
	{
		path: "/compare",
		element: <MultiMap/>
		
	}
]

export default router;

