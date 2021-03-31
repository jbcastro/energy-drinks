import 'date-fns';
import React,{ useState, useEffect } from "react" ;
import { makeStyles } from '@material-ui/core/styles';
import InputLabel from '@material-ui/core/InputLabel';
import MenuItem from '@material-ui/core/MenuItem';
import FormControl from '@material-ui/core/FormControl';
import Select from '@material-ui/core/Select';
import Grid from '@material-ui/core/Grid';
import TextField from '@material-ui/core/TextField';
import ShowDrinks from "./ShowDrinks"

//material ui theming
const useStyles = makeStyles((theme) => ({
  formControl: {
    margin: theme.spacing(1),
    minWidth: 120,
  },
  selectEmpty: {
    marginTop: theme.spacing(2),
  },
}));

export default function SelectName(props) {
  const classes = useStyles();
//hooks for selected user, their drnks
const [selectedUser,setSelectedUser]=React.useState({})
const [userDrinks,setUserDrinks]=React.useState({})
//use a hook here because if the "ShowDrinks" component is loaded without data there is a map error
const [showDrinksComponent,setShowDrinksComponent]=React.useState(false)
//When a user is selected
  const handleChange =(e)=>{
    setSelectedUser(e.target.value)

  }
//use effect for when a user is selected. First it filters all drinks to just the ones for the chosen user, then it allows the "ShowDrinks" component to load, then sends the current user and their drinks back up to the "HomePage" component to then send to the "AddOne" component
useEffect(()=>{

const filteredDrinks = props.drinks.filter((drink)=>{
     if(drink.PersonID===selectedUser.PersonID){
   return drink
  }
})
setUserDrinks(filteredDrinks)
setShowDrinksComponent(true)
props.curUserSelect(selectedUser)
props.updateUserDrinks(filteredDrinks)
},[selectedUser])
//use effect to update the user's drinks when a new drink is added from the "AddOne" component
useEffect(()=>{
  const filteredDrinks = props.drinks.filter((drink)=>{
    if(drink.PersonID===selectedUser.PersonID){
  return drink
 }
})
setUserDrinks(filteredDrinks)
},[props.drinks])


//For adding a new name. First a hook to show the form, then a boolean to change whether the button should say "open" ior "close", then a hook to set the new name, then a function to add the new name to the database and update the "users" array in the "HomePage" component
const [newNameForm,setNewNameForm]=React.useState(false)
const openOrClose =
  newNameForm?("Close"):("Open")
const clickSetNewNameForm=()=>{
  setNewNameForm(!newNameForm)
}

const [newName,setNewName]=React.useState({})

function addName(e){
  var data = {
    full_name:newName
  }
e.preventDefault()
  fetch(`/api/addName`, {
    method: 'POST', 
    headers: {
      'Content-Type': 'application/json',
      'Accept': 'application/json'
    },
    body: JSON.stringify(data),
  })
  .then((res) => res.json())
  .then((json)=>{
   data.PersonID=json.insertId
    props.updateNames(data)
  })
  .then(setSelectedUser(data))
  .catch((error) => {
    console.error('Error:', error);
  });
}




 
    return(
      <div style={{backgroundColor:"yellow",width:"30%",display:"inline-block"}}>
        <Grid container justify="space-around">
      <FormControl className={classes.formControl}>
        <InputLabel id="demo-simple-select-label">Select User</InputLabel>
        <Select
      onChange={handleChange}
      value={selectedUser}
      
        >
     {props.users.map((name)=>(
       <MenuItem key={name.PersonID} value={name}  >{name.full_name}</MenuItem>
     ))}
        </Select>
      </FormControl>
      </Grid>
      <button onClick={clickSetNewNameForm}>{openOrClose} add a new name form</button>
      {newNameForm===true?(
        <form className={classes.root} noValidate autoComplete="off" onSubmit={addName}>
          <TextField id="standard-basic" label="Standard" field="newName" onChange={(e)=>setNewName(e.target.value)}/>
          <button type="submit">Submit</button>
        </form>
      ):(null)}
   
    
    <h1>All drink for {selectedUser.full_name}</h1>
    <br></br>
    
          {showDrinksComponent===true?(<ShowDrinks userDrinks={userDrinks} />):(null)}
      </div>
    )
  }