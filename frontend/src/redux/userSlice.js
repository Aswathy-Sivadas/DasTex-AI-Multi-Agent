import {createSlice} from "@reduxjs/toolkit"
const userSlice= createSlice({
    //slice-> all the usercmponent,(1slice) eveyrhting are slice here
    name:"user",
    initialState: {
        userData:null
    },
    reducers:{//reducser-> all the setter functions 
        setUserData:(state,action)=>{
            //action -> setUserData("yudsuei->action"),state-> to access the state variable
            state.userData=action.payload
        }
    }

})

// userSlice.actions = {
//     setUserData
// }

export const {setUserData}=userSlice.actions
export default userSlice.reducer