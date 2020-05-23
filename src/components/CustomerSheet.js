import React, { Component } from 'react';
import { CarService } from '../service/CarService';
import { Panel } from 'primereact/panel';
import { Checkbox } from 'primereact/checkbox';
import { Button } from 'primereact/button';
import { Dropdown } from 'primereact/dropdown';
import { InputText } from 'primereact/inputtext';
import { Chart } from 'primereact/chart';
import { DataTable } from 'primereact/datatable';
import { Column } from 'primereact/column';
import { FullCalendar } from 'primereact/fullcalendar';
import dayGridPlugin, { DayBgRow } from '@fullcalendar/daygrid';
import interactionPlugin from '@fullcalendar/interaction';
import timeGridPlugin from '@fullcalendar/timegrid';

import firebase from 'firebase/app';
import 'firebase/database';


import customerData from '../customers.json'
// import classNames from 'classnames';

import '../Dashboard.css';
//import { arrayToHash } from '@fullcalendar/core/util/object';


export class CustomerSheet extends Component {

    constructor() {
        super();

        this.state = {
            customers: customerData
        };
        this.export = this.export.bind(this);
    }

    statusBodyTemplate(rowData) {
        return <span className={rowData.laundrystatus}>{rowData.laundrystatus}</span>;
    }

    export() {
     this.dt.exportCSV();
 }
    render() {
        const customerArray = [];
        const customerInfo = firebase.database().ref('/customers').on('value', function(snapshot) {
            snapshot.forEach(function(childSnapshot) {
                customerArray.push(childSnapshot.toJSON());
            });
      });

    
      var header = <div style={{textAlign:'left'}}>
          <Button type="button" icon="pi pi-external-link" iconPos="left" label="CSV" onClick={this.export}>
          </Button>
          </div>;
        return (
            <div>

                    <div className="card">

                        <h1 style={{ fontSize: '16px' }}>Customer Database</h1>
                        <DataTable value={customerArray} header={header} ref={(el) => { this.dt = el; }} style={{ marginBottom: '20px' }} responsive={true} autoLayout={true} >
                            <Column field= "id" header="ID" sortable={true} />
                            <Column field="name" header="Name" sortable filter filterPlaceholder="Search by name" />
                            <Column field="email" header="Email" sortable={true} />
                            <Column field="phone" header="Phone" sortable={true} />
                            <Column field="laundrystatus" header="Bag Status" sortable={true} body={this.statusBodyTemplate}/>
                        </DataTable>
                        </div>

                {/* </div> */}
            </div>
        );
    }
}

// selectionMode = "single" selection = { this.state.selectedCar } onSelectionChange = {(e) => this.setState({ selectedCar: e.value })}
