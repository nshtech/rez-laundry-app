import React, { Component } from 'react';
import { CustomerSheet } from './CustomerSheet';
import { Route } from 'react-router-dom';

export class Dashboard extends Component {
        
    render() {
        return (
           <div>
                <Route component={CustomerSheet} />
           </div>
        );
    }
}