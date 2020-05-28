import React, { Component } from 'react';
import { Button } from 'primereact/button';
import { DataTable } from 'primereact/datatable';
import { Column } from 'primereact/column';

import firebase from 'firebase/app';
import 'firebase/database';


import customerData from '../customers.json'
// import classNames from 'classnames';

import '../Dashboard.css';
//import { arrayToHash } from '@fullcalendar/core/util/object';


export class BagTracker extends Component {

    constructor() {
        super();

        this.state = {
            customers: customerData
        };
        this.export = this.export.bind(this);
    }

    statusBodyTemplate(rowData) {
        return <span className={rowData.laundrystatus}>{rowData.laundrystatus.replace(/-/g, ' ')}</span>;
    }

    export() {
        this.dt.exportCSV();
    }
    render() {
        const customerArray = [];
        firebase.database().ref('/customers').on('value', function (snapshot) {
            snapshot.forEach(function (childSnapshot) {
                customerArray.push(childSnapshot.toJSON());
            });
        });


        var header = <div style={{ textAlign: 'left' }}>
            <Button type="button" icon="pi pi-external-link" iconPos="left" label="CSV" onClick={this.export}>
            </Button>
        </div>;
        return (
            <div>

                <div className="card">

                    <h1 style={{ fontSize: '16px' }}>Customer Database</h1>
                    <DataTable value={customerArray} header={header} ref={(el) => { this.dt = el; }} style={{ marginBottom: '20px' }} responsive={true} autoLayout={true} >
                        <Column field="id" header="ID" sortable={true} />
                        <Column field="name" header="Name" sortable filter filterPlaceholder="Search by name" />
                        <Column field="laundrystatus" header="Bag Status" sortable={true} body={this.statusBodyTemplate} />
                        <Column field="res-hall" header="Residential Hall" sortable={true} />
                    </DataTable>
                </div>

                {/* </div> */}
            </div>
        );
    }
}

// selectionMode = "single" selection = { this.state.selectedCar } onSelectionChange = {(e) => this.setState({ selectedCar: e.value })}
