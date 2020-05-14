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
import dayGridPlugin from '@fullcalendar/daygrid';
import interactionPlugin from '@fullcalendar/interaction';
import timeGridPlugin from '@fullcalendar/timegrid';

import customerData from '../customers.json'
// import classNames from 'classnames';

import '../Dashboard.css';

export class CustomerSheet extends Component {

    constructor() {
        super();

        this.state = {
            customers: customerData
        };

    }

    statusBodyTemplate(rowData) {
        return <span className={rowData.laundrystatus}>{rowData.laundrystatus}</span>;
    }

    render() {
        return (
            <div>
                {/* <div className="p-col-12 p-lg-6"> */}
                    <div className="card">
                        <h1 style={{ fontSize: '16px' }}>Active Customers</h1>
                        <DataTable value={this.state.customers} style={{ marginBottom: '20px' }} responsive={true} autoLayout={true}>
                            <Column field="id" header="ID" sortable={true} />
                            <Column field="name" header="Name" sortable={true} />
                            <Column field="email" header="Email" sortable={true} />
                            <Column field="phone" header="Phone" sortable={true} />
                            <Column header="Bag Status" body={this.statusBodyTemplate}/>
                        </DataTable>
                    </div>
                {/* </div> */}
            </div>
        );
    }
}
// selectionMode = "single" selection = { this.state.selectedCar } onSelectionChange = {(e) => this.setState({ selectedCar: e.value })}