import React from 'react';
import logo from './logo.svg';
import './App.css';

const customers = {
  "title": "RezLaundry Customers 2019-2020"
  "users": {
    {
      "id": "001"
      "name": "Caroline Lobel"
      "phone": "2015551111"
      "laundry-status": "picked up" 
    }
    {
      "id": "002"
      "name": "Patrice Power"
      "phone": "3055551111"
      "laundry-status": "being cleaned" 
    }
    {
      "id": "003"
      "name": "Willie Wildcat"
      "phone": "9735551111"
      "laundry-status": "delivered" 
    }
    {
      "id": "004"
      "name": "Morty Shapiro"
      "phone": "9175551111"
      "laundry-status": "picked up" 
    }
    {
      "id": "005"
      "name": "Sophie Fields"
      "phone": "2017771111"
      "laundry-status": "being cleaned" 
    }
    {
      "id": "006"
      "name": "Zoe Lobel"
      "phone": "2015551111"
      "laundry-status": "picked up" 
    }
    {
      "id": "007"
      "name": "Ally Smith"
      "phone": "9145557777"
      "laundry-status": "delivered" 
    }
    {
      "id": "008"
      "name": "Sam Smith"
      "phone": "6465551111"
      "laundry-status": "picked up" 
    }
    {
      "id": "009"
      "name": "John Green"
      "phone": "6465557777"
      "laundry-status": "picked up" 
    }
    {
      "id": "010"
      "name": "Robert Schmidt"
      "phone": "8475559999"
      "laundry-status": "delivered" 
    }

  }
}

function App() {
  return (
    <div className="App">
      <header className="App-header">
        <img src={logo} className="App-logo" alt="logo" />
        <p>
          Edit <code>src/App.js</code> and save to reload.
        </p>
        <a
          className="App-link"
          href="https://reactjs.org"
          target="_blank"
          rel="noopener noreferrer"
        >
          Learn React
        </a>
      </header>
    </div>
  );
}

export default App;
