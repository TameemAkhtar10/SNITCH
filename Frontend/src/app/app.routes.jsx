import { createBrowserRouter } from 'react-router-dom'


export const routes = createBrowserRouter([
    {
        path: "/",
        element: <h1>hello</h1>,
    },
    {
        path:'/register',
        element:<h1>register</h1>
    }
])