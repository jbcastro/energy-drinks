import 'date-fns';
import React,{ useState, useEffect,useRef } from "react" ;
import CircularUnderLoad from "./Loading"
import { makeStyles } from '@material-ui/core/styles';
import InputLabel from '@material-ui/core/InputLabel';
import MenuItem from '@material-ui/core/MenuItem';
import FormHelperText from '@material-ui/core/FormHelperText';
import FormControl from '@material-ui/core/FormControl';
import Select from '@material-ui/core/Select';
import Grid from '@material-ui/core/Grid';
import DateFnsUtils from '@date-io/date-fns';
import {
  MuiPickersUtilsProvider,
  KeyboardTimePicker,
  KeyboardDatePicker,
} from '@material-ui/pickers';
import TextField from '@material-ui/core/TextField';

//theme for material UI
const useStyles = makeStyles((theme) => ({
  formControl: {
    margin: theme.spacing(1),
    minWidth: 120,
  },
  selectEmpty: {
    marginTop: theme.spacing(2),
  },
  root: {
    '& > *': {
      margin: theme.spacing(1),
      width: '25ch',
    },
  },
}));
export default function AddOne(props){
  const classes = useStyles();
  let userDrinks = props.userDrinks

  //hooks for selecting a date for drinks already entered, then returning what drinks and how many ounces
  const [selectedDateEntered, setSelectedDateEntered] = React.useState(new Date());
  const [drinkByDate,setDrinkByDate]=React.useState()
  const [totalOzByDate,setTotalOzByDate]=React.useState()

  //when a date is selected this filters all drinks to just the drinks for said day, and add up the amount of drinks and ounces
  const handleDateChangeEntered = (date) => {
    var n=date.toLocaleDateString();
    var dateObject = new Date(n)
    setSelectedDateEntered(dateObject)
    const filteredDrinks = userDrinks.filter((drink)=>
      new Date(drink.dateAdded).getFullYear()==new Date(dateObject).getFullYear()&&
      new Date(drink.dateAdded).getMonth()==new Date(dateObject).getMonth()&&
      new Date(drink.dateAdded).getDate()==new Date(dateObject).getDate()
          )
    setDrinkByDate(filteredDrinks)
    let count =0
    filteredDrinks.forEach((e)=>{
      count = count + Number(e.drink_oz)
    })
    setTotalOzByDate(count)
  };

  //hooks for what will be saved to the DB when the form is submitted
  const [drinkAndOzAndNameForSubmit,setDrinkAndOzAndNameForSubmit]=React.useState({
    drink_name:{},
    drink_oz:{},
    PersonID:props.curUser.PersonID,
    dateAdded:{}
  
  })
  useEffect(()=>{
    //when the user is changed this allows the date to stay the same and updates the drinks for the new user chosen
    setDrinkAndOzAndNameForSubmit({...drinkAndOzAndNameForSubmit,PersonID:props.curUser.PersonID})
    if(userDrinks.length>0){
        const filteredDrinks = userDrinks.filter((drink)=>
          new Date(drink.dateAdded).getFullYear()==new Date(selectedDateEntered).getFullYear()&&
          new Date(drink.dateAdded).getMonth()==new Date(selectedDateEntered).getMonth()&&
          new Date(drink.dateAdded).getDate()==new Date(selectedDateEntered).getDate()
              )
        setDrinkByDate(filteredDrinks)
        let count =0
        filteredDrinks.forEach((e)=>{
          count = count + e.drink_oz
        })
        setTotalOzByDate(count)
    }else{
      setDrinkByDate()
    }
   },[props.curUser,userDrinks])
  


  //this is the second calender in the add a drink form. It allows the date to be set so it can save to the DB
  const [selectedDateNew, setSelectedDateNew] = React.useState(new Date().toLocaleDateString());

  const handleDateChangeNew = (date) => {
    setSelectedDateNew(date);
    
  };
  //changes the date for data to be saved when the calender changes
  useEffect(()=>{
    setDrinkAndOzAndNameForSubmit({...drinkAndOzAndNameForSubmit,dateAdded:selectedDateNew})
  },[selectedDateNew])
  


   //changes the date for data to be saved when the user changes
useEffect(()=>{
  setDrinkAndOzAndNameForSubmit({...drinkAndOzAndNameForSubmit,PersonID:props.curUser.PersonID})
},[props.users])

//when a new drink name gets added this changes the data to be saved
const handleChange =(e,f)=>{
  setDrinkAndOzAndNameForSubmit({...drinkAndOzAndNameForSubmit,[f]:e.target.value})
}



//filter out duplicates to get a dropdown list for all the drink names and ounces
let allDrinkNamesDuplicates =[]
let allDrinkOzDuplicates =[]
props.drinks.forEach((e)=>{
  allDrinkNamesDuplicates.push(e.drink_name)
  allDrinkOzDuplicates.push(e.drink_oz)
})
let allDrinkNames=[...new Set(allDrinkNamesDuplicates)]
let allDrinkOz =[...new Set(allDrinkOzDuplicates)]


  //show/hide add drink and add name form
const [showAddForm,setShowAddForm]=React.useState(false)
const handleExpandClick = ()=>{
  setShowAddForm(!showAddForm)
 
}

//the fetch to save the data
function addEntry(e){
//change date format to equal that of mySql
  var pad = function(num) { return ('00'+num).slice(-2) };
  var date =drinkAndOzAndNameForSubmit.dateAdded
  date = date.getUTCFullYear()         + '-' +
        pad(date.getUTCMonth() + 1)  + '-' +
        pad(date.getUTCDate())       + ' ' +
        pad(date.getUTCHours())      + ':' +
        pad(date.getUTCMinutes())    + ':' +
        pad(date.getUTCSeconds());
  var data={
    drink_name:drinkAndOzAndNameForSubmit.drink_name,
    drink_oz:drinkAndOzAndNameForSubmit.drink_oz,
    PersonID:drinkAndOzAndNameForSubmit.PersonID,
    dateAdded:date

   
  }
//to alert when a part of the form is not filled out.
  if(Object.keys(data.drink_name).length==0){
    alert("enter a drink name!")
  }else if(isNaN(data.drink_oz)){
    //when the oz is a number is still thinks it is empty, however in the custom input of ounces it converts it to a strings. This checks if it is empty at either a string or number
    if(Object.keys(data.drink_oz).length==0){
      alert("enter a drink oz")
    }
  }
  else if(!data.PersonID){
    alert("select a user!")
  }
  else{
  e.preventDefault()
  fetch(`/api/addEntry`, {
    method: 'POST', 
    headers: {
      'Content-Type': 'application/json',
    },
    body: JSON.stringify(data),
  })
  .then((res) => res.json())
  .then((json)=>{
   data.DrinkID=json.insertId
   //sends the new drink to the home page to update the state theer
    props.updateDrinks(data)
    
    
  })
  
  .catch((error) => {
    console.error('Error:', error);
  });
  }

}
//changes the name on the open/close add form button
const openOrClose =
showAddForm?("Close"):("Open")

    return(
        <div style={{float:"right", display:"inline-block",backgroundColor:"coral",width:"50%"}} >
          <div style={{float:"left"}}>
    <MuiPickersUtilsProvider utils={DateFnsUtils}>
      <KeyboardDatePicker
          disableToolbar
          variant="inline"
          format="MM/dd/yyyy"
          margin="normal"
          id="date-picker-inline1"
          label="Select day to view entries"
          value={selectedDateEntered}
          onChange={handleDateChangeEntered}
          KeyboardButtonProps={{
            'aria-label': 'change date',
          }}
        />
      </MuiPickersUtilsProvider>
     
      {drinkByDate?(
             drinkByDate.map(function(d){
              return(
                  <li key={d.DrinkID} >
                      Name:{d.drink_name}<br></br>
                      Date Drank:{d.dateAdded.split('T')[0]}<br></br>
                   
                      Ounces:{d.drink_oz}
                      </li>
                  )
              })
          
      ):(null)}
      <br></br>
          {drinkByDate?(
            <p>
             {props.curUser.full_name} drank {drinkByDate.length} energy drinks for a total of {totalOzByDate} oz on {selectedDateEntered.toDateString()}</p>
          ):(null)}
 

 </div>
     <button onClick={handleExpandClick}>{openOrClose} add a drink form</button>
     <div style={{float:"right"}}>
     {showAddForm===true?(
       
       <div>
 
      
    
      

      <FormControl className={classes.formControl}>
        <InputLabel id="demo-simple-select-label">Choose Drink</InputLabel>
        <Select
          labelId="demo-simple-select-label"
          id="demo-simple-select"
          value={drinkAndOzAndNameForSubmit.drink_name}
          // defaultValue={drinkAndOzAndNameForSubmit.drink_name}
          onChange={((e)=>handleChange(e,"drink_name"))}
        >
          {userDrinks?(
            allDrinkNames.map((drink)=>(
              <MenuItem value={drink}>{drink}</MenuItem>
            ))
          ):(null)}
          
        </Select>
      </FormControl>
      <form className={classes.root} noValidate autoComplete="off" >
          <TextField id="standard-basic" label="Or add a new name" field="newDrinkName" onChange={((e)=>handleChange(e,"drink_name"))} />
         
        </form>
      
      
 
     
      
      <FormControl className={classes.formControl}>
        <InputLabel id="demo-simple-select-label">Choose Oz</InputLabel>
        <Select
          labelId="demo-simple-select-label"
          id="demo-simple-select"
          value={drinkAndOzAndNameForSubmit.drink_oz}
          onChange={((e)=>handleChange(e,"drink_oz"))}
        >
          {userDrinks?(
            allDrinkOz.map((drink)=>(
              <MenuItem value={drink} key={drink}>{drink}</MenuItem>
            ))
          ):(null)}
        </Select>
      </FormControl>
      
      <form className={classes.root} noValidate autoComplete="off" >
          <TextField id="standard-basic" label="Or add a new Oz" type="number" field="newDrinkOz" onChange={((e)=>handleChange(e,"drink_oz"))} />
         
        </form>

         <MuiPickersUtilsProvider utils={DateFnsUtils}>
      <KeyboardDatePicker
          disableToolbar
          variant="inline"
          format="MM/dd/yyyy"
          margin="normal"
          id="date-picker-inline1"
          label="Select day drink was consumed"
          value={selectedDateNew}
          onChange={handleDateChangeNew}
          KeyboardButtonProps={{
            'aria-label': 'change date',
          }}
        />
      </MuiPickersUtilsProvider>
      <br></br>
      <button onClick={addEntry}>Add Drink!</button>
         </div>
         
       ):(
         null
         )}
         
         </div>
         
        </div>
    )
}