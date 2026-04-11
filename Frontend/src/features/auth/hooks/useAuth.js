import { seterror,setloading,setuser } from "../state/auth.slice";
import { register } from "../services/auth.sevice";

export const useAuth = () => {
    const dispatch = useDispatch()
    const handlerregister = async({email,password,contact,fullname,isSeller})=>{
        try {
            dispatch(setloading(true))
            const response = await register({email,password,contact,fullname,isSeller})
            dispatch(setuser(response.data))
            dispatch(setloading(false))
        } catch (error) {
            dispatch(seterror(error.response.data.message))
            dispatch(setloading(false))
        }
    }
    return {handlerregister}
}