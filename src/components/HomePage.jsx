import React,{ useState, useEffect } from "react" ;
import CircularUnderLoad from "./Loading"
import SelectName from "./SelectName"
import AddOne from "./AddOne";






export function HomePage() {

  //hooks for all the users, all the drinks, and for it not to load before data is fetched
  const [users,setUsers]=React.useState({})
  const [drinks,setDrinks]=React.useState({})
  const [loaded,setLoaded]=React.useState(false)
  useEffect(()=>{
    if(Object.keys(users).length!==0&&Object.keys(drinks).length!==0){
      setLoaded(true)
    }
   },[users,drinks])

  //querying the database for users and drinkns and loading it all into the frontend
  function getUsers() {
    fetch(`/api/users`)
    .then((response) => response.json())
    .then(users => setUsers(users))
    
  }
  function getDrinks() {
    fetch(`/api/drinks`)
    .then((response) => response.json())
    .then(drinks => setDrinks(drinks))
    
  }

  //goes to the "SelectName" component for when a user is selected and their drinks are filtered
  const[curUser,setCurUser]=React.useState({})
  const[userDrinks,setUserDrinks]=React.useState({})
  const curUserSelect =(e)=>{
    setCurUser(e)
    
  }
  //updates users, current user, and drinks when a name or drink gets added. On front end so another databse query is not needed
const updateNames =(e)=>{
  setUsers(prevArray=>[...prevArray,e])
  setCurUser(e)
}
const updateDrinks=(e)=>{
  setDrinks(prevArray=>[...prevArray,e])
  setUserDrinks(prevArray=>[...prevArray,e])
}
//gets the drinks that have been filtered in the "SelectName" component for each user and sends the data to the "AddOne component". Without it when a new user is added the old selected user's daily information is still showing
const updateUserDrinks=(e)=>{
  setUserDrinks(e)
}




//when page is loaded it queries the database to get 
useEffect(()=>{
  {getUsers()}
  {getDrinks()}

},[])

//will not load unless data has been fetch to prevent array mapping errors
  return loaded===true? (
    <div>
      
      
      <SelectName
      users={users}
      drinks={drinks}
      updateNames={updateNames}
      curUserSelect={curUserSelect}
      updateUserDrinks={updateUserDrinks}
      />
      <AddOne 
      curUser={curUser} 
      userDrinks={userDrinks} 
      drinks={drinks} 
      updateDrinks={updateDrinks}
      users={users}
      />
    </div>
  ):(
    <div>
      
    
    <CircularUnderLoad/>
    
  </div>
  )
}