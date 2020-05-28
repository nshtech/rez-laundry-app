import React, { Component } from 'react';
import { Button } from 'primereact/button';
import { Dropdown } from 'primereact/dropdown';
import { DataTable } from 'primereact/datatable';
import { Column } from 'primereact/column'
import { InputText } from 'primereact/inputtext';
import { Growl } from 'primereact/growl';

import firebase from 'firebase/app';
import 'firebase/database';

import validator from 'validator' 


import customerData from '../customers.json';
// import classNames from 'classnames';

import '../Dashboard.css';
//import { arrayToHash } from '@fullcalendar/core/util/object';


export class CustomerSheet extends Component {

    constructor() {
        super();
        this.state = {
            customers: [],
            selectedStatus: null,
            editing: false
        };
        this.edit = this.edit.bind(this);
        this.save = this.save.bind(this);
        this.export = this.export.bind(this);
        this.onStatusFilterChange = this.onStatusFilterChange.bind(this);
        
        this.generalEditor = this.generalEditor.bind(this);
    }
    export() {
        this.dt.exportCSV();
    }

/* --------------- Editing ---------------- */  
    edit() {
        this.setState({editing: true});
        this.growl.show({ severity: 'info', summary: 'Editing Enabled', detail: 'Save changes before continuing' });
    }

    save() {
        this.setState({ editing: false });
        this.growl.clear();
    }

    onEditorValueChange(props, value) {
        firebase.database().ref('/customers/' + props.rowData.id + '/' + props.field).set(value)
        let updatedCars = [...props.value];
        updatedCars[props.rowIndex][props.field] = value;
        this.setState({ customers: updatedCars });
        console.log(props)
    }

    inputTextEditor(props, field) {
        return <InputText type="text" onChange={(e) => this.onEditorValueChange(props, e.target.value)} />;
    }

    generalEditor(props) {
        return this.inputTextEditor(props, ' ');
    }
    phoneValidator(props) {
        let value = props.rowData[props.field]
        return value[3] === '-' && value.length === 12;
    }
    emailValidator(props) {
        let value = props.rowData[props.field]
        return value && value.length > 0;
    }

/* --------------- Filters ---------------- */
    statusBodyTemplate(rowData) {
        return <span className={rowData.laundrystatus}>{rowData.laundrystatus.replace(/-/g, ' ')}</span>;
    }

    renderStatusFilter() {
        var statuses =  [
            {label: 'Picked Up', value: 'picked-up'},
            {label: 'Out of Service', value: 'out-of-service'},
            {label: 'Delivered to SH', value: 'delivered-to-SH'},
            {label: 'Delivered to Dorm', value: 'delivered-to-dorm'},
            {label: 'Bag Missing', value: 'bag-missing'}
                ];
        return (
            <Dropdown value={this.state.selectedStatus} options={statuses} onChange={this.onStatusFilterChange}
                        showClear={true} placeholder="Select a Status" className="p-column-filter" />
        );
    }

    onStatusFilterChange(event) {
        this.dt.filter(event.value, 'laundrystatus', 'equals');
        this.setState({selectedStatus: event.value});
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

/* --------------- RETURN ---------------- */
/* ---------------- edit mode ------------*/
    if (this.state.editing) {
        var header = <div style={{ textAlign: 'left' }}>
            <Button type="button" style={{ backgroundColor: '#6a09a4', borderColor: '#6a09a4', marginRight: 10 }} icon="pi pi-external-link" iconPos="left" label="CSV" onClick={this.export}>
            </Button>
            <Button type="button" style={{ color: '#6a09a4', backgroundColor: 'white', borderColor: '#6a09a4', marginRight: 10 }} icon="pi pi-pencil" iconPos="left" label="EDIT">
            </Button>
            <Button type="button" style={{ backgroundColor: '#6a09a4', borderColor: '#6a09a4', marginRight: 10 }} icon="pi pi-save" iconPos="left" label="SAVE" onClick={this.save}>
            </Button>

        </div>;
        return (
            <div>
                <Growl ref={(el) => this.growl = el} sticky={true} />
                <div className="card">
                    <h1 style={{ fontSize: '16px' }}>Customer Database</h1>
                    <DataTable value={this.state.customers} header={header} ref={(el) => { this.dt = el; }} style={{ marginBottom: '20px'}} responsive={true} autoLayout={true} editMode="row" rowEditorValidator={this.onRowEditorValidator} onRowEditInit={this.onRowEditInit} onRowEditSave={this.onRowEditSave} onRowEditCancel={this.onRowEditCancel}>
                        <Column field="id" header="ID" sortable={true} />
                        <Column field="name" header="Name" sortable filter filterPlaceholder="Search by name" />
                        <Column field="email" header="Edit email" sortable={true} style={{ color: 'blue' }} editor={this.generalEditor} editorValidator={this.emailValidator} />
                        <Column field="phone" header="Edit phone" sortable={true} style={{ color: 'blue' }} editor={this.generalEditor} editorValidator={this.phoneValidator}/>
                        <Column field="laundrystatus" header="Bag Status" sortable={true} filter filterElement={statusFilter} body={this.statusBodyTemplate} />
                    </DataTable>
                </div>
            </div>
        );
/* ---------------- NOT edit mode ------------*/
    } else {
        var header = <div style={{ textAlign: 'left' }}>
            <Button type="button" style={{ backgroundColor: '#6a09a4', borderColor: '#6a09a4', marginRight: 10 }} icon="pi pi-external-link" iconPos="left" label="CSV" onClick={this.export}>
            </Button>
            <Button type="button" style={{ backgroundColor: '#6a09a4', borderColor: '#6a09a4', marginRight: 10 }} icon="pi pi-pencil" iconPos="left" label="EDIT" onClick={this.edit}>
            </Button>
            <Button type="button" style={{ color: '#6a09a4', backgroundColor: 'white', borderColor: '#6a09a4', marginRight: 10 }} icon="pi pi-save" iconPos="left" label="SAVE">
            </Button>
        </div>;
        return (
            <div>
                <Growl ref={(el) => this.growl = el} />
                <div className="card">
                    <h1 style={{ fontSize: '16px' }}>Customer Database</h1>
                    <DataTable value={this.state.customers} header={header} ref={(el) => { this.dt = el; }} style={{ marginBottom: '20px' }} responsive={true} autoLayout={true} editMode="row" rowEditorValidator={this.onRowEditorValidator} onRowEditInit={this.onRowEditInit} onRowEditSave={this.onRowEditSave} onRowEditCancel={this.onRowEditCancel}>
                        <Column field="id" header="ID" sortable={true} />
                        <Column field="name" header="Name" sortable filter filterPlaceholder="Search by name"/>
                        <Column field="email" header="Email" sortable={true} />
                        <Column field="phone" header="Phone" sortable={true} />
                        <Column field="laundrystatus" header="Bag Status" sortable={true} filter filterElement={statusFilter} body={this.statusBodyTemplate} />
                    </DataTable>
                </div>
            </div>
        );

        }
    }
}