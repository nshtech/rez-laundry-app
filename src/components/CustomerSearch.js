import React, { Component } from 'react';
import { Button } from 'primereact/button';
import { Dropdown } from 'primereact/dropdown';
import { DataTable } from 'primereact/datatable';
import { Column } from 'primereact/column'
import { Chart } from 'primereact/chart'
import { InputText } from 'primereact/inputtext';
import { Growl } from 'primereact/growl';

import firebase from 'firebase/app';
import 'firebase/database';

import validator from 'validator'


import customerData from '../customers.json';
// import classNames from 'classnames';

import '../Dashboard.css';
//import { arrayToHash } from '@fullcalendar/core/util/object';


export class CustomerSearch extends Component {

    constructor() {
        super();
        this.state = {
            customers: [],
            selectedStatus: null,
            editing: false,
            selectedCustomer: null
        };
        this.onStatusFilterChange = this.onStatusFilterChange.bind(this);
    }

    /* --------------- Filters ---------------- */
    statusBodyTemplate(rowData) {
        return <span className={rowData.laundrystatus}>{rowData.laundrystatus.replace(/-/g, ' ')}</span>;
    }

    renderStatusFilter() {
        var statuses = [
            { label: 'Picked Up', value: 'picked-up' },
            { label: 'Out of Service', value: 'out-of-service' },
            { label: 'Delivered to SH', value: 'delivered-to-SH' },
            { label: 'Delivered to Dorm', value: 'delivered-to-dorm' },
            { label: 'Bag Missing', value: 'bag-missing' }
        ];
        return (
            <Dropdown value={this.state.selectedStatus} options={statuses} onChange={this.onStatusFilterChange}
                showClear={true} placeholder="Select a Status" className="p-column-filter" />
        );
    }

    onStatusFilterChange(event) {
        this.dt.filter(event.value, 'laundrystatus', 'equals');
        this.setState({ selectedStatus: event.value });
    }

    componentDidMount() {
        const customerArray = [];
        firebase.database().ref('/customers').on('value', function (snapshot) {
            snapshot.forEach(function (childSnapshot) {
                customerArray.push(childSnapshot.toJSON());
            });
            console.log(customerArray)
            console.log(customerArray[0])
        });
        this.setState({ customers: customerArray });
    }

    render() {
        const statusFilter = this.renderStatusFilter();
        const data = {
            labels: ['January', 'February', 'March', 'April', 'May', 'June', 'July'],
            datasets: [
                {
                    label: 'First Dataset',
                    data: [65, 59, 80, 81, 56, 55, 40],
                    fill: false,
                    backgroundColor: '#42A5F5',
                    borderColor: '#42A5F5'
                },
                {
                    label: 'Second Dataset',
                    data: [28, 48, 40, 19, 86, 27, 90],
                    fill: false,
                    backgroundColor: '#66BB6A',
                    borderColor: '#66BB6A'
                }
            ]
        };
        if (this.state.selectedCustomer) {
            var header = <div style={{ textAlign: 'left' }}></div>
            var customer = this.state.selectedCustomer
            return (
                <div style={{display: 'flex'}}>
                    <div className="card card-search">
                        <DataTable value={this.state.customers} ref={(el) => { this.dt = el; }} style={{ marginBottom: '20px' }} selectionMode="single"
                            responsive={true} autoLayout={true} selection={this.state.selectedCustomer} onSelectionChange={e => this.setState({ selectedCustomer: e.value })}>
                            <Column field="id" header="ID" sortable={true} />
                            <Column field="name" header="Name" sortable filter filterPlaceholder="Search by name" />
                        </DataTable>
                    </div>
                    <div className="card card-list">
                        <h1>{customer.name}</h1>
                        <div style={{ display: 'flex' }}>
                            <h3 style={{ paddingRight: 5 }}>Customer ID:  </h3><p style={{ paddingTop: 4, paddingRight: 15 }}>{customer.id}</p>
                            <h3 style={{ paddingRight: 5 }}>Email: </h3><p style={{ paddingTop: 4, paddingRight: 15 }}>{customer.email}</p>
                            <h3 style={{ paddingRight: 5 }}>Phone: </h3><p style={{ paddingTop: 4, paddingRight: 15 }}>{customer.phone}</p>
                        </div>
                        <div style={{ display: 'flex' }}>
                            <h3 style={{ paddingRight: 5 }}>Residential Hall:  </h3><p style={{ paddingTop: 4, paddingRight: 15 }}>{customer.reshall}</p>
                            <h3 style={{ paddingRight: 5 }}>Laundry Plan: </h3><p style={{ paddingTop: 4, paddingRight: 15 }}>{customer.plan}</p>
                        </div>
                        <h3>Bag Weight History</h3>
                        <Chart type="line" data={data} />
                    </div>
                </div>
            );
        } else {
            var header = <div style={{ textAlign: 'left' }}>
            </div>;
    
            return (
                <div style={{ display: 'flex' }}>
                    <div className="card card-search">
                        <DataTable value={this.state.customers} ref={(el) => { this.dt = el; }} style={{ marginBottom: '20px' }} selectionMode="single"
                        responsive={true} autoLayout={true} selection={this.state.selectedCustomer} onSelectionChange={e => this.setState({ selectedCustomer: e.value })}>
                            <Column field="id" header="ID" sortable={true} />
                            <Column field="name" header="Name" sortable filter filterPlaceholder="Search by name" />
                        </DataTable>
                    </div>
                    <div className="card card-list">
                        <h1>Select a Customer</h1>
                    </div>
                </div>
            );
        }

    
    }
}