import React from 'react'
import Home from './pages/Home.jsx'
import getCurrentUser from './features/getCurrentUser.js'
import { useEffect } from 'react'
import { setUserData } from './redux/userSlice.js'
import { useDispatch } from 'react-redux'
function App() {
  const dispatch=useDispatch()
  useEffect(()=>{
    const getUser=async ()=>{
      const data=await getCurrentUser()
      dispatch(setUserData(data))
    }
    getUser()
  },[])
  return (
    <>
      <Home />
    </>
  )

}

export default App
