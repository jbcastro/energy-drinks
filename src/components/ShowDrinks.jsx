import React,{ useState, useEffect } from "react" 
export default function ShowDrinks(props){

    const drinks =props.userDrinks.map(function(d){
                return(
            <li key={d.DrinkID} >
                Name: {d.drink_name}<br></br>
                Date Drank: {d.dateAdded.split(' ')[0]}<br></br>
                Ounces:{d.drink_oz}
                </li>
        )
    })
  
    return(
        <div>
            
        {drinks}
        </div>
    )
}